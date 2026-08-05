"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createLead(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const contato = String(formData.get("contato") ?? "").trim();
  const origem = String(formData.get("origem") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!nome) throw new Error("Nome é obrigatório.");

  await prisma.lead.create({
    data: { nome, contato, origem, observacoes },
  });

  revalidatePath("/leads");
}

export async function updateLeadStatus(leadId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "NOVO") as
    | "NOVO"
    | "EM_CONVERSA"
    | "PROPOSTA_ENVIADA"
    | "FECHADO"
    | "PERDIDO";

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });

  revalidatePath("/leads");
}
