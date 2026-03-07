"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function getUpcomingAlerts() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return { success: false, alerts: [] };

        const today = startOfDay(new Date());
        const targetDate = endOfDay(addDays(today, 7));

        // 1. Verificar contas a pagar (Despesas) nos próximos 7 dias
        const upcomingExpenses = await prisma.transaction.findMany({
            where: {
                userId,
                type: "EXPENSE",
                date: {
                    gte: today,
                    lte: targetDate
                }
            },
            include: { category: true },
            orderBy: { date: 'asc' }
        });

        // 2. Verificar variância de orçamentos no mês atual
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const allocations = await prisma.budgetAllocation.findMany({
            where: { userId, month: currentMonth, year: currentYear },
            include: { category: true }
        });

        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        const expensesMonth = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: "EXPENSE",
                date: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
        });

        const alerts: { title: string, message: string, type: 'warning' | 'error' | 'info' }[] = [];

        // Gerar alertas de Vencimento
        upcomingExpenses.forEach(exp => {
            const daysLeft = Math.ceil((exp.date.getTime() - today.getTime()) / (1000 * 3600 * 24));
            alerts.push({
                title: "Vencimento Próximo",
                message: `${exp.description} (${exp.category.name}) vence em ${daysLeft} dia(s).`,
                type: daysLeft <= 2 ? 'error' : 'warning'
            });
        });

        // Gerar alertas de Descrição Vazia
        const emptyDescCount = await prisma.transaction.count({
            where: { userId, description: "" }
        });

        if (emptyDescCount > 0) {
            alerts.push({
                title: "Ajustes Pendentes",
                message: `Você tem ${emptyDescCount} registro(s) no Extrato sem descrição.`,
                type: 'warning'
            });
        }

        // Gerar alertas de Variância (> 80%)
        allocations.forEach(alloc => {
            const spentAssoc = expensesMonth.find(e => e.categoryId === alloc.categoryId);
            const spent = spentAssoc?._sum.amount || 0;
            const usagePercentage = alloc.amount > 0 ? (spent / alloc.amount) * 100 : 0;

            if (usagePercentage >= 100) {
                alerts.push({
                    title: "Estouro de Orçamento",
                    message: `Você ultrapassou o teto de gastos para ${alloc.category.name}.`,
                    type: 'error'
                });
            } else if (usagePercentage >= 80) {
                alerts.push({
                    title: "Alerta de Variância",
                    message: `Você já utilizou ${usagePercentage.toFixed(0)}% do orçamento de ${alloc.category.name}.`,
                    type: 'warning'
                });
            }
        });

        return { success: true, alerts };
    } catch (error) {
        console.error("Erro ao gerar alertas:", error);
        return { success: false, alerts: [] };
    }
}
