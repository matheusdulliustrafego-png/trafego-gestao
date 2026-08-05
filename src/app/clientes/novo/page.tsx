import { createCliente } from "@/actions/clientes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NovoClientePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-white">Novo cliente</h1>
        <p className="mt-2 font-sans text-sm text-white/50">
          Cadastro básico — você pode preencher o briefing e o resto depois.
        </p>
      </div>

      <form action={createCliente} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome do cliente *</Label>
          <Input id="nome" name="nome" required className="h-11" placeholder="Ex: Studio Bella" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contato">Contato (WhatsApp)</Label>
          <Input id="contato" name="contato" className="h-11" placeholder="Ex: 51999999999" />
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cplAlvo">Meta de CPL (R$) — opcional</Label>
          <Input id="cplAlvo" name="cplAlvo" type="number" step="0.01" min="0" placeholder="Ex: 15" className="h-11" />
          <p className="font-sans text-xs text-white/35">
            Usado para o alerta de performance: se o CPL passar disso, aparece um aviso.
          </p>
        </div>

        <Button type="submit" size="lg" className="mt-2 h-12 rounded-full text-base">
          Criar cliente
        </Button>
      </form>
    </main>
  );
}
