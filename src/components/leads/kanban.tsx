import { ChevronLeft, ChevronRight } from "lucide-react";
import { updateLeadStatus } from "@/actions/leads";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

type Lead = {
  id: string;
  nome: string;
  contato: string;
  origem: string;
  observacoes: string;
  status: string;
  createdAt: Date;
};

const COLUNAS = [
  { value: "NOVO", label: "Novo", accent: "from-white/40 to-white/10" },
  { value: "EM_CONVERSA", label: "Em conversa", accent: "from-brand-orange to-brand-pink" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta enviada", accent: "from-brand-blue to-brand-cyan" },
  { value: "FECHADO", label: "Fechado", accent: "from-brand-success to-brand-cyan" },
  { value: "PERDIDO", label: "Perdido", accent: "from-brand-danger to-brand-orange" },
] as const;

export function LeadsKanban({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 overflow-x-auto pb-2 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-[minmax(260px,1fr)]">
      {COLUNAS.map((coluna, colIndex) => {
        const leadsDaColuna = leads.filter((l) => l.status === coluna.value);
        return (
          <div key={coluna.value} className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full bg-gradient-to-br", coluna.accent)} />
                <h3 className="font-heading text-sm font-semibold text-white">{coluna.label}</h3>
              </div>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-sans text-xs text-white/50">
                {leadsDaColuna.length}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {leadsDaColuna.length === 0 ? (
                <p className="font-sans text-xs text-white/25">Nenhum lead aqui.</p>
              ) : (
                leadsDaColuna.map((lead, i) => {
                  const anterior = COLUNAS[colIndex - 1];
                  const proxima = COLUNAS[colIndex + 1];
                  return (
                    <Reveal key={lead.id} delay={i * 0.02}>
                      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-brand-black/40 p-3">
                        <span className={cn("absolute inset-y-0 left-0 w-1 bg-gradient-to-b", coluna.accent)} />
                        <div className="pl-2">
                          <p className="font-sans text-sm font-medium text-white">{lead.nome}</p>
                          <p className="mt-0.5 font-sans text-xs text-white/45">
                            {[lead.contato, lead.origem].filter(Boolean).join(" · ") || "—"}
                          </p>
                          {lead.observacoes ? (
                            <p className="mt-1.5 font-sans text-xs text-white/40">{lead.observacoes}</p>
                          ) : null}
                          <p className="mt-1.5 font-sans text-[11px] text-white/25">{formatDate(lead.createdAt)}</p>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <form action={updateLeadStatus.bind(null, lead.id)}>
                              <input type="hidden" name="status" value={anterior?.value ?? coluna.value} />
                              <button
                                type="submit"
                                disabled={!anterior}
                                aria-label="Mover para trás"
                                className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                              >
                                <ChevronLeft className="size-4" />
                              </button>
                            </form>
                            <form action={updateLeadStatus.bind(null, lead.id)}>
                              <input type="hidden" name="status" value={proxima?.value ?? coluna.value} />
                              <button
                                type="submit"
                                disabled={!proxima}
                                aria-label="Mover para frente"
                                className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent"
                              >
                                <ChevronRight className="size-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
