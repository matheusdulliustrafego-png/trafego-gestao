import { UserPlus } from "lucide-react";
import { createCliente } from "@/actions/clientes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export default function NovoClientePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-12">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink text-white shadow-lg">
            <UserPlus className="size-5" strokeWidth={2} />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-white">Novo cliente</h1>
            <p className="font-sans text-sm text-white/50">
              Cadastro básico — você pode preencher o briefing e o resto depois.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
      <form action={createCliente} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome do cliente *</Label>
          <Input id="nome" name="nome" required className="h-11" placeholder="Ex: Studio Bella" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contato">Contato (WhatsApp)</Label>
            <Input id="contato" name="contato" className="h-11" placeholder="Ex: 51999999999" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" className="h-11" placeholder="cliente@email.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valorMensal">Mensalidade (R$)</Label>
            <Input id="valorMensal" name="valorMensal" type="number" step="0.01" min="0" defaultValue="0" className="h-11" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="diaVencimento">Dia de vencimento</Label>
            <Input id="diaVencimento" name="diaVencimento" type="number" min="1" max="31" placeholder="Ex: 10" className="h-11" />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-2 h-12 rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink text-base text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.6)] hover:opacity-90"
        >
          Criar cliente
        </Button>
      </form>
      </Reveal>
    </main>
  );
}
