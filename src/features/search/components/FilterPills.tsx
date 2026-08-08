import { X } from "lucide-react";

export function FilterPills({
  activePills,
  onRemove,
  onClearAll,
}: {
  activePills: { key: string; label: string }[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
}) {
  if (activePills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activePills.map(pill => (
        <div key={pill.key} className="flex items-center gap-1.5 bg-mitram-gold/10 text-[#A6851D] px-3 py-1.5 rounded-full text-xs font-bold border border-mitram-gold/30">
          <span>{pill.label}</span>
          <button
            type="button"
            onClick={() => onRemove(pill.key)}
            className="hover:bg-mitram-gold/20 rounded-full p-0.5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 bg-red-500/10 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold border border-red-500/30 hover:bg-red-500/20 transition-colors"
        >
          <X size={14} />
          <span>Limpar filtros</span>
        </button>
      )}
    </div>
  );
}
