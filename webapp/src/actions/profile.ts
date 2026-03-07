"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function getUserProfile() {
    try {
        const userId = await getCurrentUserId();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "Usuário não encontrado" };
        return { success: true, data: { id: user.id, name: user.name, email: user.email } };
    } catch (e) {
        console.error("Erro ao buscar perfil:", e);
        return { success: false, error: "Erro ao carregar perfil" };
    }
}

export async function updateUserProfile(name: string) {
    try {
        const userId = await getCurrentUserId();
        await prisma.user.update({ where: { id: userId }, data: { name } });
        return { success: true };
    } catch (e) {
        console.error("Erro ao atualizar perfil:", e);
        return { success: false, error: "Erro ao salvar perfil" };
    }
}
