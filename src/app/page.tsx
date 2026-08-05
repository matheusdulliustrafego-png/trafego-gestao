import Link from "next/link";
import { AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { cpl, formatCurrency, mesReferenciaAtual } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  ENCERRADO: "Encerrado",
};

const STATUS_STYLE: Record<string, string> = {
  ATIVO: "bg-brand-success/15 text-brand-success",
  PAUSADO: "bg-brand-warning/15 text-brand-warning",
  ENCERRADO: "bg-white/10 text-white/50",
};

const PAGAMENTO_STYLE: Record<string, string> = {
  PAGO: "bg-brand-success/15 text-brand-success",
  PENDENTE: "bg-brand-warning/15 text-brand-warning",
  ATRASADO: "bg-brand-danger/15 text-brand-danger",
};

const PAGAMENTO_LABEL: Record<string, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
};

export default async function Home() {
  const mesAtual = mesReferenciaAtual();

  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: {
      pagamentos: { where: { referencia: mesAtual } },
      checagens: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-white">Clientes</h1>
          <p className="mt-1 font-sans text-sm text-white/50">
            {clientes.length} cliente(s) cadastrado(s).
          </p>
        </div>
        <Link
          href="/clientes/novo"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-silver px-5 font-sans text-sm font-medium text-brand-black transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <p className="font-sans text-sm text-white/40">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => {
            const pagamento = cliente.pagamentos[0];
            const checagem = cliente.checagens[0];
            const cplAtual = checagem ? cpl(checagem.investimento, checagem.leads) : null;
            const alertaCpl =
              cliente.cplAlvo != null && cplAtual != null ? cplAtual > cliente.cplAlvo : null;

            return (
              <Link
                key={cliente.id}
                href={`/clientes/${cliente.id}`}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5 transition-colors hover:border-brand-silver/25"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading text-base font-semibold text-white">{cliente.nome}</h2>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 font-sans text-xs font-medium",
                      STATUS_STYLE[cliente.status]
                    )}
                  >
                    {STATUS_LABEL[cliente.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between font-sans text-sm">
                  <span className="text-white/50">Mensalidade</span>
                  <span className="font-medium text-white">{formatCurrency(cliente.valorMensal)}</span>
                </div>

                <div className="flex items-center justify-between font-sans text-sm">
                  <span className="text-white/50">Pagamento deste mês</span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      pagamento ? PAGAMENTO_STYLE[pagamento.status] : "bg-white/10 text-white/40"
                    )}
                  >
                    {pagamento ? PAGAMENTO_LABEL[pagamento.status] : "Não lançado"}
                  </span>
                </div>

                {alertaCpl !== null ? (
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 font-sans text-xs",
                      alertaCpl ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-success/10 text-brand-success"
                    )}
                  >
                    {alertaCpl ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                    CPL atual: {formatCurrency(cplAtual ?? 0)} (meta: {formatCurrency(cliente.cplAlvo ?? 0)})
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
