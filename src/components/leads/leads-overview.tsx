import { Users, Flame, Sparkles, Trophy } from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const ATIVOS = new Set(["NOVO", "EM_CONVERSA", "PROPOSTA_ENVIADA"]);

export function LeadsOverview({ leads }: { leads: { status: string; createdAt: Date }[] }) {
  const total = leads.length;
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const novosSemana = leads.filter((l) => l.createdAt >= seteDiasAtras).length;
  const ativos = leads.filter((l) => ATIVOS.has(l.status)).length;
  const fechados = leads.filter((l) => l.status === "FECHADO").length;
  const taxaFechamento = total ? (fechados / total) * 100 : 0;

  const stats = [
    { icon: Users, label: "Total de leads", value: total, suffix: "", gradient: "from-brand-blue to-brand-cyan" },
    { icon: Flame, label: "Ativos no funil", value: ativos, suffix: "", gradient: "from-brand-orange to-brand-pink" },
    { icon: Sparkles, label: "Novos essa semana", value: novosSemana, suffix: "", gradient: "from-brand-purple to-brand-pink" },
    { icon: Trophy, label: "Taxa de fechamento", value: taxaFechamento, suffix: "%", gradient: "from-brand-success to-brand-cyan" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 0.05}>
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                stat.gradient
              )}
            >
              <stat.icon className="size-5" strokeWidth={2} />
            </span>
            <div>
              <p className="font-heading text-3xl font-semibold text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 font-sans text-xs text-white/50">{stat.label}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
