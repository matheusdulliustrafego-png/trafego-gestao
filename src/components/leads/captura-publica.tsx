import { CheckCircle2, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { createLead } from "@/actions/leads";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

const WHATSAPP_LINK =
  "https://wa.me/5551993133997?text=" +
  encodeURIComponent("Olá! Acabei de preencher o formulário no site, quero saber mais.");

function Logo() {
  return (
    <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink shadow-[0_0_32px_-6px_rgba(168,85,247,0.7)]">
      <span className="font-heading text-lg font-semibold tracking-tight text-white">TR</span>
    </span>
  );
}

export function CapturaPublica({ jaEnviado }: { jaEnviado: boolean }) {
  if (jaEnviado) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <Reveal className="w-full max-w-md">
          <div className="glass-panel flex flex-col items-center gap-5 rounded-3xl p-10 text-center shadow-2xl">
            <Logo />
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-success/15 text-brand-success">
              <CheckCircle2 className="size-6" strokeWidth={2} />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold text-white">Recebemos seus dados!</h1>
              <p className="mt-2 font-sans text-sm leading-relaxed text-white/60">
                Nossa equipe já foi avisada e vai te chamar em breve. Se preferir, pode falar com a gente agora mesmo:
              </p>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-whatsapp px-8 font-medium text-white shadow-[0_8px_24px_-8px_rgba(37,211,102,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-whatsapp-dark"
            >
              <MessageCircle className="size-5" strokeWidth={2.25} />
              Falar agora no WhatsApp
            </a>
          </div>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <span className="rounded-full border border-brand-silver/25 bg-white/[0.03] px-4 py-1.5 font-subheading text-xs font-semibold uppercase tracking-[0.2em] text-brand-silver">
            Tráfego Real
          </span>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-white text-balance">
            Vamos transformar seu investimento em <span className="text-gradient-vivid">clientes reais</span>
          </h1>
          <p className="font-sans text-sm leading-relaxed text-white/55">
            Preencha seus dados abaixo — nossa equipe entra em contato pra entender seu negócio e montar sua estratégia.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <form action={createLead} className="glass-panel mt-8 flex flex-col gap-4 rounded-3xl p-7 shadow-2xl">
            <input type="hidden" name="publico" value="1" />
            <input type="hidden" name="origem" value="Site (formulário)" />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" name="nome" required className="h-12" placeholder="Seu nome" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contato">WhatsApp *</Label>
              <Input id="contato" name="contato" required className="h-12" placeholder="(51) 99999-9999" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Conte um pouco sobre seu negócio</Label>
              <Textarea id="observacoes" name="observacoes" rows={3} placeholder="Opcional" />
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-2 h-13 rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink text-base text-white shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] hover:opacity-90"
            >
              Quero vender mais
            </Button>
          </form>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-brand-silver" /> Resposta rápida
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-brand-silver" /> Sem compromisso
            </span>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
