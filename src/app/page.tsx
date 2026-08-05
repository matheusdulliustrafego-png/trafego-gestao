import Link from "next/link";
import { Plus, Users, Wallet, UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatCurrency, mesReferenciaAtual } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { AnimatedCounter } from "@/components/animated-counter";

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

const ACCENTS = [
  "from-brand-blue to-brand-cyan",
  "from-brand-purple to-brand-pink",
  "from-brand-orange to-brand-pink",
  "from-brand-cyan to-brand-blue",
];

export default async function Home() {
  const mesAtual = mesReferenciaAtual();

  const [clientes, leadsEmAberto] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: { nome: "asc" },
      include: {
        pagamentos: { where: { referencia: mesAtual } },
      },
    }),
    prisma.lead.count({ where: { status: { notIn: ["FECHADO", "PERDIDO"] } } }),
  ]);

  const clientesAtivos = clientes.filter((c) => c.status === "ATIVO").length;
  const mrr = clientes.filter((c) => c.status === "ATIVO").reduce((sum, c) => sum + c.valorMensal, 0);

  const stats = [
    { label: "Clientes ativos", value: clientesAtivos, icon: Users, accent: "from-brand-blue to-brand-cyan" },
    { label: "MRR (mensalidades ativas)", value: mrr, prefix: "R$ ", decimals: 2, icon: Wallet, accent: "from-brand-purple to-brand-pink" },
    { label: "Leads em aberto", value: leadsEmAberto, icon: UserPlus, accent: "from-brand-orange to-brand-pink" },
  ];

  return (
    <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <Reveal>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Clientes</h1>
            <p className="mt-1 font-sans text-sm text-white/50">
              {clientes.length} cliente(s) cadastrado(s).
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <Link
            href="/clientes/novo"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink px-5 font-sans text-sm font-medium text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.6)] transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={0.05 + i * 0.05}>
            <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                  stat.accent
                )}
              >
                <stat.icon className="size-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-heading text-xl font-semibold text-white">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix} decimals={stat.decimals} />
                </p>
                <p className="font-sans text-xs text-white/50">{stat.label}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {clientes.length === 0 ? (
        <p className="font-sans text-sm text-white/40">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente, i) => {
            const pagamento = cliente.pagamentos[0];
            const accent = ACCENTS[i % ACCENTS.length];

            return (
              <Reveal key={cliente.id} delay={0.1 + i * 0.04}>
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="glow-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />

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
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
