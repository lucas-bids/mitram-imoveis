import type { UserRole } from "./roles";

export type UserStatus = "active" | "deactivated";

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "Ativo",
  deactivated: "Desativado",
};

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  /** `null` = conta sem papel (sem acesso ao painel). */
  role: UserRole | null;
  status: UserStatus;
  lastSignInAt: string | null;
  createdAt: string;
}

/**
 * Espelha o enum `user_management_action`. `invited` e `password_reset_sent`
 * vêm da fase com e-mail e continuam aqui só para exibir o histórico antigo.
 */
export type UserManagementAction =
  | "created"
  | "password_set"
  | "updated"
  | "email_changed"
  | "deactivated"
  | "reactivated"
  | "deleted"
  | "invited"
  | "password_reset_sent";

export const ACTION_LABELS: Record<UserManagementAction, string> = {
  created: "criou",
  password_set: "redefiniu a senha de",
  updated: "editou",
  email_changed: "alterou o e-mail de",
  deactivated: "desativou",
  reactivated: "reativou",
  deleted: "excluiu",
  invited: "convidou",
  password_reset_sent: "enviou redefinição de senha para",
};

export interface UserManagementEvent {
  id: string;
  actorEmail: string | null;
  targetEmail: string | null;
  action: UserManagementAction;
  details: Record<string, unknown>;
  createdAt: string;
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
