"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2, Check, X } from "lucide-react";
import { deleteCliente } from "@/actions/clientes";

export function ClienteDeleteButton({ clienteId }: { clienteId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function askConfirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(true);
    timeoutRef.current = setTimeout(() => setConfirming(false), 4000);
  }

  function cancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfirming(false);
  }

  function confirm(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startTransition(async () => {
      await deleteCliente(clienteId);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-brand-black/90 p-1 backdrop-blur-sm">
        <span className="pl-1.5 font-sans text-xs text-destructive">Excluir?</span>
        <button
          type="button"
          onClick={confirm}
          disabled={isPending}
          aria-label="Confirmar exclusão"
          className="flex size-6 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/15 disabled:opacity-50"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          aria-label="Cancelar"
          className="flex size-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={askConfirm}
      aria-label="Excluir cliente"
      className="flex size-7 items-center justify-center rounded-full bg-brand-black/70 text-white/50 backdrop-blur-sm transition-colors hover:bg-destructive/20 hover:text-destructive"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
