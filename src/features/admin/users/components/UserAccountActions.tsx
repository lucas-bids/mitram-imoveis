"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Trash2, UserX } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { deactivateUser, deleteUser, reactivateUser } from "../actions";
import type { ActionResult, AdminUser } from "../types";
import { FeedbackRegion, type Feedback } from "./FeedbackRegion";

interface UserAccountActionsProps {
  user: AdminUser;
  isSelf: boolean;
}

export function UserAccountActions({ user, isSelf }: UserAccountActionsProps) {
  const router = useRouter();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const label = user.fullName || user.email;

  const run = (action: () => Promise<ActionResult>, confirmMessage?: string) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      setFeedback(
        result.ok
          ? { tone: "success", text: result.message ?? "Feito." }
          : { tone: "error", text: result.error }
      );
      // O botão clicado pode sumir no refresh (Desativar <-> Reativar); o foco
      // vai para a mensagem em vez de cair no <body>.
      feedbackRef.current?.focus();
      if (result.ok) router.refresh();
    });
  };

  const deactivated = user.status === "deactivated";

  return (
    <section aria-labelledby="acesso-usuario" className={cardClasses("bg-white rounded-lg p-6")}>
      <h2 id="acesso-usuario" className="text-lg font-semibold text-mitram-dark">
        Acesso
      </h2>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        Desativar bloqueia o acesso e encerra as sessões na hora, e pode ser desfeito. Excluir remove a conta
        de vez; os imóveis cadastrados continuam no site.
      </p>

      <FeedbackRegion ref={feedbackRef} feedback={feedback} />

      <div className="flex flex-wrap gap-3">
        {deactivated ? (
          <button
            type="button"
            disabled={pending}
            className={buttonClasses("secondary", "sm")}
            onClick={() => run(() => reactivateUser(user.id), `Reativar o acesso de ${label}?`)}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reativar
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            className={buttonClasses("danger", "sm")}
            onClick={() =>
              run(
                () => deactivateUser(user.id),
                isSelf
                  ? "Você vai desativar a sua própria conta e sair do painel. Continuar?"
                  : `Desativar ${label}? O acesso é bloqueado imediatamente.`
              )
            }
          >
            <UserX size={16} aria-hidden="true" />
            Desativar
          </button>
        )}

        <button
          type="button"
          disabled={pending}
          className={buttonClasses("danger", "sm")}
          onClick={() =>
            run(
              () => deleteUser(user.id),
              isSelf
                ? "Você vai EXCLUIR a sua própria conta permanentemente. Esta ação não pode ser desfeita. Continuar?"
                : `Excluir ${label} permanentemente? Esta ação não pode ser desfeita.`
            )
          }
        >
          <Trash2 size={16} aria-hidden="true" />
          Excluir
        </button>
      </div>
    </section>
  );
}
