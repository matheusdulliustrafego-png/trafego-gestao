import { cookies } from "next/headers";
import { UserPlus } from "lucide-react";
import { createLead } from "@/actions/leads";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE, LEAD_ENVIADO_COOKIE, isValidSessionToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { CapturaPublica } from "@/components/leads/captura-publica";
import { LeadsOverview } from "@/components/leads/leads-overview";
import { LeadsList } from "@/components/leads/leads-list";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const cookieStore = await cookies();
  const autenticado = await isValidSessionToken(cookieStore.get(AUTH_COOKIE)?.value);

  if (!autenticado) {
    const jaEnviado = cookieStore.get(LEAD_ENVIADO_COOKIE)?.value === "1";
    return <CapturaPublica jaEnviado={jaEnviado} />;
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
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
        <LeadsOverview leads={leads} />
      </Reveal>

      <Reveal delay={0.08}>
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

      <Reveal delay={0.12}>
        {leads.length === 0 ? (
          <p className="font-sans text-sm text-white/40">Nenhum lead ainda.</p>
        ) : (
          <LeadsList leads={leads} />
        )}
      </Reveal>
    </main>
  );
}
