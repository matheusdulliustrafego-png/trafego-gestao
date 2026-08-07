"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ListField({
  name,
  label,
  placeholder,
  initialItems = [],
}: {
  name: string;
  label: string;
  placeholder?: string;
  initialItems?: string[];
}) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    setItems((prev) => [...prev, value]);
    setDraft("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <span className="font-sans text-sm text-white/80">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                aria-label="Remover item"
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
              <input type="hidden" name={name} value={item} />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10"
        />
        <button
          type="button"
          onClick={addItem}
          className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 font-sans text-sm text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <Plus className="size-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}
