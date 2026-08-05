"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { LEAD_ENVIADO_COOKIE } from "@/lib/auth";

export async function createLead(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const contato = String(formData.get("contato") ?? "").trim();
  const origem = String(formData.get("origem") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();
  const publico = formData.get("publico") === "1";

  if (!nome) throw new Error("Nome é obrigatório.");
  if (publico && !contato) throw new Error("Contato é obrigatório.");

  if (contato) {
    const existente = await prisma.lead.findFirst({
      where: { contato: { equals: contato, mode: "insensitive" } },
    });
    if (existente) {
      if (publico) {
        const cookieStore = await cookies();
        cookieStore.set(LEAD_ENVIADO_COOKIE, "1", {
          maxAge: 60 * 60 * 24 * 365,
          path: "/leads",
        });
        redirect("/leads");
      }
      revalidatePath("/leads");
      return;
    }
  }

  await prisma.lead.create({
    data: { nome, contato, origem, observacoes },
  });

  if (publico) {
    const cookieStore = await cookies();
    cookieStore.set(LEAD_ENVIADO_COOKIE, "1", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/leads",
    });
    redirect("/leads");
  }

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
