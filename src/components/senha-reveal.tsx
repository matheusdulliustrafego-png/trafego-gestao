"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

export function SenhaReveal({ senha }: { senha: string }) {
  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);

  if (!senha) return <span className="font-sans text-sm text-white/30">—</span>;

  async function copiar() {
    await navigator.clipboard.writeText(senha);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-sm text-white">
        {visivel ? senha : "•".repeat(Math.min(senha.length, 10))}
      </span>
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        className="flex size-6 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        {visivel ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
      <button
        type="button"
        onClick={copiar}
        aria-label="Copiar senha"
        className="flex size-6 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        {copiado ? <Check className="size-3.5 text-brand-success" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}
