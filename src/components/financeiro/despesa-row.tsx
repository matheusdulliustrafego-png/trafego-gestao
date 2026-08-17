"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { updateDespesa, deleteDespesa } from "@/actions/despesas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Despesa = {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: Date;
};

export function DespesaRow({ despesa }: { despesa: Despesa }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <form
        action={async (formData) => {
          await updateDespesa(despesa.id, formData);
          setEditando(false);
        }}
        className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`descricao-${despesa.id}`}>Descrição *</Label>
            <Input id={`descricao-${despesa.id}`} name="descricao" required defaultValue={despesa.descricao} className="h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`categoria-${despesa.id}`}>Categoria</Label>
            <Input id={`categoria-${despesa.id}`} name="categoria" defaultValue={despesa.categoria} className="h-10" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`valor-${despesa.id}`}>Valor (R$)</Label>
            <Input id={`valor-${despesa.id}`} name="valor" type="number" step="0.01" defaultValue={despesa.valor} className="h-10" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`data-${despesa.id}`}>Data *</Label>
            <Input id={`data-${despesa.id}`} name="data" type="date" required defaultValue={toDateInputValue(despesa.data)} className="h-10" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" variant="secondary" size="sm" className="rounded-full">
            Salvar
          </Button>
          <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => setEditando(false)}>
            <X className="size-3.5" /> Cancelar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div>
        <p className="font-sans text-sm font-medium text-white">{despesa.descricao}</p>
        <p className="font-sans text-xs text-white/40">
          {[despesa.categoria, formatDate(despesa.data)].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-sans text-sm font-medium text-brand-danger">{formatCurrency(despesa.valor)}</span>
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label="Editar despesa"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Pencil className="size-4" />
        </button>
        <form action={deleteDespesa.bind(null, despesa.id)}>
          <button
            type="submit"
            aria-label="Remover despesa"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-brand-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
