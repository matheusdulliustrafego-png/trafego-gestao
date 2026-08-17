import Link from "next/link";
import { CalendarDays, Wallet, Users, ListChecks, ChevronLeft, ChevronRight, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatDayNumber, formatMonthLabel, formatWeekday, monthKey, mesReferenciaAtual } from "@/lib/format";
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

type Tipo = "pagamento" | "reuniao" | "tarefa";

type AgendaItem = {
  id: string;
  data: Date;
  tipo: Tipo;
  titulo: string;
  clienteId: string | null;
  clienteNome: string | null;
  status?: string;
  observacoes?: string;
  concluida?: boolean;
};

const TIPO_DOT: Record<Tipo, string> = {
  pagamento: "bg-gradient-to-br from-brand-success to-brand-cyan",
  reuniao: "bg-gradient-to-br from-brand-purple to-brand-pink",
  tarefa: "bg-gradient-to-br from-brand-cyan to-brand-blue",
};

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function isToday(date: Date) {
  const today = new Date();
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addMonths(mes: string, delta: number): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(ano, mesNum - 1 + delta, 1));
  return monthKey(d);
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; dia?: string }>;
}) {
  const { mes, dia } = await searchParams;
  const mesAtualReal = mesReferenciaAtual();
  const mesAtual = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : mesAtualReal;
  const [ano, mesNum] = mesAtual.split("-").map(Number);

  const firstOfMonth = Date.UTC(ano, mesNum - 1, 1);
  const paddingLeft = new Date(firstOfMonth).getUTCDay();
  const daysInMonth = new Date(Date.UTC(ano, mesNum, 0)).getUTCDate();
  const totalCells = Math.ceil((paddingLeft + daysInMonth) / 7) * 7;
  const gridStart = firstOfMonth - paddingLeft * 86400000;
  const gridEnd = gridStart + totalCells * 86400000;

  const [pagamentos, reunioes, tarefas, clientes] = await Promise.all([
    prisma.pagamento.findMany({
      where: { dataVencimento: { gte: new Date(gridStart), lt: new Date(gridEnd) } },
      include: { cliente: true },
    }),
    prisma.reuniao.findMany({
      where: { data: { gte: new Date(gridStart), lt: new Date(gridEnd) } },
      include: { cliente: true },
    }),
    prisma.tarefa.findMany({
      where: { dataLimite: { gte: new Date(gridStart), lt: new Date(gridEnd) } },
      include: { cliente: true },
    }),
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
    ...tarefas.map((t) => ({
      id: t.id,
      data: t.dataLimite as Date,
      tipo: "tarefa" as const,
      titulo: t.titulo,
      clienteId: t.clienteId,
      clienteNome: t.cliente?.nome ?? null,
      concluida: t.concluida,
    })),
  ];

  const porDia = new Map<string, AgendaItem[]>();
  for (const item of items) {
    const key = isoDay(item.data);
    if (!porDia.has(key)) porDia.set(key, []);
    porDia.get(key)!.push(item);
  }

  const diaSelecionado = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : mesAtual === mesAtualReal ? isoDay(new Date()) : null;
  const itemsDoDia = diaSelecionado ? (porDia.get(diaSelecionado) ?? []) : [];

  const prevMes = addMonths(mesAtual, -1);
  const nextMes = addMonths(mesAtual, 1);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue text-white shadow-lg">
            <CalendarDays className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Agenda</h1>
            <p className="font-sans text-sm text-white/50">Vencimentos, reuniões e tarefas com data.</p>
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

      <Reveal delay={0.1}>
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-gradient-vivid">{formatMonthLabel(new Date(firstOfMonth))}</h2>
            <div className="flex items-center gap-1">
              <Link
                href={`/agenda?mes=${prevMes}`}
                aria-label="Mês anterior"
                className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <Link
                href="/agenda"
                className="rounded-full px-3 py-1.5 font-sans text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                Hoje
              </Link>
              <Link
                href={`/agenda?mes=${nextMes}`}
                aria-label="Próximo mês"
                className="flex size-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {DIAS_ABREV.map((d) => (
              <div key={d} className="py-1 text-center font-sans text-[10px] uppercase text-white/35">
                {d}
              </div>
            ))}

            {Array.from({ length: totalCells }, (_, i) => {
              const cellDate = new Date(gridStart + i * 86400000);
              const key = isoDay(cellDate);
              const dayItems = porDia.get(key) ?? [];
              const emMes = cellDate.getUTCMonth() === mesNum - 1;
              const hoje = isToday(cellDate);
              const selecionado = key === diaSelecionado;

              return (
                <Link
                  key={key}
                  href={`/agenda?mes=${mesAtual}&dia=${key}`}
                  className={cn(
                    "flex min-h-16 flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors",
                    selecionado
                      ? "border-brand-cyan/50 bg-brand-cyan/[0.08]"
                      : hoje
                        ? "border-brand-cyan/25 bg-white/[0.03]"
                        : "border-transparent bg-white/[0.015] hover:bg-white/[0.04]",
                    !emMes && "opacity-35"
                  )}
                >
                  <span className={cn("font-sans text-xs", hoje ? "font-semibold text-brand-cyan" : "text-white/70")}>
                    {formatDayNumber(cellDate)}
                  </span>
                  {dayItems.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-center gap-0.5">
                      {dayItems.slice(0, 3).map((item) => (
                        <span key={`${item.tipo}-${item.id}`} className={cn("size-1.5 rounded-full", TIPO_DOT[item.tipo])} />
                      ))}
                      {dayItems.length > 3 ? <span className="font-sans text-[9px] text-white/40">+{dayItems.length - 3}</span> : null}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-base font-semibold text-white">
            {diaSelecionado ? `${formatWeekday(new Date(`${diaSelecionado}T00:00:00Z`))}, ${diaSelecionado.split("-").reverse().join("/")}` : "Selecione um dia"}
          </h2>

          {diaSelecionado && itemsDoDia.length === 0 ? (
            <p className="font-sans text-sm text-white/40">Nada agendado neste dia.</p>
          ) : null}

          {itemsDoDia.map((item) => (
            <div
              key={`${item.tipo}-${item.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg text-white", TIPO_DOT[item.tipo])}>
                  {item.tipo === "pagamento" ? <Wallet className="size-3.5" strokeWidth={2} /> : null}
                  {item.tipo === "reuniao" ? <Users className="size-3.5" strokeWidth={2} /> : null}
                  {item.tipo === "tarefa" ? <ListChecks className="size-3.5" strokeWidth={2} /> : null}
                </span>
                <div>
                  {item.clienteId ? (
                    <Link href={`/clientes/${item.clienteId}`} className="font-sans text-sm font-medium text-white hover:text-brand-cyan">
                      {item.titulo}
                    </Link>
                  ) : (
                    <p className={cn("font-sans text-sm font-medium", item.concluida ? "text-white/40 line-through" : "text-white")}>
                      {item.titulo}
                    </p>
                  )}
                  {item.observacoes ? <p className="font-sans text-xs text-white/40">{item.observacoes}</p> : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.tipo === "pagamento" && item.status ? (
                  <span className={cn("rounded-full px-2.5 py-0.5 font-sans text-xs font-medium", PAGAMENTO_STYLE[item.status])}>
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
        </section>
      </Reveal>
    </main>
  );
}
