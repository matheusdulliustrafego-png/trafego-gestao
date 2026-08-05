import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { FileText, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatCurrency, formatMesReferencia, mesReferenciaAtual } from "@/lib/format";
import { addPagamento, marcarPagamento, updateBriefing } from "@/actions/clientes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

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

function proximoVencimentoISO(diaVencimento: number | null): string {
  const now = new Date();
  const dia = diaVencimento ?? now.getDate();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}-${String(dia).padStart(2, "0")}`;
}

function Section({
  title,
  description,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md", accent)}>
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="font-sans text-sm text-white/50">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      briefing: true,
      pagamentos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cliente) notFound();

  const updateBriefingWithId = updateBriefing.bind(null, cliente.id);
  const addPagamentoWithId = addPagamento.bind(null, cliente.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Reveal>
        <div>
          <p className="font-sans text-xs text-white/40">Cliente</p>
          <h1 className="font-heading text-2xl font-semibold text-gradient-vivid">{cliente.nome}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm text-white/50">
            {cliente.contato ? <span>{cliente.contato}</span> : null}
            <span>Mensalidade: {formatCurrency(cliente.valorMensal)}</span>
            {cliente.diaVencimento ? <span>Vence dia {cliente.diaVencimento}</span> : null}
          </div>
        </div>
      </Reveal>

      {/* Briefing */}
      <Reveal delay={0.1}>
        <Section title="Briefing" description="Nicho, público e oferta do cliente." icon={FileText} accent="from-brand-blue to-brand-cyan">
          <form
            key={cliente.briefing?.updatedAt.getTime() ?? "novo"}
            action={updateBriefingWithId}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nicho">Nicho</Label>
                <Input id="nicho" name="nicho" defaultValue={cliente.briefing?.nicho ?? ""} className="h-11" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="orcamentoMensal">Orçamento de anúncios (R$)</Label>
                <Input
                  id="orcamentoMensal"
                  name="orcamentoMensal"
                  type="number"
                  step="0.01"
                  defaultValue={cliente.briefing?.orcamentoMensal ?? 0}
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="publicoAlvo">Público-alvo</Label>
              <Input id="publicoAlvo" name="publicoAlvo" defaultValue={cliente.briefing?.publicoAlvo ?? ""} className="h-11" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="oferta">Oferta</Label>
              <Input id="oferta" name="oferta" defaultValue={cliente.briefing?.oferta ?? ""} className="h-11" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" rows={3} defaultValue={cliente.briefing?.observacoes ?? ""} />
            </div>
            <Button type="submit" variant="secondary" className="self-start rounded-full">
              Salvar briefing
            </Button>
          </form>
        </Section>
      </Reveal>

      {/* Financeiro */}
      <Reveal delay={0.15}>
        <Section title="Financeiro" description="Controle de mensalidades." icon={Wallet} accent="from-brand-success to-brand-cyan">
          <div className="flex flex-col gap-3">
            {cliente.pagamentos.length === 0 ? (
              <p className="font-sans text-sm text-white/40">Nenhum pagamento lançado.</p>
            ) : (
              cliente.pagamentos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="font-sans text-sm font-medium text-white">{formatMesReferencia(p.referencia)}</p>
                    <p className="font-sans text-xs text-white/40">{formatCurrency(p.valor)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 font-sans text-xs font-medium", PAGAMENTO_STYLE[p.status])}>
                      {PAGAMENTO_LABEL[p.status]}
                    </span>
                    {p.status !== "PAGO" ? (
                      <form action={marcarPagamento.bind(null, cliente.id, p.id, "PAGO")}>
                        <Button type="submit" size="sm" variant="outline" className="rounded-full">
                          Marcar pago
                        </Button>
                      </form>
                    ) : (
                      <form action={marcarPagamento.bind(null, cliente.id, p.id, "PENDENTE")}>
                        <Button type="submit" size="sm" variant="ghost" className="rounded-full">
                          Desfazer
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <form action={addPagamentoWithId} className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/[0.06] pt-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referencia">Mês (AAAA-MM)</Label>
              <Input
                id="referencia"
                name="referencia"
                defaultValue={mesReferenciaAtual()}
                placeholder="2026-08"
                className="h-10 w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataVencimento">Data de vencimento</Label>
              <Input
                id="dataVencimento"
                name="dataVencimento"
                type="date"
                defaultValue={proximoVencimentoISO(cliente.diaVencimento)}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                defaultValue={cliente.valorMensal}
                className="h-10 w-32"
              />
            </div>
            <Button type="submit" variant="secondary" className="h-10 rounded-full">
              Lançar mensalidade
            </Button>
          </form>
          <p className="mt-2 font-sans text-xs text-white/35">
            A data de vencimento aparece automaticamente na Agenda.
          </p>
        </Section>
      </Reveal>
    </main>
  );
}
