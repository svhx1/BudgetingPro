"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/session";
import { endOfMonth, startOfMonth } from "date-fns";

export async function getDashboardLimits(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();
        const startDate = startOfMonth(new Date(year, month));
        const endDate = endOfMonth(new Date(year, month));

        const limits = await prisma.budgetLimit.findMany({
            where: { userId },
            include: { category: true }
        });

        const activeLimitsWithSpent = await Promise.all(limits.map(async (lim) => {
            const expenses = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    userId,
                    categoryId: lim.categoryId,
                    type: "EXPENSE",
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });

            return {
                id: lim.id,
                categoryName: lim.category.name,
                color: lim.category.color,
                limitAmount: lim.amount,
                spent: Math.abs(expenses._sum.amount || 0)
            };
        }));

        return { success: true, data: activeLimitsWithSpent };

    } catch (error) {
        console.error("Erro ao calcular limites do budget:", error);
        return { success: false, error: "Falha ao carregar Budget Limits" };
    }
}

export async function upsertLimit(categoryId: string, amount: number) {
    try {
        const userId = await getCurrentUserId();
        await prisma.budgetLimit.upsert({
            where: { categoryId },
            update: { amount },
            create: { userId, categoryId, amount }
        });
        revalidatePath("/settings");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar limite:", error);
        return { success: false, error: "Falha ao salvar Limite" };
    }
}
