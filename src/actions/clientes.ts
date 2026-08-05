"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { parseDateOnly } from "@/lib/format";

function toNumber(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createCliente(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório.");

  const contato = String(formData.get("contato") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const valorMensal = toNumber(formData.get("valorMensal"));
  const diaVencimentoRaw = formData.get("diaVencimento");
  const diaVencimento = diaVencimentoRaw ? Math.min(31, Math.max(1, Math.round(toNumber(diaVencimentoRaw)))) : null;

  let slug = slugify(nome);
  const existing = await prisma.cliente.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const cliente = await prisma.cliente.create({
    data: { nome, slug, contato, email, valorMensal, diaVencimento },
  });

  redirect(`/clientes/${cliente.id}`);
}

export async function updateDadosCliente(clienteId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório.");

  const contato = String(formData.get("contato") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const valorMensal = toNumber(formData.get("valorMensal"));
  const diaVencimentoRaw = formData.get("diaVencimento");
  const diaVencimento = diaVencimentoRaw ? Math.min(31, Math.max(1, Math.round(toNumber(diaVencimentoRaw)))) : null;

  await prisma.cliente.update({
    where: { id: clienteId },
    data: { nome, contato, email, valorMensal, diaVencimento },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/");
}

export async function updateBriefing(clienteId: string, formData: FormData) {
  const nicho = String(formData.get("nicho") ?? "").trim();
  const publicoAlvo = String(formData.get("publicoAlvo") ?? "").trim();
  const oferta = String(formData.get("oferta") ?? "").trim();
  const orcamentoMensal = toNumber(formData.get("orcamentoMensal"));
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  await prisma.briefing.upsert({
    where: { clienteId },
    update: { nicho, publicoAlvo, oferta, orcamentoMensal, observacoes },
    create: { clienteId, nicho, publicoAlvo, oferta, orcamentoMensal, observacoes },
  });

  revalidatePath(`/clientes/${clienteId}`);
}

export async function addPagamento(clienteId: string, formData: FormData) {
  const referencia = String(formData.get("referencia") ?? "").trim();
  const valor = toNumber(formData.get("valor"));
  const dataVencimentoRaw = String(formData.get("dataVencimento") ?? "").trim();
  const dataVencimento = dataVencimentoRaw ? parseDateOnly(dataVencimentoRaw) : null;

  await prisma.pagamento.create({
    data: { clienteId, referencia, valor, status: "PENDENTE", dataVencimento },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/agenda");
}

export async function marcarPagamento(clienteId: string, pagamentoId: string, status: "PAGO" | "PENDENTE" | "ATRASADO") {
  await prisma.pagamento.update({
    where: { id: pagamentoId },
    data: { status, dataPagamento: status === "PAGO" ? new Date() : null },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/agenda");
}
