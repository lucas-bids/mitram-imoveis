"use client";

import { FormField, fieldClasses } from "@/components/ui/FormField";
import { PASSWORD_RULE_HINT } from "../schema";

interface PasswordFieldsProps {
  password: string;
  confirmation: string;
  onPasswordChange: (value: string) => void;
  onConfirmationChange: (value: string) => void;
  errors: Record<string, string>;
  /** Rótulo do primeiro campo ("Senha" na criação, "Nova senha" na redefinição). */
  label?: string;
}

/** Senha + confirmação, digitadas pelo admin. Nunca pré-preenchidas, nunca exibidas depois. */
export function PasswordFields({
  password,
  confirmation,
  onPasswordChange,
  onConfirmationChange,
  errors,
  label = "Senha",
}: PasswordFieldsProps) {
  return (
    <>
      <FormField label={label} error={errors.password} hint={PASSWORD_RULE_HINT}>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={8}
          maxLength={72}
          placeholder=" "
          aria-invalid={!!errors.password}
          className={fieldClasses(!!errors.password)}
        />
      </FormField>

      <FormField label={`Confirme a ${label.toLowerCase()}`} error={errors.passwordConfirmation}>
        <input
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => onConfirmationChange(e.target.value)}
          required
          maxLength={72}
          placeholder=" "
          aria-invalid={!!errors.passwordConfirmation}
          className={fieldClasses(!!errors.passwordConfirmation)}
        />
      </FormField>
    </>
  );
}
