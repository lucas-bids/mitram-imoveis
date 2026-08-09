"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { CHECKBOX_CLASSES } from "@/components/ui/FormField";
import { FilterOption } from "@/features/search/filters";

interface MultiSelectFieldProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
  triggerClassName: string;
  triggerStyle?: CSSProperties;
  showChevron?: boolean;
}

export function MultiSelectField({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  emptyMessage = "Nenhuma opção disponível.",
  triggerClassName,
  triggerStyle,
  showChevron = false,
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  const selectedIds = value ? value.split(",").filter(Boolean) : [];

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onChange(next.join(","));
  };

  const label = (() => {
    if (selectedIds.length === 0) return placeholder;
    if (selectedIds.length === 1) {
      return options.find((option) => option.id === selectedIds[0])?.name || placeholder;
    }
    return `${selectedIds.length} selecionados`;
  })();

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        style={triggerStyle}
        className={`${triggerClassName} flex items-center justify-between gap-2 text-left`}
      >
        <span className="truncate">{label}</span>
        {showChevron && (
          <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && !disabled && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-2 max-h-64 w-full min-w-[12rem] overflow-auto rounded-xl border-2 border-gray-200 bg-white p-1.5 shadow-lg"
        >
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</p>
          ) : (
            <>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="mb-1 w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-mitram-goldText hover:bg-mitram-gold/10"
                >
                  Limpar seleção
                </button>
              )}
              {options.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-mitram-dark hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option.id)}
                      className={CHECKBOX_CLASSES}
                    />
                    <span className="truncate">{option.name}</span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
