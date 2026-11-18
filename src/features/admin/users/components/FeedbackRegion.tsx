"use client";

import { forwardRef } from "react";
import { AlertMessage } from "@/components/ui/AlertMessage";

export interface Feedback {
  tone: "success" | "error";
  text: string;
}

/**
 * Região viva sempre montada: leitores de tela costumam ignorar uma região
 * inserida já preenchida. `tabIndex=-1` permite mover o foco para cá quando o
 * botão clicado some após o refresh (ex.: Desativar -> Reativar).
 */
export const FeedbackRegion = forwardRef<HTMLDivElement, { feedback: Feedback | null }>(
  function FeedbackRegion({ feedback }, ref) {
    return (
      <div ref={ref} tabIndex={-1} aria-live="polite" aria-atomic="true" className="outline-none">
        {feedback && (
          <AlertMessage tone={feedback.tone} className="mb-4">
            {feedback.text}
          </AlertMessage>
        )}
      </div>
    );
  }
);
