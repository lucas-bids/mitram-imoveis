import type { CSSProperties, ReactNode } from "react";

const FIELD_SHELL =
  "block w-full rounded-xl border-2 bg-white px-5 text-mitram-dark shadow-sm outline-none transition-all";
/** Padding assimétrico para o rótulo flutuante (FormField). */
const FIELD_FLOATING = "peer pb-3 pt-6";
/** Padding simétrico quando o rótulo fica fora do controle. */
const FIELD_PLAIN = "py-3";
const FIELD_NORMAL = "border-gray-200 focus:border-mitram-gold focus:ring-2 focus:ring-mitram-gold/20";
const FIELD_ERROR = "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

export function fieldClasses(hasError?: boolean, extra?: string) {
  return [FIELD_SHELL, FIELD_FLOATING, hasError ? FIELD_ERROR : FIELD_NORMAL, extra].filter(Boolean).join(" ");
}

/** Mesmo visual de fieldClasses, com texto centralizado na vertical (sem rótulo flutuante). */
export function plainFieldClasses(hasError?: boolean, extra?: string) {
  return [FIELD_SHELL, FIELD_PLAIN, hasError ? FIELD_ERROR : FIELD_NORMAL, extra].filter(Boolean).join(" ");
}

export const SELECT_EXTRA = "cursor-pointer appearance-none pr-12";

export const SELECT_ARROW_STYLE: CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1.25rem top 50%",
  backgroundSize: "0.65rem auto",
};

export const CHECKBOX_CLASSES =
  "h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-gray-300 accent-mitram-gold transition-colors focus:ring-2 focus:ring-mitram-gold/20";

interface FormFieldProps {
  label: string;
  error?: string;
  /** Sufixo exibido dentro do campo, como R$ ou m². Exige pr-12 no controle. */
  affix?: string;
  /** Selects e campos compostos não têm :placeholder-shown, então o rótulo fica sempre no alto. */
  alwaysFloat?: boolean;
  className?: string;
  children: ReactNode;
}

// O rótulo ocupa o lugar do placeholder enquanto o campo está vazio e sobe ao receber foco ou valor.
// O controle precisa vir como primeiro filho e usar fieldClasses(), que aplica a classe peer.
export function FormField({ label, error, affix, alwaysFloat, className, children }: FormFieldProps) {
  const floatOnFill =
    "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75";

  return (
    <label className={`block ${className ?? ""}`}>
      <span className="relative block">
        {children}
        <span
          className={`pointer-events-none absolute left-5 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-sm transition-transform duration-300 ${
            error ? "text-red-500" : "text-gray-500"
          } ${alwaysFloat ? "" : floatOnFill}`}
        >
          {label}
        </span>
        {affix && (
          <span className="pointer-events-none absolute bottom-3 right-5 font-medium text-gray-400">
            {affix}
          </span>
        )}
      </span>
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
