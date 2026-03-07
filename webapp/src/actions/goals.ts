"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type GoalInput = {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    monthlyDeposit?: number;
    interestRate?: number;
    deadline?: string | null;
};

// 1. Criar Meta
export async function createGoal(data: GoalInput) {
    try {
        const userId = await getCurrentUserId();

        await prisma.goal.create({
            data: {
                name: data.name,
                targetAmount: data.targetAmount,
                currentAmount: data.currentAmount || 0,
                monthlyDeposit: data.monthlyDeposit || 0,
                interestRate: data.interestRate || 0,
                deadline: data.deadline ? new Date(data.deadline) : null,
                userId
            }
        });

        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar meta:", error);
        return { success: false, error: "Falha ao criar meta." };
    }
}

// 2. Buscar Metas
export async function getGoals() {
    try {
        const userId = await getCurrentUserId();
        const goals = await prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        // Enriquecer dados com cálculos de projeção (M = P * (((1 + i)^n - 1) / i))
        const enrichedGoals = goals.map(goal => {
            const P = goal.monthlyDeposit;
            const i = goal.interestRate / 100; // Taxa (%) convertida para decimal
            const target = goal.targetAmount;
            const current = goal.currentAmount;

            let projectedMonths = 0;
            let projectedDate: Date | null = null;
            const reached = current >= target;

            // Só consegue projetar se não bateu a meta ainda, e se tem depósito mensal
            if (!reached && P > 0) {
                // Cálculo de tempo para atingir o montante com aportes mensais e juros compostos
                // Fórmula base: M = P * (((1+i)^n - 1) / i) + C * (1+i)^n
                // Isolando 'n' (meses): n = ln((M*i + P) / (C*i + P)) / ln(1+i)

                if (i > 0) {
                    const num = (target * i) + P;
                    const den = (current * i) + P;
                    projectedMonths = Math.log(num / den) / Math.log(1 + i);
                } else {
                    // Sem juros, apenas depósitos lineares
                    projectedMonths = (target - current) / P;
                }

                projectedMonths = Math.ceil(projectedMonths);

                // Calcular a data exata
                projectedDate = new Date();
                projectedDate.setMonth(projectedDate.getMonth() + projectedMonths);
            }

            return {
                ...goal,
                progress: Math.min((current / target) * 100, 100),
                isReached: reached,
                projectedMonths,
                projectedDate
            };
        });

        return { success: true, data: enrichedGoals };
    } catch (error) {
        console.error("Erro ao buscar metas:", error);
        return { success: false, error: "Falha ao buscar metas." };
    }
}

// 3. Atualizar Meta
export async function updateGoal(id: string, data: Partial<GoalInput>) {
    try {
        const userId = await getCurrentUserId();

        // Verifica se a meta pertence ao usuário
        const existing = await prisma.goal.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return { success: false, error: "Meta não encontrada." };
        }

        await prisma.goal.update({
            where: { id },
            data: {
                name: data.name,
                targetAmount: data.targetAmount,
                currentAmount: data.currentAmount,
                monthlyDeposit: data.monthlyDeposit,
                interestRate: data.interestRate,
                deadline: data.deadline ? new Date(data.deadline) : null,
            }
        });

        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar meta:", error);
        return { success: false, error: "Falha ao atualizar meta." };
    }
}

// 4. Deletar Meta
export async function deleteGoal(id: string) {
    try {
        const userId = await getCurrentUserId();
        await prisma.goal.deleteMany({
            where: { id, userId }
        });

        revalidatePath("/goals");
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar meta:", error);
        return { success: false, error: "Falha ao deletar meta." };
    }
}
