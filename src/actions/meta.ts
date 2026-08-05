"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function updateMeta(formData: FormData) {
  const valor = Number(formData.get("valor"));
  if (!Number.isFinite(valor) || valor < 0) throw new Error("Meta inválida.");

  const existente = await prisma.meta.findFirst();

  if (existente) {
    await prisma.meta.update({ where: { id: existente.id }, data: { valor } });
  } else {
    await prisma.meta.create({ data: { valor } });
  }

  revalidatePath("/");
}
