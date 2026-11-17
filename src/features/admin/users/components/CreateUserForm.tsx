"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { FormField, fieldClasses } from "@/components/ui/FormField";
import { createUser } from "../actions";
import type { UserRole } from "../roles";
import { RoleSelect } from "./RoleSelect";
import { PasswordFields } from "./PasswordFields";
import { FeedbackRegion, type Feedback } from "./FeedbackRegion";

export function CreateUserForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    startTransition(async () => {
      const result = await createUser({ fullName, email, role, password, passwordConfirmation });
      if (result.ok) {
        setFeedback({ tone: "success", text: result.message ?? "Usuário criado." });
        setFullName("");
        setEmail("");
        setRole("editor");
        setPassword("");
        setPasswordConfirmation("");
      } else {
        setFeedback({ tone: "error", text: result.error });
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };

  return (
    <section aria-labelledby="criar-usuario" className={cardClasses("bg-white rounded-lg p-6")}>
      <h2 id="criar-usuario" className="text-lg font-semibold text-mitram-dark">
        Criar usuário
      </h2>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        Defina a senha inicial e repasse-a à pessoa. Nenhum e-mail é enviado; o e-mail serve apenas como login.
      </p>

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

        <FormField label="E-mail (login)" error={fieldErrors.email}>
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

        <PasswordFields
          password={password}
          confirmation={passwordConfirmation}
          onPasswordChange={setPassword}
          onConfirmationChange={setPasswordConfirmation}
          errors={fieldErrors}
        />

        <RoleSelect value={role} onChange={setRole} error={fieldErrors.role} />

        <div className="flex items-start md:justify-end">
          <button type="submit" disabled={pending} className={buttonClasses("primary", "md", "md:mt-2")}>
            <UserPlus size={18} aria-hidden="true" />
            {pending ? "Criando..." : "Criar usuário"}
          </button>
        </div>
      </form>
    </section>
  );
}
