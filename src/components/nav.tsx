"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Clientes" },
  { href: "/leads", label: "Leads" },
];

export function Nav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="border-b border-white/[0.06] bg-brand-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-brand-silver/25 bg-gradient-to-br from-brand-charcoal to-brand-black">
            <span className="font-heading text-xs font-semibold tracking-tight text-gradient-silver">
              TR
            </span>
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
                  "rounded-full px-4 py-2 font-sans text-sm font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
