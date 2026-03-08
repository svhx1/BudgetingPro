"use server";

import { prisma } from "@/lib/prisma";
import { getLoggedUserId } from "@/actions/auth";

export interface RecurringSummary {
    totalRecurring: number;
    totalIncome: number;
    percentageOfIncome: number;
    recurringTransactions: Array<{
        id: string;
        description: string;
        amount: number;
        date: Date;
        installment: string | null;
        category: {
            name: string;
            color: string;
            id: string;
        };
    }>;
}

export async function getRecurringData(month: number, year: number) {
    try {
        const userId = await getLoggedUserId();
        if (!userId) {
            return { success: false, error: "Não autorizado" };
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // 1. Busca TODAS as entradas do mês para base de cálculo de %
        const incomes = await prisma.transaction.aggregate({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
                type: "INCOME"
            },
            _sum: { amount: true }
        });

        // 2. Busca rigorosamente apenas Despesas com groupId (Recorrente) ou installment (Parcelado)
        const recurringTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
                type: "EXPENSE",
                OR: [
                    { groupId: { not: null } },
                    { installment: { not: null } }
                ]
            },
            include: {
                category: {
                    select: { name: true, color: true, id: true }
                }
            },
            orderBy: { date: "desc" }
        });

        const totalIncome = incomes._sum.amount || 0;
        const totalRecurring = recurringTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

        // Evitar Infinity / NaN
        const percentageOfIncome = totalIncome > 0 ? (totalRecurring / totalIncome) * 100 : 0;

        const summary: RecurringSummary = {
            totalRecurring,
            totalIncome,
            percentageOfIncome,
            recurringTransactions
        };

        return { success: true, data: summary };
    } catch (error) {
        console.error("Failed to fetch recurring data:", error);
        return { success: false, error: "Falha ao buscar dados recorrentes" };
    }
}
