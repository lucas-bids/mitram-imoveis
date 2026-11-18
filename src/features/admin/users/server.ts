import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";
import {
  canAccessPanel,
  canManageUsers,
  USER_ROLES,
  type SessionAccess,
  type UserRole,
} from "./roles";
import type { AdminUser, UserManagementAction, UserManagementEvent, UserStatus } from "./types";

/**
 * Único módulo que importa `createAdminClient` (service role, ignora RLS).
 *
 * Regras:
 * - Toda função que usa o service role é chamada só depois de `getAdminActor()`
 *   ter confirmado, pelo cliente RLS, que quem chama é admin ativo.
 * - O service role é usado apenas para o que o PostgREST não oferece: a Admin
 *   API do Auth (criar, definir senha, banir, excluir, trocar e-mail, listar)
 *   e a inclusão no log de auditoria (sem grant de INSERT para authenticated).
 * - Escritas em `profiles` (papel, nome, desativação, corte de sessões) vão
 *   pelas RPCs `admin_update_profile` / `admin_revoke_sessions` com a sessão
 *   do próprio admin (ver actions.ts): o banco exige is_admin() e os triggers
 *   (incluindo o do último admin) julgam.
 * - Nada aqui envia e-mail. O painel não usa e-mail em nenhum fluxo.
 */

export interface AdminActor {
  id: string;
  email: string;
}

/**
 * Confirma que a requisição vem de um admin ativo, com sessão não cortada.
 * Usa `getUser()` (valida o JWT no servidor do Auth), nunca `getSession()`, e
 * `my_access()` (mesma regra de is_admin() no banco). Falha fechado.
 *
 * Importante: o service role ignora o RLS, então esta checagem é a única
 * barreira antes da Admin API. Uma sessão cortada (senha redefinida) não pode
 * passar aqui.
 */
export async function getAdminActor(): Promise<AdminActor | null> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: access, error: accessError } = await supabase
    .rpc("my_access")
    .maybeSingle<SessionAccess>();

  if (accessError) {
    logError("admin/users/getAdminActor", accessError, { userId: user.id });
    return null;
  }
  if (!canManageUsers(access)) return null;

  return { id: user.id, email: user.email ?? "" };
}

/** Para Server Components: redireciona quem não é admin. */
export async function requireAdminPage(): Promise<AdminActor> {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/imoveis");
  return actor;
}

/** Papel do usuário logado, para a navegação (cosmético; não autoriza nada). */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: access } = await supabase.rpc("my_access").maybeSingle<SessionAccess>();
  if (!canAccessPanel(access)) return null;
  return isUserRole(access!.role) ? access!.role : null;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: string | null;
  deactivated_at: string | null;
}

function statusOf(profile: ProfileRow | undefined): UserStatus {
  return profile?.deactivated_at ? "deactivated" : "active";
}

function toAdminUser(user: User, profile: ProfileRow | undefined): AdminUser {
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role: isUserRole(profile?.role) ? profile!.role as UserRole : null,
    status: statusOf(profile),
    lastSignInAt: user.last_sign_in_at ?? null,
    createdAt: user.created_at,
  };
}

async function fetchProfiles(ids?: string[]): Promise<Map<string, ProfileRow>> {
  // Cliente RLS: só um admin enxerga os perfis dos outros ("Admins can view profiles").
  const supabase = createClient();
  let query = supabase.from("profiles").select("id, full_name, role, deactivated_at");
  if (ids) query = query.in("id", ids);
  const { data, error } = await query;
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row as ProfileRow]));
}

const PER_PAGE = 200;

/** Requer que o chamador já tenha passado por `requireAdminPage`/`getAdminActor`. */
export async function listUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < PER_PAGE) break;
  }

  const profiles = await fetchProfiles();
  return users
    .map((u) => toAdminUser(u, profiles.get(u.id)))
    .sort((a, b) => (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email, "pt-BR"));
}

export async function getUser(id: string): Promise<AdminUser | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  const profiles = await fetchProfiles([id]);
  return toAdminUser(data.user, profiles.get(id));
}

export async function getUserEvents(limit = 50): Promise<UserManagementEvent[]> {
  // Cliente RLS: a policy de SELECT do log exige is_admin().
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_management_events")
    .select("id, actor_email, target_email, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    logError("admin/users/getUserEvents", error);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    targetEmail: row.target_email,
    action: row.action,
    details: (row.details ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}

/** Quantos admins ativos existem além de `excludeId` (para mensagens amigáveis; o banco é quem garante). */
export async function countOtherActiveAdmins(excludeId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .is("deactivated_at", null)
    .neq("id", excludeId);
  if (error) throw error;
  return count ?? 0;
}

// ---------------------------------------------------------------------------
// Admin API do Auth (service role). Chamar só após getAdminActor().
// ---------------------------------------------------------------------------

/** ~100 anos: o Auth não tem "banido para sempre"; reativar remove o ban. */
const PERMANENT_BAN = "876000h";

/**
 * Cria o usuário já confirmado e com senha. `email_confirm: true` faz o Auth
 * pular a confirmação por e-mail: nada é enviado.
 */
export async function authCreateUser(email: string, password: string, fullName: string) {
  return createAdminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
}

/** Define a senha. O corte das sessões existentes é feito à parte (admin_revoke_sessions). */
export async function authSetPassword(id: string, password: string) {
  return createAdminClient().auth.admin.updateUserById(id, { password });
}

export async function authDeleteUser(id: string) {
  return createAdminClient().auth.admin.deleteUser(id);
}

export async function authSetBanned(id: string, banned: boolean) {
  return createAdminClient().auth.admin.updateUserById(id, {
    ban_duration: banned ? PERMANENT_BAN : "none",
  });
}

/** Troca o e-mail de login na hora; `email_confirm: true` evita qualquer envio. */
export async function authUpdateEmail(id: string, email: string) {
  return createAdminClient().auth.admin.updateUserById(id, { email, email_confirm: true });
}

// ---------------------------------------------------------------------------
// Auditoria
// ---------------------------------------------------------------------------

export async function recordEvent(
  actor: AdminActor,
  action: UserManagementAction,
  target: { id: string; email: string },
  details: Record<string, unknown> = {}
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("user_management_events").insert({
    actor_id: actor.id,
    actor_email: actor.email,
    target_id: target.id,
    target_email: target.email,
    action,
    details,
  });
  // A ação em si já aconteceu; uma falha de auditoria é registrada, não revertida.
  if (error) logError("admin/users/recordEvent", error, { action, targetId: target.id });
}
