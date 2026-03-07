"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/session";

export type TransactionInput = {
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    categoryId: string;
    recurrence: "unico" | "parcelado" | "fixo";
    installments?: number;
};

export async function createTransaction(data: TransactionInput) {
    try {
        const userId = await getCurrentUserId();
        const {
            description, amount, type, date, categoryId, recurrence, installments
        } = data;

        const baseDate = new Date(date);

        if (recurrence === "unico") {
            await prisma.transaction.create({
                data: {
                    description,
                    amount,
                    type,
                    date: baseDate,
                    categoryId,
                    userId,
                },
            });
        }

        else if (recurrence === "parcelado" && installments) {
            const groupId = crypto.randomUUID();
            const installmentAmount = amount / installments;

            const transactions = Array.from({ length: installments }).map((_, i) => {
                const nextDate = new Date(baseDate);
                nextDate.setMonth(nextDate.getMonth() + i);

                return {
                    description: `${description} (${i + 1}/${installments})`,
                    amount: parseFloat(installmentAmount.toFixed(2)),
                    type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: `${i + 1}/${installments}`,
                };
            });

            await prisma.transaction.createMany({ data: transactions });
        }

        else if (recurrence === "fixo") {
            const groupId = crypto.randomUUID();
            const transactions = Array.from({ length: 12 }).map((_, i) => {
                const nextDate = new Date(baseDate);
                nextDate.setMonth(nextDate.getMonth() + i);

                return {
                    description,
                    amount,
                    type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: "Fixo"
                };
            });

            await prisma.transaction.createMany({ data: transactions });
        }

        revalidatePath("/history");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error("Erro ao criar transação:", error);
        return { success: false, error: "Falha ao registrar lançamento" };
    }
}

export async function deleteTransaction(id: string) {
    try {
        await prisma.transaction.delete({
            where: { id }
        });
        revalidatePath("/history");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar transação:", error);
        return { success: false, error: "Falha ao deletar transação" };
    }
}
