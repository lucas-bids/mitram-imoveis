import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

export type HeadingVariant = "display" | "h1" | "h2" | "h3" | "h4" | "micro";
export type HeadingTone = "dark" | "light";

const HEADING_VARIANTS: Record<HeadingVariant, string> = {
  display: "text-3xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight",
  h1: "text-3xl md:text-5xl font-bold tracking-tight",
  h2: "text-2xl md:text-4xl font-bold leading-tight",
  h3: "text-xl md:text-2xl font-bold",
  h4: "text-base md:text-lg font-bold",
  micro: "text-xs font-bold leading-tight",
};

const HEADING_TONE: Record<HeadingTone, string> = {
  dark: "text-mitram-dark",
  light: "text-white",
};

// A tag semântica só precisa refletir a hierarquia real da página; o tamanho
// visual é controlado por `variant`, então os dois podem divergir (ex.: o
// <h1> de um formulário de login pode usar variant="h3").
const DEFAULT_TAG: Record<HeadingVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  micro: "h4",
};

interface HeadingOwnProps {
  variant: HeadingVariant;
  as?: ElementType;
  tone?: HeadingTone;
  className?: string;
  children: ReactNode;
}

type HeadingProps = HeadingOwnProps & Omit<ComponentPropsWithoutRef<"h1">, keyof HeadingOwnProps>;

export function Heading({ variant, as, tone = "dark", className, children, ...rest }: HeadingProps) {
  const Tag = as ?? DEFAULT_TAG[variant];
  const classes = [HEADING_VARIANTS[variant], HEADING_TONE[tone], className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
