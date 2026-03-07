"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

async function fetchDashboardSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Current month transactions (for entradas/saidas display)
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: { category: true },
        orderBy: { date: 'desc' }
    });

    const incomes = transactions.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + t.amount, 0);
    const expenses = transactions.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + t.amount, 0);

    // ACCUMULATED BALANCE: all transactions from all time up to today
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const allPastTransactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: { lte: today },
        },
        select: { type: true, amount: true },
    });

    const totalIncomes = allPastTransactions.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + t.amount, 0);
    const totalExpenses = allPastTransactions.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + t.amount, 0);
    const balance = totalIncomes - totalExpenses;

    return { incomes, expenses, balance, transactions };
}

export async function getDashboardSummary(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();
        const data = await fetchDashboardSummary(userId, month, year);
        return { success: true, data };
    } catch (error) {
        console.error("Erro ao buscar resumo do dashboard:", error);
        return { success: false, data: { incomes: 0, expenses: 0, balance: 0, transactions: [] } };
    }
}
