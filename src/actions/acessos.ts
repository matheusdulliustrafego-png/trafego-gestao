"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addAcesso(clienteId: string, formData: FormData) {
  const plataforma = String(formData.get("plataforma") ?? "").trim();
  const login = String(formData.get("login") ?? "").trim();
  const senha = String(formData.get("senha") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!plataforma) throw new Error("Plataforma é obrigatória.");

  await prisma.acesso.create({
    data: { clienteId, plataforma, login, senha, observacoes },
  });

  revalidatePath(`/clientes/${clienteId}`);
}

export async function deleteAcesso(clienteId: string, acessoId: string) {
  await prisma.acesso.delete({ where: { id: acessoId } });
  revalidatePath(`/clientes/${clienteId}`);
}
