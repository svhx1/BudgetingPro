"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { unstable_cache } from "next/cache";

async function fetchDashboardSummary(userId: string, month: number, year: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

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

    // Balance only counts transactions up to TODAY
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const pastTransactions = transactions.filter((t: any) => new Date(t.date) <= today);
    const pastIncomes = pastTransactions.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + t.amount, 0);
    const pastExpenses = pastTransactions.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + t.amount, 0);
    const balance = pastIncomes - pastExpenses;

    return { incomes, expenses, balance, transactions };
}

export async function getDashboardSummary(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();

        const getCachedSummary = unstable_cache(
            () => fetchDashboardSummary(userId, month, year),
            [`dashboard-summary-${userId}-${month}-${year}`],
            { revalidate: 30, tags: [`user-${userId}`] }
        );

        const data = await getCachedSummary();

        return { success: true, data };
    } catch (error) {
        console.error("Erro ao buscar resumo do dashboard:", error);
        return { success: false, data: { incomes: 0, expenses: 0, balance: 0, transactions: [] } };
    }
}
