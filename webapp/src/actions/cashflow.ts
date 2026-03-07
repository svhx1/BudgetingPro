"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { unstable_cache } from "next/cache";

export type CashflowPeriod = "15d" | "30d" | "60d" | "month";

async function fetchCashflowData(userId: string, period: CashflowPeriod, year: number) {
    if (period === "month") {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const results = [];

        for (let m = 0; m < 12; m++) {
            const start = new Date(year, m, 1);
            const end = new Date(year, m + 1, 0, 23, 59, 59);

            const txs = await prisma.transaction.findMany({
                where: { userId, date: { gte: start, lte: end } }
            });

            const income = txs.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
            const expense = txs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

            results.push({
                label: months[m],
                income,
                expense,
                balance: income - expense,
            });
        }

        return results;
    }

    const days = period === "15d" ? 15 : period === "30d" ? 30 : 60;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);

    const txs = await prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: now } }
    });

    const bucketDays = period === "15d" ? 3 : period === "30d" ? 5 : 10;
    const bucketCount = Math.ceil(days / bucketDays);
    const results = [];

    for (let i = 0; i < bucketCount; i++) {
        const bStart = new Date(start);
        bStart.setDate(bStart.getDate() + i * bucketDays);
        const bEnd = new Date(bStart);
        bEnd.setDate(bEnd.getDate() + bucketDays - 1);
        bEnd.setHours(23, 59, 59);

        const label = `${bStart.getDate()}/${bStart.getMonth() + 1}`;

        const bucketTxs = txs.filter(t => {
            const d = new Date(t.date);
            return d >= bStart && d <= bEnd;
        });

        const income = bucketTxs.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
        const expense = bucketTxs.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

        results.push({ label, income, expense, balance: income - expense });
    }

    return results;
}

export async function getCashflowData(period: CashflowPeriod, year: number) {
    try {
        const userId = await getCurrentUserId();

        const getCachedCashflow = unstable_cache(
            () => fetchCashflowData(userId, period, year),
            [`cashflow-${userId}-${period}-${year}`],
            { revalidate: 30, tags: [`user-${userId}`] }
        );

        const data = await getCachedCashflow();

        return { success: true, data };
    } catch (error) {
        console.error("Erro cashflow:", error);
        return { success: false, data: [] };
    }
}
