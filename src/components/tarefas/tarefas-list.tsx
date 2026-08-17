"use client";

import { useState } from "react";
import { ChevronDown, Check, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toggleTarefa, deleteTarefa } from "@/actions/tarefas";

type Tarefa = {
  id: string;
  titulo: string;
  concluida: boolean;
  dataLimite: Date | null;
};

function estaAtrasada(tarefa: Tarefa): boolean {
  if (tarefa.concluida || !tarefa.dataLimite) return false;
  const hoje = new Date();
  const limite = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  return tarefa.dataLimite.getTime() < limite.getTime();
}

export function TarefasList({ tarefas }: { tarefas: Tarefa[] }) {
  const [showConcluidas, setShowConcluidas] = useState(false);

  const concluidas = tarefas.filter((t) => t.concluida);
  const pendentes = tarefas.filter((t) => !t.concluida);
  const visible = showConcluidas ? tarefas : pendentes;

  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 ? (
        <p className="font-sans text-sm text-white/40">Nenhuma tarefa pendente.</p>
      ) : (
        visible.map((tarefa) => (
          <div
            key={tarefa.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <form action={toggleTarefa.bind(null, tarefa.id, !tarefa.concluida)}>
                <button
                  type="submit"
                  aria-label={tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída"}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    tarefa.concluida
                      ? "border-brand-success bg-brand-success/20 text-brand-success"
                      : "border-white/20 text-transparent hover:border-white/40"
                  )}
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </button>
              </form>
              <div>
                <p className={cn("font-sans text-sm font-medium", tarefa.concluida ? "text-white/40 line-through" : "text-white")}>
                  {tarefa.titulo}
                </p>
                {tarefa.dataLimite ? (
                  <p className={cn("font-sans text-xs", estaAtrasada(tarefa) ? "text-brand-danger" : "text-white/40")}>
                    {formatDate(tarefa.dataLimite)}
                  </p>
                ) : null}
              </div>
            </div>
            <form action={deleteTarefa.bind(null, tarefa.id)}>
              <button
                type="submit"
                aria-label="Remover tarefa"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-brand-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </form>
          </div>
        ))
      )}

      {concluidas.length > 0 ? (
        <button
          type="button"
          onClick={() => setShowConcluidas((v) => !v)}
          className="mt-1 flex items-center gap-1.5 self-start font-sans text-xs text-white/35 transition-colors hover:text-white/65"
        >
          <ChevronDown className={cn("size-3.5 transition-transform", showConcluidas && "rotate-180")} />
          {showConcluidas ? "Ocultar" : "Mostrar"} concluídas ({concluidas.length})
        </button>
      ) : null}
    </div>
  );
}
