import { ReactNode } from "react";

export type BadgeTone = "gold" | "red" | "green" | "gray" | "blue" | "purple" | "yellow";

interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: "bg-mitram-gold/90 text-white backdrop-blur-md shadow-sm",
  red: "bg-mitram-error/90 text-white backdrop-blur-md shadow-sm",
  green: "bg-mitram-successLight text-mitram-success",
  gray: "bg-gray-100 text-gray-800",
  blue: "bg-mitram-infoLight text-mitram-info",
  purple: "bg-purple-100 text-purple-800",
  yellow: "bg-mitram-warningLight text-mitram-warning",
};

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}
