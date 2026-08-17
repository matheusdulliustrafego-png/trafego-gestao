import { notFound } from "next/navigation";
import { Contact, FileText, Wallet, KeyRound, Trash2, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatCurrency, formatMesReferencia, mesReferenciaAtual } from "@/lib/format";
import { addPagamento, marcarPagamento, updateBriefing, updateDadosCliente } from "@/actions/clientes";
import { addAcesso, deleteAcesso } from "@/actions/acessos";
import { createTarefa } from "@/actions/tarefas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { SenhaReveal } from "@/components/senha-reveal";
import { ListField } from "@/components/list-field";
import { Section } from "@/components/section";
import { TarefasList } from "@/components/tarefas/tarefas-list";

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
      acessos: { orderBy: { createdAt: "desc" } },
      tarefas: { orderBy: [{ concluida: "asc" }, { dataLimite: "asc" }, { createdAt: "desc" }] },
    },
  });

  if (!cliente) notFound();

  const updateBriefingWithId = updateBriefing.bind(null, cliente.id);
  const updateDadosClienteWithId = updateDadosCliente.bind(null, cliente.id);
  const addPagamentoWithId = addPagamento.bind(null, cliente.id);
  const addAcessoWithId = addAcesso.bind(null, cliente.id);
  const createTarefaWithId = createTarefa.bind(null, cliente.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <Reveal>
        <div>
          <p className="font-sans text-xs text-white/40">Cliente</p>
          <h1 className="font-heading text-2xl font-semibold text-gradient-vivid">{cliente.nome}</h1>
        </div>
      </Reveal>

      {/* Dados do cliente */}
      <Reveal delay={0.05}>
        <Section title="Dados do cliente" description="Contato e informações de cobrança." icon={Contact} accent="from-brand-orange to-brand-pink">
          <form action={updateDadosClienteWithId} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dadosNome">Nome</Label>
              <Input id="dadosNome" name="nome" defaultValue={cliente.nome} required className="h-11" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contato">Contato (WhatsApp)</Label>
                <Input id="contato" name="contato" defaultValue={cliente.contato} className="h-11" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={cliente.email} placeholder="cliente@email.com" className="h-11" />
                <p className="font-sans text-xs text-white/35">Usado para enviar lembrete de reunião por e-mail.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="valorMensal">Mensalidade (R$)</Label>
                <Input
                  id="valorMensal"
                  name="valorMensal"
                  type="number"
                  step="0.01"
                  defaultValue={cliente.valorMensal}
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="diaVencimento">Dia de vencimento</Label>
                <Input
                  id="diaVencimento"
                  name="diaVencimento"
                  type="number"
                  min="1"
                  max="31"
                  defaultValue={cliente.diaVencimento ?? ""}
                  className="h-11"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" className="self-start rounded-full">
              Salvar dados
            </Button>
          </form>
        </Section>
      </Reveal>

      {/* Briefing */}
      <Reveal delay={0.1}>
        <Section title="Briefing" description="Estratégia, público e diferenciais do cliente." icon={FileText} accent="from-brand-blue to-brand-cyan">
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
                <Label htmlFor="objetivoPrincipal">Objetivo principal</Label>
                <Input
                  id="objetivoPrincipal"
                  name="objetivoPrincipal"
                  placeholder="Ex: Leads, Vendas, WhatsApp"
                  defaultValue={cliente.briefing?.objetivoPrincipal ?? ""}
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ticketMedio">Ticket médio (R$)</Label>
                <Input
                  id="ticketMedio"
                  name="ticketMedio"
                  type="number"
                  step="0.01"
                  defaultValue={cliente.briefing?.ticketMedio ?? 0}
                  className="h-11"
                />
              </div>
            </div>

            <ListField
              name="publicoAlvo"
              label="Público-alvo"
              placeholder="Ex: Mulheres 25-40 anos, região metropolitana..."
              initialItems={cliente.briefing?.publicoAlvo ?? []}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="oferta">Oferta</Label>
              <Input id="oferta" name="oferta" defaultValue={cliente.briefing?.oferta ?? ""} className="h-11" />
            </div>

            <ListField
              name="diferenciais"
              label="Diferenciais competitivos"
              placeholder="Ex: Entrega em 24h, garantia vitalícia..."
              initialItems={cliente.briefing?.diferenciais ?? []}
            />

            <ListField
              name="concorrentes"
              label="Principais concorrentes"
              placeholder="Nome do concorrente ou @perfil"
              initialItems={cliente.briefing?.concorrentes ?? []}
            />

            <ListField
              name="objecoes"
              label="Objeções comuns dos clientes"
              placeholder="Ex: Acha caro, não confia na entrega..."
              initialItems={cliente.briefing?.objecoes ?? []}
            />

            <ListField
              name="redesSociais"
              label="Redes sociais / links"
              placeholder="Ex: instagram.com/perfil"
              initialItems={cliente.briefing?.redesSociais ?? []}
            />

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

      {/* Tarefas */}
      <Reveal delay={0.18}>
        <Section title="Tarefas" description="Pendências e lembretes deste cliente." icon={ListChecks} accent="from-brand-cyan to-brand-blue">
          <TarefasList tarefas={cliente.tarefas} />

          <form action={createTarefaWithId} className="mt-5 flex flex-wrap items-end gap-3 border-t border-white/[0.06] pt-5">
            <div className="flex flex-1 min-w-40 flex-col gap-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" name="titulo" required className="h-10" placeholder="Ex: Enviar relatório mensal" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataLimite">Data limite</Label>
              <Input id="dataLimite" name="dataLimite" type="date" className="h-10" />
            </div>
            <Button type="submit" variant="secondary" className="h-10 rounded-full">
              Adicionar tarefa
            </Button>
          </form>
        </Section>
      </Reveal>

      {/* Acessos */}
      <Reveal delay={0.2}>
        <Section
          title="Acessos"
          description="Login e senha da conta de anúncio, Business Manager, etc."
          icon={KeyRound}
          accent="from-brand-purple to-brand-blue"
        >
          <div className="flex flex-col gap-3">
            {cliente.acessos.length === 0 ? (
              <p className="font-sans text-sm text-white/40">Nenhum acesso registrado.</p>
            ) : (
              cliente.acessos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="font-sans text-sm font-medium text-white">{a.plataforma}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-white/45">
                      {a.login ? <span>{a.login}</span> : null}
                      <SenhaReveal senha={a.senha} />
                    </div>
                    {a.observacoes ? <p className="font-sans text-xs text-white/35">{a.observacoes}</p> : null}
                  </div>
                  <form action={deleteAcesso.bind(null, cliente.id, a.id)}>
                    <button
                      type="submit"
                      aria-label="Remover acesso"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-brand-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

          <form action={addAcessoWithId} className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plataforma">Plataforma *</Label>
                <Input id="plataforma" name="plataforma" required className="h-10" placeholder="Ex: Business Manager" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login">Login / e-mail</Label>
                <Input id="login" name="login" className="h-10" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" className="h-10" />
            </div>
            <Textarea name="observacoes" rows={2} placeholder="Observações (opcional)" />
            <Button type="submit" variant="secondary" className="self-start h-10 rounded-full">
              Salvar acesso
            </Button>
          </form>
        </Section>
      </Reveal>
    </main>
  );
}
