"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { FormField, fieldClasses } from "@/components/ui/FormField";
import { updateUser } from "../actions";
import type { UserRole } from "../roles";
import type { AdminUser } from "../types";
import { RoleSelect } from "./RoleSelect";
import { FeedbackRegion, type Feedback } from "./FeedbackRegion";

interface EditUserFormProps {
  user: AdminUser;
  isSelf: boolean;
}

export function EditUserForm({ user, isSelf }: EditUserFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [role, setRole] = useState<UserRole | "">(user.role ?? "");
  const [email, setEmail] = useState(user.email);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    if (isSelf && user.role === "admin" && role === "editor") {
      const ok = window.confirm(
        "Você vai deixar de ser administrador e perderá o acesso ao gerenciamento de usuários. Continuar?"
      );
      if (!ok) return;
    }

    startTransition(async () => {
      const result = await updateUser({
        id: user.id,
        fullName,
        role,
        email,
        // Sem troca de e-mail não há o que confirmar.
        emailConfirmation: emailChanged ? emailConfirmation : email,
      });
      if (result.ok) {
        setFeedback({ tone: "success", text: result.message ?? "Usuário atualizado." });
        setEmailConfirmation("");
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.error });
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };

  return (
    <section aria-labelledby="dados-usuario" className={cardClasses("bg-white rounded-lg p-6")}>
      <h2 id="dados-usuario" className="mb-4 text-lg font-semibold text-mitram-dark">
        Dados do usuário
      </h2>

      <FeedbackRegion feedback={feedback} />

      <form onSubmit={handleSubmit} noValidate className="grid gap-4 md:grid-cols-2">
        <FormField label="Nome" error={fieldErrors.fullName}>
          <input
            name="fullName"
            type="text"
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            maxLength={100}
            placeholder=" "
            aria-invalid={!!fieldErrors.fullName}
            className={fieldClasses(!!fieldErrors.fullName)}
          />
        </FormField>

        <RoleSelect value={role} onChange={setRole} error={fieldErrors.role} />

        <FormField
          label="E-mail (login)"
          error={fieldErrors.email}
          hint="A troca vale na hora; a senha continua a mesma. Nenhum e-mail é enviado."
        >
          <input
            name="email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            placeholder=" "
            aria-invalid={!!fieldErrors.email}
            className={fieldClasses(!!fieldErrors.email)}
          />
        </FormField>

        {emailChanged && (
          <FormField label="Confirme o novo e-mail" error={fieldErrors.emailConfirmation}>
            <input
              name="emailConfirmation"
              type="email"
              autoComplete="off"
              value={emailConfirmation}
              onChange={(e) => setEmailConfirmation(e.target.value)}
              required
              maxLength={254}
              placeholder=" "
              aria-invalid={!!fieldErrors.emailConfirmation}
              className={fieldClasses(!!fieldErrors.emailConfirmation)}
            />
          </FormField>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={pending} className={buttonClasses("primary", "md")}>
            <Save size={18} aria-hidden="true" />
            {pending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </section>
  );
}
