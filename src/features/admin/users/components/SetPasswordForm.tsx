"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { setUserPassword } from "../actions";
import type { AdminUser } from "../types";
import { PasswordFields } from "./PasswordFields";
import { FeedbackRegion, type Feedback } from "./FeedbackRegion";

interface SetPasswordFormProps {
  user: AdminUser;
  isSelf: boolean;
}

export function SetPasswordForm({ user, isSelf }: SetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const label = user.fullName || user.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const confirmMessage = isSelf
      ? "Você vai redefinir a sua própria senha. Todas as suas sessões serão encerradas e você precisará entrar de novo. Continuar?"
      : `Redefinir a senha de ${label}? Todas as sessões abertas desse usuário serão encerradas.`;
    if (!window.confirm(confirmMessage)) return;

    startTransition(async () => {
      const result = await setUserPassword({ id: user.id, password, passwordConfirmation });
      if (result.ok) {
        setFeedback({ tone: "success", text: result.message ?? "Senha redefinida." });
        setPassword("");
        setPasswordConfirmation("");
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.error });
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };

  return (
    <section aria-labelledby="senha-usuario" className={cardClasses("bg-white rounded-lg p-6")}>
      <h2 id="senha-usuario" className="text-lg font-semibold text-mitram-dark">
        Redefinir senha
      </h2>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        A nova senha vale na hora e todas as sessões abertas são encerradas. Repasse a senha à pessoa.
      </p>

      <FeedbackRegion feedback={feedback} />

      <form onSubmit={handleSubmit} noValidate className="grid gap-4 md:grid-cols-2">
        <PasswordFields
          password={password}
          confirmation={passwordConfirmation}
          onPasswordChange={setPassword}
          onConfirmationChange={setPasswordConfirmation}
          errors={fieldErrors}
          label="Nova senha"
        />

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={pending} className={buttonClasses("secondary", "md")}>
            <KeyRound size={18} aria-hidden="true" />
            {pending ? "Salvando..." : "Redefinir senha"}
          </button>
        </div>
      </form>
    </section>
  );
}
