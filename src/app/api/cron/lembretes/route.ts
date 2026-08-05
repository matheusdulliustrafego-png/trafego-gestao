import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarLembreteReuniao } from "@/lib/email";

export const dynamic = "force-dynamic";

function amanhaUTC(): { inicio: Date; fim: Date } {
  const hoje = new Date();
  const inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 1));
  const fim = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate() + 2));
  return { inicio, fim };
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const { inicio, fim } = amanhaUTC();

  const reunioes = await prisma.reuniao.findMany({
    where: {
      data: { gte: inicio, lt: fim },
      lembreteEnviado: false,
      cliente: { email: { not: "" } },
    },
    include: { cliente: true },
  });

  const resultados: { id: string; enviado: boolean; erro?: string }[] = [];

  for (const reuniao of reunioes) {
    if (!reuniao.cliente?.email) continue;
    try {
      await enviarLembreteReuniao({
        paraEmail: reuniao.cliente.email,
        paraNome: reuniao.cliente.nome,
        titulo: reuniao.titulo,
        data: reuniao.data,
        observacoes: reuniao.observacoes,
      });
      await prisma.reuniao.update({
        where: { id: reuniao.id },
        data: { lembreteEnviado: true },
      });
      resultados.push({ id: reuniao.id, enviado: true });
    } catch (err) {
      resultados.push({ id: reuniao.id, enviado: false, erro: String(err) });
    }
  }

  return NextResponse.json({ verificadas: reunioes.length, resultados });
}
