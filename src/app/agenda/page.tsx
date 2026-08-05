import Link from "next/link";
import { CalendarDays, Wallet, Users, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthLabel, formatWeekday, monthKey } from "@/lib/format";
import { createReuniao, deleteReuniao } from "@/actions/reunioes";
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

type AgendaItem = {
  id: string;
  data: Date;
  tipo: "pagamento" | "reuniao";
  titulo: string;
  clienteId: string | null;
  clienteNome: string | null;
  status?: string;
  observacoes?: string;
};

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

export default async function AgendaPage() {
  const [pagamentos, reunioes, clientes] = await Promise.all([
    prisma.pagamento.findMany({
      where: { dataVencimento: { not: null } },
      include: { cliente: true },
    }),
    prisma.reuniao.findMany({ include: { cliente: true }, orderBy: { data: "asc" } }),
    prisma.cliente.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  const items: AgendaItem[] = [
    ...pagamentos.map((p) => ({
      id: p.id,
      data: p.dataVencimento as Date,
      tipo: "pagamento" as const,
      titulo: `Mensalidade — ${p.cliente.nome}`,
      clienteId: p.clienteId,
      clienteNome: p.cliente.nome,
      status: p.status,
    })),
    ...reunioes.map((r) => ({
      id: r.id,
      data: r.data,
      tipo: "reuniao" as const,
      titulo: r.titulo,
      clienteId: r.clienteId,
      clienteNome: r.cliente?.nome ?? null,
      observacoes: r.observacoes,
    })),
  ].sort((a, b) => a.data.getTime() - b.data.getTime());

  const porMes = new Map<string, Map<string, AgendaItem[]>>();
  for (const item of items) {
    const mKey = monthKey(item.data);
    const dKey = item.data.toISOString().slice(0, 10);
    if (!porMes.has(mKey)) porMes.set(mKey, new Map());
    const porDia = porMes.get(mKey)!;
    if (!porDia.has(dKey)) porDia.set(dKey, []);
    porDia.get(dKey)!.push(item);
  }

  const meses = [...porMes.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue text-white shadow-lg">
            <CalendarDays className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Agenda</h1>
            <p className="font-sans text-sm text-white/50">
              Vencimentos de pagamento e reuniões, organizados por mês e dia.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
          <h2 className="font-heading text-base font-semibold text-white">Nova reunião</h2>
          <form action={createReuniao} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" name="titulo" required className="h-11" placeholder="Ex: Reunião de alinhamento" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data">Data *</Label>
                <Input id="data" name="data" type="date" required className="h-11" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clienteId">Cliente (opcional)</Label>
              <select
                id="clienteId"
                name="clienteId"
                defaultValue=""
                className="h-11 rounded-lg border border-input bg-transparent px-2.5 font-sans text-sm text-white"
              >
                <option className="bg-brand-charcoal" value="">
                  Nenhum
                </option>
                {clientes.map((c) => (
                  <option key={c.id} className="bg-brand-charcoal" value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" rows={2} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="self-start h-11 rounded-full bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-purple text-white shadow-[0_0_20px_-4px_rgba(59,130,246,0.6)] hover:opacity-90"
            >
              Adicionar à agenda
            </Button>
          </form>
        </section>
      </Reveal>

      {meses.length === 0 ? (
        <p className="font-sans text-sm text-white/40">Nada agendado ainda.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {meses.map(([mKey, porDia], mi) => {
            const dias = [...porDia.entries()].sort(([a], [b]) => a.localeCompare(b));
            const mesLabel = formatMonthLabel(dias[0][1][0].data);
            return (
              <Reveal key={mKey} delay={0.1 + mi * 0.05}>
                <div className="flex flex-col gap-4">
                  <h2 className="font-heading text-lg font-semibold text-gradient-vivid">{mesLabel}</h2>
                  <div className="flex flex-col gap-3">
                    {dias.map(([dKey, dayItems]) => {
                      const data = dayItems[0].data;
                      const hoje = isToday(data);
                      return (
                        <div
                          key={dKey}
                          className={cn(
                            "flex gap-4 rounded-2xl border p-4",
                            hoje ? "border-brand-cyan/40 bg-brand-cyan/[0.04]" : "border-white/[0.08] bg-white/[0.02]"
                          )}
                        >
                          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/[0.04] py-2">
                            <span className="font-heading text-lg font-semibold text-white">
                              {formatDayNumber(data)}
                            </span>
                            <span className="font-sans text-[10px] uppercase text-white/40">
                              {formatWeekday(data).slice(0, 3)}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col gap-2">
                            {dayItems.map((item) => (
                              <div
                                key={`${item.tipo}-${item.id}`}
                                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className={cn(
                                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-white",
                                      item.tipo === "pagamento"
                                        ? "bg-gradient-to-br from-brand-success to-brand-cyan"
                                        : "bg-gradient-to-br from-brand-purple to-brand-pink"
                                    )}
                                  >
                                    {item.tipo === "pagamento" ? (
                                      <Wallet className="size-3.5" strokeWidth={2} />
                                    ) : (
                                      <Users className="size-3.5" strokeWidth={2} />
                                    )}
                                  </span>
                                  <div>
                                    {item.clienteId ? (
                                      <Link
                                        href={`/clientes/${item.clienteId}`}
                                        className="font-sans text-sm font-medium text-white hover:text-brand-cyan"
                                      >
                                        {item.titulo}
                                      </Link>
                                    ) : (
                                      <p className="font-sans text-sm font-medium text-white">{item.titulo}</p>
                                    )}
                                    {item.observacoes ? (
                                      <p className="font-sans text-xs text-white/40">{item.observacoes}</p>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.tipo === "pagamento" && item.status ? (
                                    <span
                                      className={cn(
                                        "rounded-full px-2.5 py-0.5 font-sans text-xs font-medium",
                                        PAGAMENTO_STYLE[item.status]
                                      )}
                                    >
                                      {PAGAMENTO_LABEL[item.status]}
                                    </span>
                                  ) : null}
                                  {item.tipo === "reuniao" ? (
                                    <form action={deleteReuniao.bind(null, item.id)}>
                                      <button
                                        type="submit"
                                        aria-label="Remover reunião"
                                        className="flex size-6 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                                      >
                                        <X className="size-3.5" />
                                      </button>
                                    </form>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
