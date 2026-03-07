"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type AllocationInput = {
    categoryId: string;
    amount: number;
    month: number;
    year: number;
};

// 1. Obter Orçamento de um Mês/Ano Específico
export async function getBudgetAllocations(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();

        // 1. Obter todas as categorias do usuário
        const categories = await prisma.category.findMany({
            where: { userId }
        });

        // 2. Obter alocações daquele mês
        const allocations = await prisma.budgetAllocation.findMany({
            where: { userId, month, year }
        });

        // 3. Calcular gastos reais de cada categoria naquele mês
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const expenses = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: "EXPENSE",
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                amount: true
            }
        });

        // Unir tudo: Array contendo TODAS as categorias, mesmo as que alocado = 0
        const detailedAllocations = categories.map(cat => {
            const alloc = allocations.find(a => a.categoryId === cat.id);
            const allocatedAmount = alloc?.amount || 0;
            const allocId = alloc?.id || null;

            const spentAssoc = expenses.find(e => e.categoryId === cat.id);
            const spent = spentAssoc?._sum.amount || 0;
            const variance = allocatedAmount > 0 ? ((spent - allocatedAmount) / allocatedAmount) * 100 : 0;

            return {
                id: allocId,
                categoryId: cat.id,
                categoryName: cat.name,
                categoryColor: cat.color,
                allocated: allocatedAmount,
                spent: spent,
                remaining: allocatedAmount - spent,
                usagePercentage: allocatedAmount > 0 ? (spent / allocatedAmount) * 100 : 0,
                variance: variance,
            };
        });

        // Ordenar alfabetilalmente
        detailedAllocations.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

        return { success: true, data: detailedAllocations };
    } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
        return { success: false, data: [] };
    }
}

// 2. Definir/Atualizar Alocação
export async function setBudgetAllocation(data: AllocationInput) {
    try {
        const userId = await getCurrentUserId();

        await prisma.budgetAllocation.upsert({
            where: {
                month_year_categoryId_userId: {
                    userId,
                    categoryId: data.categoryId,
                    month: data.month,
                    year: data.year
                }
            },
            update: {
                amount: data.amount
            },
            create: {
                userId,
                categoryId: data.categoryId,
                month: data.month,
                year: data.year,
                amount: data.amount
            }
        });

        revalidatePath("/budget");
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar alocação:", error);
        return { success: false, error: "Falha ao definir orçamento na categoria." };
    }
}

// 3. Obter Total Alocado x Total Receitas (Base Zero)
export async function getZeroBasedSummary(month: number, year: number) {
    try {
        const userId = await getCurrentUserId();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        // Somar todas Incomes do mês
        const incomeAggr = await prisma.transaction.aggregate({
            where: {
                userId,
                type: "INCOME",
                date: { gte: startDate, lte: endDate }
            },
            _sum: { amount: true }
        });
        const totalIncome = incomeAggr._sum.amount || 0;

        // Somar total alocado pelas categorias no mês
        const allocAggr = await prisma.budgetAllocation.aggregate({
            where: { userId, month, year },
            _sum: { amount: true }
        });
        const totalAllocated = allocAggr._sum.amount || 0;

        const unallocated = totalIncome - totalAllocated;

        return { success: true, data: { totalIncome, totalAllocated, unallocated } };
    } catch (error) {
        console.error("Erro ao computar budget summary:", error);
        return { success: false, data: { totalIncome: 0, totalAllocated: 0, unallocated: 0 } };
    }
}
