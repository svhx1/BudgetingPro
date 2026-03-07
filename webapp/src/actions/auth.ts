"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function loginUser(email: string) {
    if (!email || !email.includes("@")) return { success: false, error: "Email inválido" };

    try {
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { success: false, error: "Conta não encontrada. Crie uma conta primeiro." };
        }

        const cookieStore = await cookies();
        cookieStore.set("budgeting_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        return { success: true };
    } catch (e) {
        console.error("Erro no login:", e);
        return { success: false, error: "Erro interno no servidor." };
    }
}

export async function registerUser(name: string, email: string) {
    if (!email || !email.includes("@")) return { success: false, error: "Email inválido" };
    if (!name || name.trim().length < 2) return { success: false, error: "Nome deve ter pelo menos 2 caracteres" };

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "Este email já está cadastrado. Faça login." };
        }

        const user = await prisma.user.create({
            data: { email, name: name.trim() },
        });

        const cookieStore = await cookies();
        cookieStore.set("budgeting_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        return { success: true };
    } catch (e) {
        console.error("Erro no registro:", e);
        return { success: false, error: "Erro interno no servidor." };
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete("budgeting_user_id");
    redirect("/login");
}

export async function getLoggedUserId() {
    const cookieStore = await cookies();
    return cookieStore.get("budgeting_user_id")?.value;
}
