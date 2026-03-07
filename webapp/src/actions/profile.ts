"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function getUserProfile() {
    try {
        const userId = await getCurrentUserId();
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return { success: false, error: "Usuário não encontrado" };
        return { success: true, data: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } };
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

export async function uploadAvatar(formData: FormData) {
    try {
        const userId = await getCurrentUserId();
        const file = formData.get("avatar") as File;
        if (!file) return { success: false, error: "Nenhum arquivo enviado" };

        // Validate
        if (file.size > 2 * 1024 * 1024) {
            return { success: false, error: "Imagem deve ter no máximo 2MB" };
        }

        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `avatars/${userId}.${ext}`;

        // Convert File to ArrayBuffer then Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        // Upload to Supabase Storage (upsert — overwrite if exists)
        const { error: uploadError } = await getSupabase().storage
            .from("avatars")
            .upload(filePath, uint8, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return { success: false, error: "Erro ao fazer upload da imagem" };
        }

        // Get public URL
        const { data: urlData } = getSupabase().storage
            .from("avatars")
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl + `?t=${Date.now()}`; // bust cache

        // Save URL to user record
        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: publicUrl },
        });

        return { success: true, url: publicUrl };
    } catch (e) {
        console.error("Erro no upload do avatar:", e);
        return { success: false, error: "Erro interno no upload" };
    }
}
