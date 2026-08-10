export function RangeField({
  isActive,
  minValue,
  maxValue,
  minPlaceholder,
  maxPlaceholder,
  unit,
  onChangeMin,
  onChangeMax,
}: {
  isActive: boolean;
  minValue: string;
  maxValue: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  unit: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
}) {
  const rangeBoxClasses = `relative flex items-center rounded-xl border-2 bg-white px-2 pb-3 pt-6 transition-all focus-within:border-mitram-gold focus-within:ring-2 focus-within:ring-mitram-gold/20 ${
    isActive ? "border-mitram-gold" : "border-gray-200"
  }`;
  const rangeInputClasses = "w-full bg-transparent px-3 text-sm text-mitram-dark outline-none";

  return (
    <div className={rangeBoxClasses}>
      <input
        type="number"
        min="0"
        placeholder={minPlaceholder}
        value={minValue}
        onChange={(e) => onChangeMin(e.target.value)}
        className={rangeInputClasses}
      />
      <span className="text-gray-300">Até</span>
      <input
        type="number"
        min="0"
        placeholder={maxPlaceholder}
        value={maxValue}
        onChange={(e) => onChangeMax(e.target.value)}
        className={rangeInputClasses}
      />
    </div>
  );
}
