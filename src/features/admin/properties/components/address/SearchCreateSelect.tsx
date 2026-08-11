"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { fieldClasses } from "@/components/ui/FormField";

type Option = { id: string; name: string };

interface Props<T extends Option> {
  id: string;
  value?: string | null;
  options: T[];
  disabled?: boolean;
  placeholder: string;
  createLabel: string;
  onChange: (id: string, option: T) => void;
  onCreate: (name: string) => Promise<T>;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function SearchCreateSelect<T extends Option>({ id, value, options, disabled, placeholder, createLabel, onChange, onCreate }: Props<T>) {
  const selected = options.find((option) => option.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalized = normalize(query);
  const matches = useMemo(() => options.filter((option) => normalize(option.name).includes(normalized)), [options, normalized]);
  const exact = options.some((option) => normalize(option.name) === normalized);
  const canCreate = query.trim().length >= 2 && !exact;

  const select = (option: T) => {
    onChange(option.id, option);
    setQuery("");
    setOpen(false);
    setError(null);
  };

  const create = async () => {
    if (!canCreate || loading) return;
    setLoading(true);
    setError(null);
    try {
      select(await onCreate(query.trim()));
    } catch {
      setError(`Não foi possível criar ${createLabel.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          autoComplete="off"
          disabled={disabled || loading}
          value={open ? query : selected?.name || ""}
          placeholder={placeholder}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          className={`${fieldClasses()} disabled:cursor-not-allowed disabled:bg-gray-50`}
        />
      </div>
      {open && !disabled && (
        <div id={`${id}-options`} className="absolute z-30 mt-2 max-h-60 w-full overflow-auto rounded-xl border-2 border-gray-200 bg-white p-1 shadow-lg">
          {matches.map((option) => (
            <button key={option.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(option)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">
              {option.name}{option.id === value && <Check size={14} />}
            </button>
          ))}
          {canCreate && (
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void create()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-mitram-goldText hover:bg-mitram-gold/10">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Criar {createLabel.toLowerCase()} “{query.trim()}”
            </button>
          )}
          {matches.length === 0 && !canCreate && <p className="px-3 py-2 text-sm text-gray-500">Digite ao menos 2 caracteres.</p>}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
