export type ButtonVariant = "primary" | "secondary" | "gold" | "inverse";
export type ButtonSize = "lg" | "md" | "sm";

// A borda existe em todas as variantes para que primário e secundário tenham a mesma altura.
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  lg: "px-8 py-4 text-base",
  md: "px-5 py-2.5 text-[15px]",
  sm: "px-4 py-2 text-sm",
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-mitram-dark text-white shadow-md hover:bg-black",
  secondary: "border-mitram-dark text-mitram-dark hover:bg-mitram-dark hover:text-white",
  gold: "border-transparent bg-mitram-gold text-white shadow-md hover:bg-mitram-goldDark",
  inverse: "border-transparent bg-white text-mitram-dark shadow-md hover:bg-gray-100",
};

export function buttonClasses(variant: ButtonVariant, size: ButtonSize = "lg", extra?: string) {
  return [BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], extra].filter(Boolean).join(" ");
}

// Para botões com cor própria de marca (WhatsApp, YouTube) que ainda devem seguir a forma padrão.
export function buttonShapeClasses(size: ButtonSize = "lg", extra?: string) {
  return [BUTTON_BASE, BUTTON_SIZES[size], "border-transparent", extra].filter(Boolean).join(" ");
}
