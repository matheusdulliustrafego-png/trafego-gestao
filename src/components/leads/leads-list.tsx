"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";
import { origemLeadLabel } from "@/lib/origem-lead";
import { LeadStatusSelect } from "./lead-status-select";
import { LeadDeleteButton } from "./lead-delete-button";

type Lead = {
  id: string;
  nome: string;
  contato: string;
  origem: string;
  observacoes: string;
  status: string;
  createdAt: Date;
};

const ACCENTS: Record<string, string> = {
  NOVO: "bg-white/25",
  EM_CONVERSA: "bg-gradient-to-b from-brand-orange to-brand-pink",
  PROPOSTA_ENVIADA: "bg-gradient-to-b from-brand-blue to-brand-cyan",
  FECHADO: "bg-gradient-to-b from-brand-success to-brand-cyan",
  PERDIDO: "bg-gradient-to-b from-brand-danger to-brand-orange",
};

const RESOLVIDOS = new Set(["FECHADO", "PERDIDO"]);

export function LeadsList({ leads }: { leads: Lead[] }) {
  const [showResolved, setShowResolved] = useState(false);

  const resolvidos = leads.filter((l) => RESOLVIDOS.has(l.status));
  const ativos = leads.filter((l) => !RESOLVIDOS.has(l.status));
  const visible = showResolved ? leads : ativos;

  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 ? (
        <p className="font-sans text-sm text-white/40">Nenhum lead ativo no momento.</p>
      ) : (
        visible.map((lead, i) => (
          <Reveal key={lead.id} delay={Math.min(i * 0.03, 0.3)}>
            <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn("absolute inset-y-0 left-0 w-1", ACCENTS[lead.status] ?? ACCENTS.NOVO)} />
              <div className="pl-2">
                <p className="font-sans text-sm font-medium text-white">{lead.nome}</p>
                <p className="mt-0.5 font-sans text-xs text-white/45">
                  {[lead.contato, origemLeadLabel(lead.origem)].filter(Boolean).join(" · ") || "—"}
                </p>
                {lead.observacoes ? (
                  <p className="mt-1 font-sans text-xs text-white/40">{lead.observacoes}</p>
                ) : null}
                <p className="mt-1 font-sans text-[11px] text-white/25">{formatDate(lead.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 pl-2 sm:pl-0">
                <LeadStatusSelect leadId={lead.id} status={lead.status} />
                <LeadDeleteButton leadId={lead.id} />
              </div>
            </div>
          </Reveal>
        ))
      )}

      {resolvidos.length > 0 ? (
        <button
          type="button"
          onClick={() => setShowResolved((v) => !v)}
          className="mt-1 flex items-center gap-1.5 self-start font-sans text-xs text-white/35 transition-colors hover:text-white/65"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", showResolved && "rotate-180")} />
          {showResolved ? "Ocultar" : "Mostrar"} fechados e perdidos ({resolvidos.length})
        </button>
      ) : null}
    </div>
  );
}
