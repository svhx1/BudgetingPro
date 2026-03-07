import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
    try {
        const { id, description, amount } = await request.json();

        if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

        const updateData: any = {};
        if (description !== undefined) updateData.description = description;
        if (amount !== undefined) updateData.amount = amount;

        await prisma.transaction.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/");
        revalidatePath("/history");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao atualizar transação:", error);
        return NextResponse.json({ error: "Falha ao atualizar" }, { status: 500 });
    }
}
