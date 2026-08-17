"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/format";

function toNumber(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createDespesa(formData: FormData) {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = toNumber(formData.get("valor"));
  const dataRaw = String(formData.get("data") ?? "").trim();

  if (!descricao) throw new Error("Descrição é obrigatória.");
  if (!dataRaw) throw new Error("Data é obrigatória.");

  await prisma.despesa.create({
    data: { descricao, categoria, valor, data: parseDateOnly(dataRaw) },
  });

  revalidatePath("/financeiro");
}

export async function updateDespesa(despesaId: string, formData: FormData) {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const valor = toNumber(formData.get("valor"));
  const dataRaw = String(formData.get("data") ?? "").trim();

  if (!descricao) throw new Error("Descrição é obrigatória.");
  if (!dataRaw) throw new Error("Data é obrigatória.");

  await prisma.despesa.update({
    where: { id: despesaId },
    data: { descricao, categoria, valor, data: parseDateOnly(dataRaw) },
  });

  revalidatePath("/financeiro");
}

export async function deleteDespesa(despesaId: string) {
  await prisma.despesa.delete({ where: { id: despesaId } });
  revalidatePath("/financeiro");
}
