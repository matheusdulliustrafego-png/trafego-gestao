export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="bg-blob animate-blob h-[420px] w-[420px] bg-brand-blue/25"
        style={{ top: "-8%", left: "-6%" }}
      />
      <div
        className="bg-blob animate-blob-slow h-[380px] w-[380px] bg-brand-purple/25"
        style={{ top: "10%", right: "-8%", animationDelay: "-6s" }}
      />
      <div
        className="bg-blob animate-blob h-[340px] w-[340px] bg-brand-pink/20"
        style={{ bottom: "-6%", left: "20%", animationDelay: "-12s" }}
      />
      <div
        className="bg-blob animate-blob-slow h-[300px] w-[300px] bg-brand-cyan/15"
        style={{ bottom: "10%", right: "15%", animationDelay: "-3s" }}
      />
      <div className="absolute inset-0 bg-brand-black/40" />
    </div>
  );
}
