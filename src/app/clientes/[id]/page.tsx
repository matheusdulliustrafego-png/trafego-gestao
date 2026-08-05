import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { cpl, formatCurrency, formatDate, formatMesReferencia, mesReferenciaAtual } from "@/lib/format";
import {
  addChecagem,
  addCriativo,
  addPagamento,
  marcarPagamento,
  updateBriefing,
} from "@/actions/clientes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const RESULTADO_STYLE: Record<string, string> = {
  BOM: "bg-brand-success/15 text-brand-success",
  NEUTRO: "bg-white/10 text-white/60",
  RUIM: "bg-brand-danger/15 text-brand-danger",
};

const RESULTADO_LABEL: Record<string, string> = {
  BOM: "Bom",
  NEUTRO: "Neutro",
  RUIM: "Ruim",
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

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      <h2 className="font-heading text-lg font-semibold text-white">{title}</h2>
      {description ? <p className="mt-1 font-sans text-sm text-white/50">{description}</p> : null}
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
      criativos: { orderBy: { createdAt: "desc" } },
      checagens: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!cliente) notFound();

  const ultimaChecagem = cliente.checagens[0];
  const cplAtual = ultimaChecagem ? cpl(ultimaChecagem.investimento, ultimaChecagem.leads) : null;
  const alertaCpl = cliente.cplAlvo != null && cplAtual != null ? cplAtual > cliente.cplAlvo : null;

  const updateBriefingWithId = updateBriefing.bind(null, cliente.id);
  const addPagamentoWithId = addPagamento.bind(null, cliente.id);
  const addCriativoWithId = addCriativo.bind(null, cliente.id);
  const addChecagemWithId = addChecagem.bind(null, cliente.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <p className="font-sans text-xs text-white/40">Cliente</p>
        <h1 className="font-heading text-2xl font-semibold text-white">{cliente.nome}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm text-white/50">
          {cliente.contato ? <span>{cliente.contato}</span> : null}
          <span>Mensalidade: {formatCurrency(cliente.valorMensal)}</span>
          {cliente.diaVencimento ? <span>Vence dia {cliente.diaVencimento}</span> : null}
        </div>
      </div>

      {alertaCpl !== null ? (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-3 font-sans text-sm",
            alertaCpl ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-success/10 text-brand-success"
          )}
        >
          {alertaCpl ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
          CPL atual: {formatCurrency(cplAtual ?? 0)} — meta: {formatCurrency(cliente.cplAlvo ?? 0)}
        </div>
      ) : null}

      {/* Briefing */}
      <Section title="Briefing" description="Nicho, público e oferta do cliente.">
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

      {/* Financeiro */}
      <Section title="Financeiro" description="Controle de mensalidades.">
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
      </Section>

      {/* Criativos */}
      <Section title="Criativos testados" description="Histórico do que já foi testado nas campanhas.">
        <div className="flex flex-col gap-3">
          {cliente.criativos.length === 0 ? (
            <p className="font-sans text-sm text-white/40">Nenhum criativo registrado.</p>
          ) : (
            cliente.criativos.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-sans text-sm font-medium text-white">{c.nome}</p>
                  <span className={cn("rounded-full px-2.5 py-0.5 font-sans text-xs font-medium", RESULTADO_STYLE[c.resultado])}>
                    {RESULTADO_LABEL[c.resultado]}
                  </span>
                </div>
                {c.observacoes ? <p className="mt-1 font-sans text-xs text-white/45">{c.observacoes}</p> : null}
                <p className="mt-1 font-sans text-xs text-white/30">{formatDate(c.createdAt)}</p>
              </div>
            ))
          )}
        </div>

        <form action={addCriativoWithId} className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="criativoNome">Nome / descrição</Label>
              <Input id="criativoNome" name="nome" className="h-10" placeholder="Ex: Vídeo depoimento cliente" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resultado">Resultado</Label>
              <select
                id="resultado"
                name="resultado"
                defaultValue="NEUTRO"
                className="h-10 rounded-lg border border-input bg-transparent px-2.5 font-sans text-sm text-white"
              >
                <option className="bg-brand-charcoal" value="BOM">Bom</option>
                <option className="bg-brand-charcoal" value="NEUTRO">Neutro</option>
                <option className="bg-brand-charcoal" value="RUIM">Ruim</option>
              </select>
            </div>
          </div>
          <Textarea name="observacoes" rows={2} placeholder="Observações (opcional)" />
          <Button type="submit" variant="secondary" className="self-start h-10 rounded-full">
            Registrar criativo
          </Button>
        </form>
      </Section>

      {/* Checagens / Alertas */}
      <Section title="Checagens de performance" description="Registre o CPL para acompanhar contra a meta.">
        <div className="flex flex-col gap-3">
          {cliente.checagens.length === 0 ? (
            <p className="font-sans text-sm text-white/40">Nenhuma checagem registrada.</p>
          ) : (
            cliente.checagens.map((chk) => {
              const chkCpl = cpl(chk.investimento, chk.leads);
              const acima = cliente.cplAlvo != null && chkCpl > cliente.cplAlvo;
              return (
                <div
                  key={chk.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="font-sans text-sm text-white">
                      {formatCurrency(chk.investimento)} · {chk.leads} lead(s)
                    </p>
                    <p className="font-sans text-xs text-white/40">{formatDate(chk.createdAt)}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 font-sans text-xs font-medium",
                      cliente.cplAlvo == null
                        ? "bg-white/10 text-white/50"
                        : acima
                          ? "bg-brand-danger/15 text-brand-danger"
                          : "bg-brand-success/15 text-brand-success"
                    )}
                  >
                    CPL {formatCurrency(chkCpl)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <form action={addChecagemWithId} className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/[0.06] pt-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="investimento">Investimento (R$)</Label>
            <Input id="investimento" name="investimento" type="number" step="0.01" className="h-10 w-32" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leads">Leads</Label>
            <Input id="leads" name="leads" type="number" className="h-10 w-24" />
          </div>
          <Button type="submit" variant="secondary" className="h-10 rounded-full">
            Registrar checagem
          </Button>
        </form>
      </Section>
    </main>
  );
}
