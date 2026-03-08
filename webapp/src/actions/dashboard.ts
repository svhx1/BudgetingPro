"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

async function fetchDashboardSummary(userId: string, month: number, year: number) {
    // Datas seguras em UTC Zero para ignorar fuso horário local
    const monthStr = (month + 1).toString().padStart(2, '0'); // Mês vem 0-11 do frontend
    const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000Z`);

    const endDateObj = new Date(year, month + 1, 0);
    const endDayStr = endDateObj.getDate().toString().padStart(2, '0');
    const endDate = new Date(`${year}-${monthStr}-${endDayStr}T23:59:59.999Z`);

    // Busca apenas as transações do Mês Atual (necessárias pro Array Visual)
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate },
        },
        include: { category: true },
        orderBy: { date: 'desc' }
    });

    let incomes = 0;
    let expenses = 0;
    let creditUsed = 0;

    // Cálculo em memória O(N) apenas do micro-lote mensal
    for (const t of transactions) {
        if (t.type === "INCOME") incomes += t.amount;
        if (t.type === "EXPENSE") {
            expenses += t.amount;
            if ((t as any).paymentMethod === "CREDIT") creditUsed += t.amount;
        }
    }

    const monthBalance = incomes - expenses;

    // SALDO HISTÓRICO GLOBAL (Otimizado via _sum DB-Side)
    const today = new Date();

    // Agregação massiva de Entradas
    const pastIncomesAgg = await prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { lte: today } },
        _sum: { amount: true }
    });

    // Agregação massiva de Saídas
    const pastExpensesAgg = await prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { lte: today } },
        _sum: { amount: true }
    });

    const totalIncomes = pastIncomesAgg._sum.amount || 0;
    const totalExpenses = pastExpensesAgg._sum.amount || 0;
    const balance = totalIncomes - totalExpenses;

    return { incomes, expenses, balance, creditUsed, monthBalance, transactions };
}

export async function getDashboardSummary(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();
        const data = await fetchDashboardSummary(userId, month, year);
        return { success: true, data };
    } catch (error) {
        console.error("Erro ao buscar resumo do dashboard:", error);
        return { success: false, data: { incomes: 0, expenses: 0, balance: 0, creditUsed: 0, monthBalance: 0, transactions: [] } };
    }
}
