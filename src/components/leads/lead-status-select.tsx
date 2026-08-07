"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLeadStatus } from "@/actions/leads";
import { cn } from "@/lib/utils";

export const STATUS_CONFIG = {
  NOVO: { label: "Novo", dot: "bg-white/50" },
  EM_CONVERSA: { label: "Em conversa", dot: "bg-gradient-to-br from-brand-orange to-brand-pink" },
  PROPOSTA_ENVIADA: { label: "Proposta enviada", dot: "bg-gradient-to-br from-brand-blue to-brand-cyan" },
  FECHADO: { label: "Fechado", dot: "bg-gradient-to-br from-brand-success to-brand-cyan" },
  PERDIDO: { label: "Perdido", dot: "bg-gradient-to-br from-brand-danger to-brand-orange" },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const key = (status in STATUS_CONFIG ? status : "NOVO") as StatusKey;

  function handleChange(next: string | null) {
    if (!next) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("status", next);
      await updateLeadStatus(leadId, formData);
    });
  }

  return (
    <Select value={key} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        className={cn(
          "border-white/10 bg-white/[0.04] text-white/80 transition-opacity",
          isPending && "opacity-50"
        )}
      >
        <span className={cn("size-2 shrink-0 rounded-full", STATUS_CONFIG[key].dot)} />
        <SelectValue>{(value: StatusKey | null) => (value ? STATUS_CONFIG[value].label : "")}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(Object.entries(STATUS_CONFIG) as [StatusKey, (typeof STATUS_CONFIG)[StatusKey]][]).map(
          ([value, config]) => (
            <SelectItem key={value} value={value}>
              <span className={cn("size-2 shrink-0 rounded-full", config.dot)} />
              {config.label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}
