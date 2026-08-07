export function PurposeToggle({
  purpose,
  onChange,
}: {
  purpose: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex">
      <div className="bg-white rounded-full p-1.5 flex shadow-sm border border-gray-100">
        <button
          type="button"
          onClick={() => onChange("rent")}
          className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
            purpose === "rent"
              ? "bg-mitram-gold text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Alugar
        </button>
        <button
          type="button"
          onClick={() => onChange("sale")}
          className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
            purpose === "sale"
              ? "bg-mitram-gold text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
