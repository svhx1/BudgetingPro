"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/lib/email";

function generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(email: string) {
    if (!email || !email.includes("@")) return { success: false, error: "Email inválido" };

    try {
        // Invalidate previous unused codes for this email
        await prisma.verificationCode.updateMany({
            where: { email, used: false },
            data: { used: true },
        });

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.verificationCode.create({
            data: { email, code, expiresAt },
        });

        const result = await sendVerificationEmail(email, code);

        if (!result.success) {
            return { success: false, error: result.error || "Erro ao enviar email" };
        }

        return { success: true };
    } catch (e) {
        console.error("Erro ao enviar código:", e);
        return { success: false, error: "Erro interno ao enviar código" };
    }
}

export async function verifyCodeAndLogin(email: string, code: string, name?: string) {
    if (!email || !code) return { success: false, error: "Email e código obrigatórios" };

    try {
        const record = await prisma.verificationCode.findFirst({
            where: {
                email,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!record) {
            return { success: false, error: "Código inválido ou expirado" };
        }

        // Mark as used
        await prisma.verificationCode.update({
            where: { id: record.id },
            data: { used: true },
        });

        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                },
            });
        } else if (name && name !== user.name) {
            await prisma.user.update({ where: { id: user.id }, data: { name } });
        }

        // Set auth cookie
        const cookieStore = await cookies();
        cookieStore.set("budgeting_user_id", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
        });

        return { success: true };
    } catch (e) {
        console.error("Erro na verificação:", e);
        return { success: false, error: "Erro ao verificar código" };
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
