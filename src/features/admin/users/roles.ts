/**
 * Regras de papel puras, sem dependência de servidor: usadas pelo middleware
 * (edge), pela tela de login, pelas actions e pelos componentes.
 *
 * Isto é a camada de UX/roteamento. A autorização real está no banco:
 * `is_staff()` / `is_admin()` nas policies (ver supabase/migrations/
 * 20261116000000_user_roles.sql e 20261117000000_admin_managed_passwords.sql).
 */

export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
};

/** Formato de `public.my_access()`: acesso do usuário da sessão atual. */
export interface SessionAccess {
  role: string | null;
  active: boolean;
  /** false quando um admin redefiniu a senha/desativou depois deste login. */
  session_current: boolean;
}

export type AccessDenial = "unauthorized" | "deactivated" | "session_expired";

/** Motivo pelo qual a sessão não entra no painel, ou null se pode entrar. */
export function panelDenial(access: SessionAccess | null | undefined): AccessDenial | null {
  if (!access) return "unauthorized";
  if (!access.active) return "deactivated";
  if (!access.session_current) return "session_expired";
  if (access.role !== "admin" && access.role !== "editor") return "unauthorized";
  return null;
}

/** Pode entrar no painel (admin ou editor, conta ativa, sessão válida). */
export function canAccessPanel(access: SessionAccess | null | undefined): boolean {
  return panelDenial(access) === null;
}

/** Pode gerenciar usuários (admin, conta ativa, sessão válida). */
export function canManageUsers(access: SessionAccess | null | undefined): boolean {
  return canAccessPanel(access) && access!.role === "admin";
}
