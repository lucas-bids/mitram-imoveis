"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { plainFieldClasses } from "@/components/ui/FormField";
import { FilterPills } from "@/features/search/components/FilterPills";
import {
  FeatureOption,
  addPropertyFeature,
  createFeature,
  deleteFeatureGlobally,
  removePropertyFeature,
} from "@/features/admin/properties/components/features/mutations";

export type SelectedFeature = { id: string; name: string };

interface FeatureSelectorProps {
  propertyId?: string;
  allFeatures: FeatureOption[];
  selected: SelectedFeature[];
  onSelectedChange: (features: SelectedFeature[]) => void;
}

type PendingAction =
  | { type: "add" | "remove" | "delete"; id: string }
  | { type: "create" };

type Row = { kind: "option"; feature: FeatureOption } | { kind: "create" };

const MIN_QUERY_LENGTH = 3;

export function FeatureSelector({ propertyId, allFeatures, selected, onSelectedChange }: FeatureSelectorProps) {
  const [options, setOptions] = useState<FeatureOption[]>(allFeatures);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const showResults = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const dropdownVisible = open && trimmedQuery.length > 0;

  const exactMatch = useMemo(
    () => options.find((option) => option.name.trim().toLowerCase() === normalizedQuery),
    [options, normalizedQuery],
  );

  const filteredOptions = useMemo(() => {
    if (!showResults) return [];
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(normalizedQuery) &&
        !selected.some((s) => s.id === option.id),
    );
  }, [options, normalizedQuery, showResults, selected]);

  const canCreate = showResults && !exactMatch;
  const alreadySelectedExactMatch =
    showResults && !!exactMatch && selected.some((s) => s.id === exactMatch.id);

  const rows: Row[] = useMemo(() => {
    const optionRows: Row[] = filteredOptions.map((feature) => ({ kind: "option", feature }));
    return canCreate ? [...optionRows, { kind: "create" }] : optionRows;
  }, [filteredOptions, canCreate]);

  const busy = pendingAction !== null;

  const closeDropdown = () => {
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelect = async (feature: FeatureOption) => {
    if (busy || selected.some((s) => s.id === feature.id)) return;

    const previous = selected;
    const next = [...selected, { id: feature.id, name: feature.name }];
    setQuery("");
    closeDropdown();
    setError(null);
    onSelectedChange(next);

    if (!propertyId) return;

    setPendingAction({ type: "add", id: feature.id });
    try {
      await addPropertyFeature(propertyId, feature.id);
    } catch {
      onSelectedChange(previous);
      setError(`Não foi possível adicionar "${feature.name}". Tente novamente.`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemove = async (featureId: string) => {
    if (busy) return;
    const feature = selected.find((s) => s.id === featureId);
    if (!feature) return;

    const previous = selected;
    onSelectedChange(selected.filter((s) => s.id !== featureId));
    setError(null);

    if (!propertyId) return;

    setPendingAction({ type: "remove", id: featureId });
    try {
      await removePropertyFeature(propertyId, featureId);
    } catch {
      onSelectedChange(previous);
      setError(`Não foi possível remover "${feature.name}". Tente novamente.`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCreate = async () => {
    if (busy || !trimmedQuery) return;

    setPendingAction({ type: "create" });
    setError(null);
    try {
      const feature = await createFeature(trimmedQuery);
      setOptions((prev) => (prev.some((o) => o.id === feature.id) ? prev : [...prev, feature]));
      setQuery("");
      closeDropdown();

      if (selected.some((s) => s.id === feature.id)) return;

      const previous = selected;
      onSelectedChange([...selected, { id: feature.id, name: feature.name }]);

      if (propertyId) {
        try {
          await addPropertyFeature(propertyId, feature.id);
        } catch {
          onSelectedChange(previous);
          setError(`"${feature.name}" foi criada, mas não foi possível associá-la a este imóvel. Selecione-a novamente.`);
        }
      }
    } catch {
      setError("Não foi possível criar a característica. Tente novamente.");
    } finally {
      setPendingAction(null);
    }
  };

  const performDelete = async (feature: FeatureOption) => {
    setPendingAction({ type: "delete", id: feature.id });
    setError(null);
    try {
      await deleteFeatureGlobally(feature.id);
      setOptions((prev) => prev.filter((o) => o.id !== feature.id));
      if (selected.some((s) => s.id === feature.id)) {
        onSelectedChange(selected.filter((s) => s.id !== feature.id));
      }
    } catch {
      setError(`Não foi possível excluir "${feature.name}". Tente novamente.`);
    } finally {
      setPendingAction(null);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, feature: FeatureOption) => {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;

    const confirmed = window.confirm(
      `Excluir a característica "${feature.name}" permanentemente?\n\nEsta ação não pode ser desfeita e removerá "${feature.name}" de todos os imóveis que a utilizam.`,
    );
    if (!confirmed) return;

    void performDelete(feature);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownVisible || rows.length === 0) {
      if (event.key === "Escape") closeDropdown();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const row = rows[highlightedIndex];
      if (!row) return;
      if (row.kind === "create") void handleCreate();
      else void handleSelect(row.feature);
    } else if (event.key === "Escape") {
      closeDropdown();
    }
  };

  const activeDescendantId = (() => {
    const row = rows[highlightedIndex];
    if (!row) return undefined;
    return row.kind === "create" ? "feature-option-create" : `feature-option-${row.feature.id}`;
  })();

  return (
    <div ref={wrapperRef} className="md:col-span-2">
      <label htmlFor="feature-search-input" className="mb-2 block text-sm font-medium text-gray-700">
        Buscar característica
      </label>
      <div className="relative">
        <input
          id="feature-search-input"
          type="text"
          role="combobox"
          aria-expanded={dropdownVisible}
          aria-controls="feature-options-listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId}
          placeholder="Digite ao menos 3 caracteres, ex: academia"
          autoComplete="off"
          value={query}
          disabled={busy && pendingAction?.type === "create"}
          onChange={(event) => {
            setQuery(event.target.value);
            setHighlightedIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={plainFieldClasses()}
        />

        {dropdownVisible && (
          <ul
            id="feature-options-listbox"
            role="listbox"
            aria-label="Resultados de características"
            onMouseDown={(event) => event.preventDefault()}
            className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border-2 border-gray-200 bg-white p-1 shadow-lg"
          >
            {!showResults && (
              <li className="px-3 py-2 text-sm text-gray-500">
                Digite ao menos {MIN_QUERY_LENGTH} caracteres para buscar.
              </li>
            )}

            {showResults && filteredOptions.length === 0 && !canCreate && (
              <li className="px-3 py-2 text-sm text-gray-500">
                {alreadySelectedExactMatch
                  ? `"${exactMatch?.name}" já foi adicionada.`
                  : "Nenhuma característica encontrada."}
              </li>
            )}

            {filteredOptions.map((option, index) => (
              <li
                key={option.id}
                id={`feature-option-${option.id}`}
                role="option"
                aria-selected={highlightedIndex === index}
                className={`flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-sm ${
                  highlightedIndex === index ? "bg-mitram-gold/10" : "hover:bg-gray-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => void handleSelect(option)}
                  disabled={busy}
                  className="flex-1 truncate rounded-md px-1.5 py-1 text-left text-mitram-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {option.name}
                </button>
                <button
                  type="button"
                  onClick={(event) => handleDeleteClick(event, option)}
                  disabled={busy}
                  aria-label={`Excluir característica "${option.name}" permanentemente`}
                  title="Excluir permanentemente"
                  className="shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction?.type === "delete" && pendingAction.id === option.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
              </li>
            ))}

            {canCreate && (
              <li
                id="feature-option-create"
                role="option"
                aria-selected={highlightedIndex === filteredOptions.length}
                className={`rounded-lg ${highlightedIndex === filteredOptions.length ? "bg-mitram-gold/10" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={busy}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-mitram-goldText hover:bg-mitram-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction?.type === "create" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Criar &ldquo;{trimmedQuery}&rdquo;
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3">
        <FilterPills
          activePills={selected.map((feature) => ({ key: feature.id, label: feature.name }))}
          onRemove={(key) => void handleRemove(key)}
        />
      </div>
    </div>
  );
}
