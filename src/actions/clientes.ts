"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

function toNumber(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createCliente(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório.");

  const contato = String(formData.get("contato") ?? "").trim();
  const valorMensal = toNumber(formData.get("valorMensal"));
  const diaVencimentoRaw = formData.get("diaVencimento");
  const diaVencimento = diaVencimentoRaw ? Math.min(31, Math.max(1, Math.round(toNumber(diaVencimentoRaw)))) : null;
  const cplAlvoRaw = formData.get("cplAlvo");
  const cplAlvo = cplAlvoRaw && String(cplAlvoRaw).trim() !== "" ? toNumber(cplAlvoRaw) : null;

  let slug = slugify(nome);
  const existing = await prisma.cliente.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const cliente = await prisma.cliente.create({
    data: { nome, slug, contato, valorMensal, diaVencimento, cplAlvo },
  });

  redirect(`/clientes/${cliente.id}`);
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

  await prisma.pagamento.create({
    data: { clienteId, referencia, valor, status: "PENDENTE" },
  });

  revalidatePath(`/clientes/${clienteId}`);
}

export async function marcarPagamento(clienteId: string, pagamentoId: string, status: "PAGO" | "PENDENTE" | "ATRASADO") {
  await prisma.pagamento.update({
    where: { id: pagamentoId },
    data: { status, dataPagamento: status === "PAGO" ? new Date() : null },
  });

  revalidatePath(`/clientes/${clienteId}`);
}

export async function addCriativo(clienteId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const resultado = String(formData.get("resultado") ?? "NEUTRO") as "BOM" | "NEUTRO" | "RUIM";
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  if (!nome) throw new Error("Nome do criativo é obrigatório.");

  await prisma.criativo.create({
    data: { clienteId, nome, resultado, observacoes },
  });

  revalidatePath(`/clientes/${clienteId}`);
}

export async function addChecagem(clienteId: string, formData: FormData) {
  const investimento = toNumber(formData.get("investimento"));
  const leads = Math.round(toNumber(formData.get("leads")));

  await prisma.checagem.create({
    data: { clienteId, investimento, leads },
  });

  revalidatePath(`/clientes/${clienteId}`);
  revalidatePath("/");
}
