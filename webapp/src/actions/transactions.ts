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
    paymentMethod?: "DEBIT" | "CREDIT";
};

export async function createTransaction(data: TransactionInput) {
    try {
        const userId = await getCurrentUserId();
        const {
            description, amount, type, date, categoryId, recurrence, installments, paymentMethod
        } = data;

        const baseDate = new Date(date);
        const originalDay = baseDate.getDate();

        // Advance month preserving end-of-month logic:
        // If original day is 31 but target month has 30 days, use day 30, etc.
        function advanceMonth(base: Date, months: number): Date {
            const d = new Date(base);
            const targetMonth = d.getMonth() + months;
            d.setMonth(targetMonth, 1); // go to day 1 of target month
            const lastDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(originalDay, lastDayOfMonth));
            return d;
        }

        if (recurrence === "unico") {
            await prisma.transaction.create({
                data: {
                    description,
                    amount,
                    type,
                    date: baseDate,
                    categoryId,
                    userId,
                    paymentMethod: type === "EXPENSE" ? (paymentMethod || "DEBIT") : null,
                },
            });
        }

        else if (recurrence === "parcelado" && installments) {
            const groupId = crypto.randomUUID();
            const installmentAmount = amount / installments;

            const transactions = Array.from({ length: installments }).map((_, i) => {
                const nextDate = advanceMonth(baseDate, i);

                return {
                    description: `${description} (${i + 1}/${installments})`,
                    amount: parseFloat(installmentAmount.toFixed(2)),
                    type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: `${i + 1}/${installments}`,
                    paymentMethod: type === "EXPENSE" ? (paymentMethod || "DEBIT") : null,
                };
            });

            await prisma.transaction.createMany({ data: transactions });
        }

        else if (recurrence === "fixo") {
            const groupId = crypto.randomUUID();
            const transactions = Array.from({ length: 12 }).map((_, i) => {
                const nextDate = advanceMonth(baseDate, i);

                return {
                    description,
                    amount,
                    type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: "Fixo",
                    paymentMethod: type === "EXPENSE" ? (paymentMethod || "DEBIT") : null,
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
