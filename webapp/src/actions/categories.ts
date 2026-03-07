"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/session";

export async function getCategories() {
    try {
        const userId = await getCurrentUserId();
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: "asc" }
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("Erro ao puxar categorias:", error);
        return { success: false, error: "Falha ao puxar categorias" };
    }
}

export async function createCategory(name: string, color: string) {
    try {
        const userId = await getCurrentUserId();
        await prisma.category.create({
            data: { userId, name, color }
        });
        revalidatePath("/settings");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        return { success: false, error: "Falha ao criar categoria (pode já existir)" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        });
        revalidatePath("/settings");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        return { success: false, error: "Essa categoria possui transações atreladas" };
    }
}
