"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";
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
  onDelete: (option: T) => Promise<void>;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function SearchCreateSelect<T extends Option>({ id, value, options, disabled, placeholder, createLabel, onChange, onCreate, onDelete }: Props<T>) {
  const selected = options.find((option) => option.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const normalized = normalize(query);
  const matches = useMemo(() => options.filter((option) => normalize(option.name).includes(normalized)), [options, normalized]);
  const exact = options.some((option) => normalize(option.name) === normalized);
  const canCreate = query.trim().length >= 2 && !exact;
  const busy = loading || deletingId !== null;

  const select = (option: T) => {
    onChange(option.id, option);
    setQuery("");
    setOpen(false);
    setError(null);
  };

  const create = async () => {
    if (!canCreate || busy) return;
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

  const performDelete = async (option: T) => {
    setDeletingId(option.id);
    setError(null);
    try {
      await onDelete(option);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Não foi possível excluir ${createLabel.toLowerCase()} "${option.name}".`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, option: T) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    const confirmed = window.confirm(
      `Excluir ${createLabel.toLowerCase()} "${option.name}"?\n\nEla deixará de aparecer para novos imóveis. Isso não afeta imóveis já cadastrados.`,
    );
    if (!confirmed) return;

    void performDelete(option);
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
            <div key={option.id} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-sm hover:bg-gray-50">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
                disabled={busy}
                className="flex flex-1 items-center justify-between gap-2 truncate rounded-md px-1.5 py-1 text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="truncate">{option.name}</span>
                {option.id === value && <Check size={14} className="shrink-0" />}
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => handleDeleteClick(event, option)}
                disabled={busy}
                aria-label={`Excluir ${createLabel.toLowerCase()} "${option.name}"`}
                title="Excluir"
                className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === option.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              </button>
            </div>
          ))}
          {canCreate && (
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void create()} disabled={busy} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-mitram-goldText hover:bg-mitram-gold/10 disabled:cursor-not-allowed disabled:opacity-50">
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
