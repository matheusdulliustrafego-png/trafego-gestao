import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      <div className="flex items-center gap-3">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md", accent)}>
          <Icon className="size-4.5" strokeWidth={2} />
        </span>
        <div>
          <h2 className="font-heading text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="font-sans text-sm text-white/50">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
