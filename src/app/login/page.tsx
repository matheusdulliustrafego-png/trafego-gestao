import { login } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  const { erro, next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glow-card w-full max-w-sm rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent p-8 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink shadow-[0_0_24px_-4px_rgba(168,85,247,0.7)]">
            <span className="font-heading text-sm font-semibold tracking-tight text-white">TR</span>
          </span>
          <h1 className="font-heading text-xl font-semibold text-gradient-vivid">Área restrita</h1>
          <p className="font-sans text-sm text-white/50">
            Gestão de clientes — digite a senha para continuar.
          </p>
        </div>

        <form action={login} className="mt-8 flex flex-col gap-4">
          <input type="hidden" name="next" value={next ?? "/"} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required autoFocus className="h-11" />
          </div>
          {erro ? (
            <p className="font-sans text-sm text-destructive">Senha incorreta. Tente novamente.</p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="mt-2 h-12 rounded-full bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink text-base text-white shadow-[0_0_24px_-6px_rgba(168,85,247,0.7)] hover:opacity-90"
          >
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
