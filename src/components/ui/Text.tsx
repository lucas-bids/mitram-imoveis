import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export type TextVariant = "lead" | "body" | "bodySm" | "caption" | "label";
export type TextTone = "dark" | "light";

const TEXT_VARIANTS: Record<TextVariant, string> = {
  lead: "text-lg md:text-xl leading-relaxed",
  body: "text-base leading-relaxed",
  bodySm: "text-sm leading-relaxed text-gray-500",
  caption: "text-xs text-gray-500",
  label: "text-sm font-semibold text-mitram-dark",
};

// Só lead/body variam de cor conforme o fundo (claro/escuro); os demais têm
// cor fixa porque, no site, sempre aparecem como texto de apoio em fundo claro.
const TONED_VARIANTS: readonly TextVariant[] = ["lead", "body"];
const TONE_CLASSES: Record<TextTone, string> = {
  dark: "text-gray-600",
  light: "text-gray-200",
};

const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  lead: "p",
  body: "p",
  bodySm: "p",
  caption: "p",
  label: "span",
};

interface TextOwnProps {
  variant: TextVariant;
  as?: ElementType;
  tone?: TextTone;
  className?: string;
  children: ReactNode;
}

// "label" é o tipo de elemento HTML mais permissivo entre os usados via `as`
// (inclui htmlFor), por isso serve de base para as props extras repassadas.
type TextProps = TextOwnProps & Omit<ComponentPropsWithoutRef<"label">, keyof TextOwnProps>;

export function Text({ variant, as, tone = "dark", className, children, ...rest }: TextProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  const classes = [
    TEXT_VARIANTS[variant],
    TONED_VARIANTS.includes(variant) ? TONE_CLASSES[tone] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
