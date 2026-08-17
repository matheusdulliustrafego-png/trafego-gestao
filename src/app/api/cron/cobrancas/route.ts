import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mesReferenciaAtual, parseDateOnly } from "@/lib/format";

export const dynamic = "force-dynamic";

function vencimentoDoMes(diaVencimento: number | null): Date | null {
  if (!diaVencimento) return null;
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(diaVencimento).padStart(2, "0");
  return parseDateOnly(`${ano}-${mes}-${dia}`);
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const referencia = mesReferenciaAtual();

  const clientes = await prisma.cliente.findMany({
    where: { status: "ATIVO" },
    select: { id: true, valorMensal: true, diaVencimento: true },
  });

  const resultados: { clienteId: string; criado: boolean }[] = [];

  for (const cliente of clientes) {
    const existente = await prisma.pagamento.findFirst({
      where: { clienteId: cliente.id, referencia },
      select: { id: true },
    });

    if (existente) {
      resultados.push({ clienteId: cliente.id, criado: false });
      continue;
    }

    await prisma.pagamento.create({
      data: {
        clienteId: cliente.id,
        referencia,
        valor: cliente.valorMensal,
        status: "PENDENTE",
        dataVencimento: vencimentoDoMes(cliente.diaVencimento),
      },
    });
    resultados.push({ clienteId: cliente.id, criado: true });
  }

  revalidatePath("/agenda");
  revalidatePath("/");
  revalidatePath("/financeiro");

  return NextResponse.json({ referencia, verificados: clientes.length, resultados });
}
