"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

async function fetchDashboardSummary(userId: string, month: number, year: number) {
    // 1. O(1) MATEMÁTICA RÁPIDA (Via Materialized Rollup Table)
    // Busca a soma instantânea exata pré-calculada do mês
    let incomes = 0;
    let expenses = 0;
    let creditUsed = 0;

    const summary = await (prisma as any).monthlySummary.findUnique({
        where: { userId_month_year: { userId, month: month + 1, year } }
    });

    if (summary) {
        incomes = summary.totalIncomes;
        expenses = summary.totalExpenses;
        creditUsed = summary.totalCreditUsed;
    }

    const monthBalance = incomes - expenses;

    // 2. SALDO HISTÓRICO GLOBAL TOTAL (Continuamos usando _sum mas sem trazer Array pra Memória)
    const today = new Date();
    const pastIncomesAgg = await prisma.transaction.aggregate({
        where: { userId, type: "INCOME", date: { lte: today } },
        _sum: { amount: true }
    });
    const pastExpensesAgg = await prisma.transaction.aggregate({
        where: { userId, type: "EXPENSE", date: { lte: today } },
        _sum: { amount: true }
    });

    const totalIncomes = pastIncomesAgg._sum.amount || 0;
    const totalExpenses = pastExpensesAgg._sum.amount || 0;
    const balance = totalIncomes - totalExpenses;

    // 3. RECUPERAÇÃO LEVE GASTOS RECENTES (Apenas para Listagem Visual na Sidebar)
    const monthStr = (month + 1).toString().padStart(2, '0');
    const startDate = new Date(`${year}-${monthStr}-01T00:00:00.000Z`);
    const endDateObj = new Date(year, month + 1, 0);
    const endDayStr = endDateObj.getDate().toString().padStart(2, '0');
    const endDate = new Date(`${year}-${monthStr}-${endDayStr}T23:59:59.999Z`);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: { gte: startDate, lte: endDate },
        },
        include: { category: true },
        orderBy: { date: 'desc' }
    });

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
