import { ElementType, ReactNode } from "react";

export type ContainerPadding = "default" | "loose" | "none";

const PADDING_CLASSES: Record<ContainerPadding, string> = {
  default: "px-4",
  loose: "px-6",
  none: "",
};

interface ContainerProps {
  as?: ElementType;
  padding?: ContainerPadding;
  className?: string;
  children: ReactNode;
}

/** Envolve o conteúdo com a largura máxima e o centralização padrão do site. */
export function Container({ as, padding = "default", className, children }: ContainerProps) {
  const Tag = as ?? "div";
  const classes = ["container mx-auto", PADDING_CLASSES[padding], className].filter(Boolean).join(" ");
  return <Tag className={classes}>{children}</Tag>;
}
