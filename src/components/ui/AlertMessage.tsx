import { ReactNode } from "react";

export type AlertTone = "error" | "success" | "info";

const TONE_CLASSES: Record<AlertTone, string> = {
  error: "bg-mitram-errorLight text-mitram-error border-red-100",
  success: "bg-mitram-successLight text-mitram-success border-green-100",
  info: "bg-mitram-infoLight text-mitram-info border-blue-100",
};

interface AlertMessageProps {
  tone: AlertTone;
  className?: string;
  children: ReactNode;
}

export function AlertMessage({ tone, className, children }: AlertMessageProps) {
  return (
    <div className={["rounded-xl border p-3 text-sm", TONE_CLASSES[tone], className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
