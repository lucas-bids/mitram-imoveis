interface SectionEyebrowProps {
  children: React.ReactNode;
}

export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 mb-2 rounded-full bg-mitram-gold/10 text-mitram-gold font-bold text-xs uppercase tracking-widest border border-mitram-gold/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mitram-gold opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-mitram-gold"></span>
      </span>
      {children}
    </div>
  );
}
