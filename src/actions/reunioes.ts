"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/format";

export async function createReuniao(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const dataRaw = String(formData.get("data") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!titulo || !dataRaw) throw new Error("Título e data são obrigatórios.");

  await prisma.reuniao.create({
    data: {
      titulo,
      data: parseDateOnly(dataRaw),
      clienteId: clienteId || null,
      observacoes,
    },
  });

  revalidatePath("/agenda");
}

export async function deleteReuniao(reuniaoId: string) {
  await prisma.reuniao.delete({ where: { id: reuniaoId } });
  revalidatePath("/agenda");
}
