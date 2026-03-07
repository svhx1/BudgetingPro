"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 5;

export async function loginUser(email: string, password: string, stayLoggedIn: boolean = false) {
    if (!email || !email.includes("@")) return { success: false, error: "Email inválido" };
    if (!password || password.length < 4) return { success: false, error: "Senha deve ter pelo menos 4 caracteres" };

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return { success: false, error: "Conta não encontrada. Crie uma conta primeiro." };
        }

        if (!user.password) {
            return { success: false, error: "Esta conta não possui senha. Crie uma nova conta." };
        }

        // Check lockout
        if (user.lockedUntil && new Date() < user.lockedUntil) {
            const remainingMs = user.lockedUntil.getTime() - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            return { success: false, error: `Conta bloqueada. Tente novamente em ${remainingMin} minuto${remainingMin > 1 ? 's' : ''}.` };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            const newAttempts = (user.failedAttempts || 0) + 1;

            if (newAttempts >= MAX_ATTEMPTS) {
                // Lock the account
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        failedAttempts: newAttempts,
                        lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
                    },
                });
                return { success: false, error: `Senha incorreta. Conta bloqueada por ${LOCKOUT_MINUTES} minutos.` };
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { failedAttempts: newAttempts },
            });

            const remaining = MAX_ATTEMPTS - newAttempts;
            return { success: false, error: `Senha incorreta. ${remaining} tentativa${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.` };
        }

        // Success — reset attempts
        await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
        });

        const cookieStore = await cookies();
        cookieStore.set("budgeting_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: stayLoggedIn ? 60 * 60 * 24 * 90 : 60 * 60 * 24 * 1,
            path: "/",
        });

        return { success: true };
    } catch (e) {
        console.error("Erro no login:", e);
        return { success: false, error: "Erro interno no servidor." };
    }
}

export async function registerUser(name: string, email: string, password: string) {
    if (!email || !email.includes("@")) return { success: false, error: "Email inválido" };
    if (!name || name.trim().length < 2) return { success: false, error: "Nome deve ter pelo menos 2 caracteres" };
    if (!password || password.length < 4) return { success: false, error: "Senha deve ter pelo menos 4 caracteres" };

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return { success: false, error: "Este email já está cadastrado. Faça login." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, name: name.trim(), password: hashedPassword },
        });

        const cookieStore = await cookies();
        cookieStore.set("budgeting_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 90,
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
