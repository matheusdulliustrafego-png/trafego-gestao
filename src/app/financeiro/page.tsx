import { Wallet, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { mesReferenciaAtual, monthKey, formatMesReferencia } from "@/lib/format";
import { createDespesa } from "@/actions/despesas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { AnimatedCounter } from "@/components/animated-counter";
import { Section } from "@/components/section";
import { FluxoCaixaChart, type MesSerie } from "@/components/financeiro/fluxo-caixa-chart";
import { DespesaRow } from "@/components/financeiro/despesa-row";

export const dynamic = "force-dynamic";

const MESES_JANELA = 12;

function ultimosMeses(qtd: number): string[] {
  const [anoAtual, mesAtual] = mesReferenciaAtual().split("-").map(Number);
  const meses: string[] = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(anoAtual, mesAtual - 1 - i, 1));
    meses.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return meses;
}

export default async function FinanceiroPage() {
  const [pagamentosPagos, despesas] = await Promise.all([
    prisma.pagamento.findMany({ where: { status: "PAGO" } }),
    prisma.despesa.findMany({ orderBy: [{ data: "desc" }, { createdAt: "desc" }] }),
  ]);

  const receitaTotal = pagamentosPagos.reduce((sum, p) => sum + p.valor, 0);
  const despesaTotal = despesas.reduce((sum, d) => sum + d.valor, 0);
  const saldo = receitaTotal - despesaTotal;

  const receitaPorMes = new Map<string, number>();
  for (const p of pagamentosPagos) {
    receitaPorMes.set(p.referencia, (receitaPorMes.get(p.referencia) ?? 0) + p.valor);
  }
  const despesaPorMes = new Map<string, number>();
  for (const d of despesas) {
    const key = monthKey(d.data);
    despesaPorMes.set(key, (despesaPorMes.get(key) ?? 0) + d.valor);
  }

  const serie: MesSerie[] = ultimosMeses(MESES_JANELA).map((mes) => ({
    mes,
    label: formatMesReferencia(mes).slice(0, 3),
    receita: receitaPorMes.get(mes) ?? 0,
    despesa: despesaPorMes.get(mes) ?? 0,
  }));

  const stats = [
    { label: "Saldo", value: saldo, icon: Wallet, accent: saldo >= 0 ? "from-brand-success to-brand-cyan" : "from-brand-danger to-brand-orange" },
    { label: "Receita total", value: receitaTotal, icon: TrendingUp, accent: "from-brand-blue to-brand-cyan" },
    { label: "Despesas totais", value: despesaTotal, icon: TrendingDown, accent: "from-brand-orange to-brand-pink" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-success to-brand-cyan text-white shadow-lg">
            <Wallet className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Financeiro</h1>
            <p className="font-sans text-sm text-white/50">Fluxo de caixa da agência — receitas e despesas.</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5"
            >
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
                  <AnimatedCounter value={stat.value} prefix="R$ " decimals={2} />
                </p>
                <p className="font-sans text-xs text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Section title="Receita x despesa" description="Últimos 12 meses." icon={TrendingUp} accent="from-brand-blue to-brand-cyan">
          <FluxoCaixaChart data={serie} />
        </Section>
      </Reveal>

      <Reveal delay={0.15}>
        <Section title="Despesas" description="Ferramentas, assinaturas e outros custos da agência." icon={Receipt} accent="from-brand-orange to-brand-pink">
          <div className="flex flex-col gap-3">
            {despesas.length === 0 ? (
              <p className="font-sans text-sm text-white/40">Nenhuma despesa lançada.</p>
            ) : (
              despesas.map((d) => <DespesaRow key={d.id} despesa={d} />)
            )}
          </div>

          <form action={createDespesa} className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/[0.06] pt-5">
            <div className="flex flex-1 min-w-40 flex-col gap-1.5">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input id="descricao" name="descricao" required className="h-10" placeholder="Ex: Assinatura de ferramenta" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Input id="categoria" name="categoria" className="h-10 w-36" placeholder="Ex: Ferramentas" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" name="valor" type="number" step="0.01" className="h-10 w-28" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" name="data" type="date" required className="h-10" />
            </div>
            <Button type="submit" variant="secondary" className="h-10 rounded-full">
              Lançar despesa
            </Button>
          </form>
        </Section>
      </Reveal>
    </main>
  );
}
