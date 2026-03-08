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

// Sobrecarga de Tipagem para Bypass de Cache do TSLint que ainda não atualizou o Schema pós db push.
type AugmentedTransactionInput = any;
type PrismaMonthlySummaryClient = any;

// HELPER: Sincroniza a tabela de Alta Performance (O(1) Rollup)
async function updateMonthlySummary(userId: string, date: Date, type: "INCOME" | "EXPENSE", amount: number, paymentMethod: string | null | undefined, isDelete = false) {
    const month = date.getUTCMonth() + 1; // 1 to 12
    const year = date.getUTCFullYear();

    const signal = isDelete ? -1 : 1;
    const value = amount * signal;

    const incomeDelta = type === "INCOME" ? value : 0;
    const expenseDelta = type === "EXPENSE" ? value : 0;
    const creditDelta = (type === "EXPENSE" && paymentMethod === "CREDIT") ? value : 0;

    await (prisma as any).monthlySummary.upsert({
        where: {
            userId_month_year: { userId, month, year }
        },
        update: {
            totalIncomes: { increment: incomeDelta },
            totalExpenses: { increment: expenseDelta },
            totalCreditUsed: { increment: creditDelta }
        },
        create: {
            userId,
            month,
            year,
            totalIncomes: incomeDelta > 0 ? incomeDelta : 0,
            totalExpenses: expenseDelta > 0 ? expenseDelta : 0,
            totalCreditUsed: creditDelta > 0 ? creditDelta : 0
        }
    });
}

export async function createTransaction(data: TransactionInput) {
    try {
        const userId = await getCurrentUserId();
        const {
            description, amount, type, date, categoryId, recurrence, installments, paymentMethod
        } = data;

        // Ancorar a data ao Meio-Dia UTC (12h) para imune a qualquer fuso horário mundial (-11 a +12)
        const dateStringSafe = date.includes("T") ? date.split("T")[0] : date;
        const baseDate = new Date(`${dateStringSafe}T12:00:00.000Z`);
        const originalDay = baseDate.getUTCDate();

        // Advance month preserving end-of-month logic UTC safe
        function advanceMonth(base: Date, months: number): Date {
            const d = new Date(base.getTime());
            const targetMonth = d.getUTCMonth() + months;
            d.setUTCMonth(targetMonth, 1);
            const lastDayOfMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
            d.setUTCDate(Math.min(originalDay, lastDayOfMonth));
            return d;
        }

        if (recurrence === "unico") {
            await (prisma as any).transaction.create({
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
            await updateMonthlySummary(userId, baseDate, type, amount, paymentMethod);
        }

        else if (recurrence === "parcelado" && installments) {
            const groupId = crypto.randomUUID();
            const installmentAmount = amount / installments;

            const transactions = Array.from({ length: installments }).map((_, i) => {
                const nextDate = advanceMonth(baseDate, i);
                return {
                    description: `${description} (${i + 1}/${installments})`,
                    amount: parseFloat(installmentAmount.toFixed(2)),
                    type: type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: `${i + 1}/${installments}`,
                    paymentMethod: type === "EXPENSE" ? (paymentMethod || "DEBIT") : null,
                };
            });

            // 1) Insere as transações em lote
            await prisma.transaction.createMany({ data: transactions as any });

            // 2) Sincroniza a Rollup Table Mês a Mês
            await Promise.all(transactions.map(tx =>
                updateMonthlySummary(tx.userId, tx.date, tx.type as "INCOME" | "EXPENSE", tx.amount, tx.paymentMethod)
            ));
        }

        else if (recurrence === "fixo") {
            const groupId = crypto.randomUUID();
            const transactions = Array.from({ length: 12 }).map((_, i) => {
                const nextDate = advanceMonth(baseDate, i);
                return {
                    description,
                    amount,
                    type: type,
                    date: nextDate,
                    categoryId,
                    userId,
                    groupId,
                    installment: "Fixo",
                    paymentMethod: type === "EXPENSE" ? (paymentMethod || "DEBIT") : null,
                };
            });

            // 1) Insere as transações em lote
            await prisma.transaction.createMany({ data: transactions as any });

            // 2) Sincroniza a Rollup Table Mês a Mês
            await Promise.all(transactions.map(tx =>
                updateMonthlySummary(tx.userId, tx.date, tx.type as "INCOME" | "EXPENSE", tx.amount, tx.paymentMethod)
            ));
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
        const tx = await prisma.transaction.findUnique({ where: { id } });
        if (!tx) return { success: false, error: "Transação não encontrada" };

        await prisma.transaction.delete({
            where: { id }
        });

        await updateMonthlySummary(tx.userId, tx.date, tx.type as "INCOME" | "EXPENSE", tx.amount, (tx as any).paymentMethod, true);

        revalidatePath("/history");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar transação:", error);
        return { success: false, error: "Falha ao deletar transação" };
    }
}
