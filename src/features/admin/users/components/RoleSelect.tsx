import { FormField, fieldClasses, SELECT_ARROW_STYLE, SELECT_EXTRA } from "@/components/ui/FormField";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "../roles";

interface RoleSelectProps {
  value: UserRole | "";
  onChange: (role: UserRole) => void;
  error?: string;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, error, disabled }: RoleSelectProps) {
  return (
    <FormField
      label="Papel"
      alwaysFloat
      error={error}
      hint={!error ? "Editor gerencia todo o conteúdo; administrador também gerencia usuários." : undefined}
    >
      <select
        name="role"
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        required
        disabled={disabled}
        aria-invalid={!!error}
        className={fieldClasses(!!error, SELECT_EXTRA)}
        style={SELECT_ARROW_STYLE}
      >
        {value === "" && (
          <option value="" disabled>
            Selecione
          </option>
        )}
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {ROLE_LABELS[role]}
          </option>
        ))}
      </select>
    </FormField>
  );
}
