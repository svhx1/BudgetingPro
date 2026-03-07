"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/session";

export async function resetDatabase() {
    try {
        const userId = await getCurrentUserId();

        // Deleta BudgetLimits -> Transações -> Categorias nesta ordem para respeitar FK
        await prisma.budgetLimit.deleteMany({ where: { userId } });
        await prisma.transaction.deleteMany({ where: { userId } });
        await prisma.category.deleteMany({ where: { userId } });

        revalidatePath("/");
        revalidatePath("/history");
        revalidatePath("/settings");

        return { success: true };
    } catch (error) {
        console.error("Failed to reset database:", error);
        return { success: false, error: "Falha ao limpar dados." };
    }
}

export async function populateMockDatabase() {
    try {
        const userId = await getCurrentUserId();

        // Limpa antes
        await prisma.budgetLimit.deleteMany({ where: { userId } });
        await prisma.transaction.deleteMany({ where: { userId } });
        await prisma.category.deleteMany({ where: { userId } });

        // Cria categorias
        const cats = await Promise.all([
            prisma.category.create({ data: { name: "Moradia", color: "#3b82f6", userId } }),
            prisma.category.create({ data: { name: "Alimentação", color: "#10b981", userId } }),
            prisma.category.create({ data: { name: "Transporte", color: "#f59e0b", userId } }),
            prisma.category.create({ data: { name: "Lazer", color: "#ec4899", userId } }),
            prisma.category.create({ data: { name: "Receita", color: "#22c55e", userId } }),
        ]);

        const catMap: Record<string, string> = {};
        cats.forEach(c => catMap[c.name] = c.id);

        // Cria limites
        await prisma.budgetLimit.create({ data: { userId, categoryId: catMap["Alimentação"], amount: 1000 } });
        await prisma.budgetLimit.create({ data: { userId, categoryId: catMap["Lazer"], amount: 500 } });
        await prisma.budgetLimit.create({ data: { userId, categoryId: catMap["Transporte"], amount: 600 } });

        // Cria transações
        const mockTransactions = [
            { description: "Salário", amount: 15000, type: "INCOME", categoryId: catMap["Receita"], date: new Date(), userId },
            { description: "Aluguel", amount: 2500, type: "EXPENSE", categoryId: catMap["Moradia"], date: new Date(), userId },
            { description: "Supermercado Extra", amount: 850.50, type: "EXPENSE", categoryId: catMap["Alimentação"], date: new Date(), userId },
            { description: "Uber Eats", amount: 120, type: "EXPENSE", categoryId: catMap["Alimentação"], date: new Date(Date.now() - 86400000), userId },
            { description: "Netflix", amount: 55.90, type: "EXPENSE", categoryId: catMap["Lazer"], date: new Date(Date.now() - 86400000 * 2), userId },
            { description: "Posto Ipiranga", amount: 250, type: "EXPENSE", categoryId: catMap["Transporte"], date: new Date(Date.now() - 86400000 * 3), userId },
            { description: "Rendimento Nubank", amount: 125.40, type: "INCOME", categoryId: catMap["Receita"], date: new Date(Date.now() - 86400000 * 5), userId },
            { description: "Uber", amount: 45, type: "EXPENSE", categoryId: catMap["Transporte"], date: new Date(Date.now() - 86400000 * 1), userId },
            { description: "Cinema", amount: 75, type: "EXPENSE", categoryId: catMap["Lazer"], date: new Date(Date.now() - 86400000 * 4), userId },
            { description: "Freelance", amount: 3000, type: "INCOME", categoryId: catMap["Receita"], date: new Date(Date.now() - 86400000 * 7), userId },
        ];

        await prisma.transaction.createMany({ data: mockTransactions });

        revalidatePath("/");
        revalidatePath("/history");
        revalidatePath("/settings");

        return { success: true };
    } catch (error) {
        console.error("Failed to mock database:", error);
        return { success: false, error: "Falha ao popular transações fictícias." };
    }
}
