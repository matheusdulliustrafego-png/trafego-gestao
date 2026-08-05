"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Clientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/leads", label: "Leads" },
];

export function Nav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/leads") return null;

  return (
    <header className="border-b border-white/[0.06] bg-brand-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue via-brand-purple to-brand-pink shadow-[0_0_16px_-2px_rgba(168,85,247,0.6)]">
            <span className="font-heading text-xs font-semibold tracking-tight text-white">TR</span>
          </span>
          <span className="font-heading text-sm font-medium text-white">Gestão</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors",
                  active ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {active ? (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-blue/25 via-brand-purple/25 to-brand-pink/25" />
                ) : null}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
