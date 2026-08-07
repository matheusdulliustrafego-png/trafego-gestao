"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, Check, X } from "lucide-react";
import { deleteLead } from "@/actions/leads";
import { cn } from "@/lib/utils";

export function LeadDeleteButton({ leadId }: { leadId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function askConfirm() {
    setConfirming(true);
    timeoutRef.current = setTimeout(() => setConfirming(false), 4000);
  }

  function cancel() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
  }

  function confirm() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startTransition(async () => {
      await deleteLead(leadId);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <span className="font-sans text-xs text-destructive">Excluir?</span>
        <button
          type="button"
          onClick={confirm}
          disabled={isPending}
          aria-label="Confirmar exclusão"
          className="flex size-7 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/15 disabled:opacity-50"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          aria-label="Cancelar"
          className="flex size-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={askConfirm}
      aria-label="Excluir lead"
      className={cn(
        "flex size-7 items-center justify-center rounded-full text-white/25 transition-colors hover:bg-destructive/15 hover:text-destructive"
      )}
    >
      <Trash2 className="size-4" />
    </button>
  );
}
