"use server";

import { cookies } from "next/headers";

export async function getCurrentUserId(): Promise<string> {
    const cookieStore = await cookies();
    const id = cookieStore.get("budgeting_user_id")?.value;
    if (!id) throw new Error("Sessão expirada");
    return id;
}
