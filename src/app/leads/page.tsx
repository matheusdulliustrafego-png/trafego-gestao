import { UserPlus } from "lucide-react";
import { createLead, updateLeadStatus } from "@/actions/leads";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_CONVERSA", label: "Em conversa" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta enviada" },
  { value: "FECHADO", label: "Fechado" },
  { value: "PERDIDO", label: "Perdido" },
];

const STATUS_STYLE: Record<string, string> = {
  NOVO: "bg-white/10 text-white/70",
  EM_CONVERSA: "bg-brand-orange/15 text-brand-orange",
  PROPOSTA_ENVIADA: "bg-brand-blue/15 text-brand-blue",
  FECHADO: "bg-brand-success/15 text-brand-success",
  PERDIDO: "bg-brand-danger/15 text-brand-danger",
};

const ACCENT_BAR: Record<string, string> = {
  NOVO: "from-white/40 to-white/10",
  EM_CONVERSA: "from-brand-orange to-brand-pink",
  PROPOSTA_ENVIADA: "from-brand-blue to-brand-cyan",
  FECHADO: "from-brand-success to-brand-cyan",
  PERDIDO: "from-brand-danger to-brand-orange",
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange to-brand-pink text-white shadow-lg">
            <UserPlus className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Leads</h1>
            <p className="font-sans text-sm text-white/50">
              Prospects até fecharem contrato. {leads.length} registrado(s).
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
          <h2 className="font-heading text-base font-semibold text-white">Novo lead</h2>
          <form action={createLead} className="mt-4 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome">Nome *</Label>
                <Input id="nome" name="nome" required className="h-11" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contato">Contato</Label>
                <Input id="contato" name="contato" className="h-11" placeholder="WhatsApp, e-mail..." />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="origem">Origem</Label>
              <Input id="origem" name="origem" className="h-11" placeholder="Ex: site, indicação, Instagram" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" rows={2} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="self-start h-11 rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.6)] hover:opacity-90"
            >
              Adicionar lead
            </Button>
          </form>
        </section>
      </Reveal>

      <div className="flex flex-col gap-3">
        {leads.length === 0 ? (
          <p className="font-sans text-sm text-white/40">Nenhum lead ainda.</p>
        ) : (
          leads.map((lead, i) => (
            <Reveal key={lead.id} delay={0.1 + i * 0.03}>
              <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <span className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", ACCENT_BAR[lead.status])} />
                <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                  <div>
                    <p className="font-sans text-sm font-medium text-white">{lead.nome}</p>
                    <p className="font-sans text-xs text-white/45">
                      {[lead.contato, lead.origem].filter(Boolean).join(" · ") || "—"}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-white/30">{formatDate(lead.createdAt)}</p>
                  </div>

                  <form action={updateLeadStatus.bind(null, lead.id)} className="flex items-center gap-2">
                    <select
                      name="status"
                      defaultValue={lead.status}
                      className={cn(
                        "h-8 rounded-full border-none px-3 font-sans text-xs font-medium",
                        STATUS_STYLE[lead.status]
                      )}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-brand-charcoal text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" size="sm" variant="outline" className="rounded-full">
                      Atualizar
                    </Button>
                  </form>
                </div>
                {lead.observacoes ? (
                  <p className="mt-2 pl-2 font-sans text-xs text-white/45">{lead.observacoes}</p>
                ) : null}
              </div>
            </Reveal>
          ))
        )}
      </div>
    </main>
  );
}
