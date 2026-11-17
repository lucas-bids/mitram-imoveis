"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/logger";
import {
  createUserSchema,
  fieldErrorsFrom,
  setPasswordSchema,
  updateUserSchema,
  userIdSchema,
} from "./schema";
import {
  authCreateUser,
  authDeleteUser,
  authSetBanned,
  authSetPassword,
  authUpdateEmail,
  countOtherActiveAdmins,
  getAdminActor,
  getUser,
  recordEvent,
  type AdminActor,
} from "./server";
import type { ActionResult } from "./types";

/*
 * Toda action:
 *   1. confirma admin ativo com sessão válida (getAdminActor, falha fechado);
 *   2. valida a entrada com zod — nada vindo do cliente é confiável;
 *   3. escreve em profiles pelas RPCs admin_update_profile /
 *      admin_revoke_sessions, com a sessão do admin (o banco exige is_admin();
 *      triggers julgam);
 *   4. usa a Admin API do Auth só via server.ts;
 *   5. registra no log de auditoria (nunca a senha).
 * Nenhum fluxo envia e-mail. Mensagens ao usuário são genéricas; o detalhe vai
 * para o log do servidor.
 */

const USERS_PATH = "/admin/usuarios";

const FORBIDDEN: ActionResult = {
  ok: false,
  error: "Você não tem permissão para gerenciar usuários.",
};
const GENERIC: ActionResult = {
  ok: false,
  error: "Não foi possível concluir a operação. Tente novamente.",
};
const LAST_ADMIN: ActionResult = {
  ok: false,
  error: "É preciso manter ao menos um administrador ativo.",
};
const NOT_FOUND: ActionResult = { ok: false, error: "Usuário não encontrado." };
const INVALID_FIELDS = "Revise os campos destacados.";

interface DbError {
  code?: string;
  hint?: string | null;
  message?: string;
}

function isLastAdminError(error: DbError | null | undefined) {
  return !!error && error.code === "23514" && error.hint === "last_admin";
}

function isEmailTaken(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "email_exists" ||
    error.code === "user_already_exists" ||
    /already (been )?registered|already exists/i.test(error.message ?? "")
  );
}

/** Senha recusada pela política do próprio Supabase Auth (Dashboard > Auth > Passwords). */
function isWeakPassword(error: { code?: string } | null) {
  return !!error && (error.code === "weak_password" || error.code === "same_password");
}

async function authorize(): Promise<AdminActor | null> {
  return getAdminActor();
}

/**
 * `role` e `deactivated_at` não têm grant de UPDATE para authenticated (nem
 * para admins) — a correção de escalonamento de 20260811000000. A escrita
 * passa pela RPC `admin_update_profile`, que exige is_admin() no banco; os
 * triggers (escalonamento, último admin) continuam julgando com o chamador.
 * Desativar também corta as sessões na mesma escrita.
 */
async function adminUpdateProfile(args: {
  targetId: string;
  fullName?: string;
  role?: string;
  deactivated?: boolean;
}) {
  const { error } = await createClient().rpc("admin_update_profile", {
    target_id: args.targetId,
    new_full_name: args.fullName ?? null,
    new_role: args.role ?? null,
    set_deactivated: args.deactivated ?? null,
  });
  return { error: error as DbError | null };
}

/** Corta todas as sessões do usuário (tokens anteriores a agora são recusados). */
async function adminRevokeSessions(targetId: string) {
  const { error } = await createClient().rpc("admin_revoke_sessions", { target_id: targetId });
  return { error: error as DbError | null };
}

// ---------------------------------------------------------------------------

export async function createUser(input: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: INVALID_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { email, fullName, role, password } = parsed.data;

  const { data, error } = await authCreateUser(email, password, fullName);
  if (error || !data.user) {
    if (isEmailTaken(error)) {
      return { ok: false, error: "Já existe um usuário com este e-mail.", fieldErrors: { email: "E-mail já cadastrado." } };
    }
    if (isWeakPassword(error)) {
      return { ok: false, error: "A senha foi recusada pela política de senhas do Supabase.", fieldErrors: { password: "Senha recusada." } };
    }
    logError("admin/users/createUser", error, { email });
    return GENERIC;
  }

  // O papel nunca vem de metadata: handle_new_user cria o perfil com role NULL
  // (sem acesso) e só esta escrita, pela RPC de admin, o define.
  const { error: profileError } = await adminUpdateProfile({ targetId: data.user.id, fullName, role });

  if (profileError) {
    logError("admin/users/createUser:profile", profileError, { userId: data.user.id });
    const { error: rollbackError } = await authDeleteUser(data.user.id);
    if (rollbackError) logError("admin/users/createUser:rollback", rollbackError, { userId: data.user.id });
    return GENERIC;
  }

  await recordEvent(actor, "created", { id: data.user.id, email }, { role, fullName });
  revalidatePath(USERS_PATH);
  return { ok: true, message: `Usuário ${email} criado. Ele já pode entrar com a senha definida.` };
}

// ---------------------------------------------------------------------------

export async function updateUser(input: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: INVALID_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { id, fullName, role, email } = parsed.data;

  const current = await getUser(id);
  if (!current) return NOT_FOUND;

  const nameChanged = fullName !== (current.fullName ?? "");
  const roleChanged = role !== current.role;
  const emailChanged = email !== current.email.toLowerCase();

  if (!nameChanged && !roleChanged && !emailChanged) {
    return { ok: true, message: "Nenhuma alteração para salvar." };
  }

  if (nameChanged || roleChanged) {
    const { error } = await adminUpdateProfile({ targetId: id, fullName, role });

    if (isLastAdminError(error)) return LAST_ADMIN;
    if (error) {
      logError("admin/users/updateUser:profile", error, { id });
      return GENERIC;
    }

    await recordEvent(actor, "updated", { id, email: current.email }, {
      ...(nameChanged ? { fullName: { from: current.fullName, to: fullName } } : {}),
      ...(roleChanged ? { role: { from: current.role, to: role } } : {}),
    });
  }

  if (emailChanged) {
    const { error } = await authUpdateEmail(id, email);
    if (error) {
      revalidatePath(USERS_PATH);
      revalidatePath(`${USERS_PATH}/${id}`);
      if (isEmailTaken(error)) {
        return { ok: false, error: "Já existe um usuário com este e-mail.", fieldErrors: { email: "E-mail já cadastrado." } };
      }
      logError("admin/users/updateUser:email", error, { id });
      return {
        ok: false,
        error: nameChanged || roleChanged
          ? "Os demais dados foram salvos, mas não foi possível alterar o e-mail."
          : "Não foi possível alterar o e-mail.",
      };
    }

    await recordEvent(actor, "email_changed", { id, email }, { from: current.email, to: email });
  }

  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${id}`);

  // Quem se rebaixou a editor perde o acesso a esta área.
  if (id === actor.id && roleChanged && role !== "admin") redirect("/admin/imoveis");

  return {
    ok: true,
    message: emailChanged ? `Usuário atualizado. O login agora é ${email}.` : "Usuário atualizado.",
  };
}

// ---------------------------------------------------------------------------

export async function setUserPassword(input: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: INVALID_FIELDS, fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const { id, password } = parsed.data;

  const user = await getUser(id);
  if (!user) return NOT_FOUND;

  const { error } = await authSetPassword(user.id, password);
  if (error) {
    if (isWeakPassword(error)) {
      return {
        ok: false,
        error: error.code === "same_password"
          ? "A nova senha precisa ser diferente da atual."
          : "A senha foi recusada pela política de senhas do Supabase.",
        fieldErrors: { password: "Senha recusada." },
      };
    }
    logError("admin/users/setUserPassword", error, { id: user.id });
    return GENERIC;
  }

  // Encerra todas as sessões abertas do usuário (inclusive a do próprio admin,
  // se ele redefiniu a própria senha). O próximo login passa normalmente.
  const { error: revokeError } = await adminRevokeSessions(user.id);
  if (revokeError) {
    logError("admin/users/setUserPassword:revoke", revokeError, { id: user.id });
    await recordEvent(actor, "password_set", { id: user.id, email: user.email }, { sessionsRevoked: false });
    return {
      ok: false,
      error: "A senha foi alterada, mas não foi possível encerrar as sessões abertas. Tente redefinir novamente.",
    };
  }

  await recordEvent(actor, "password_set", { id: user.id, email: user.email }, { sessionsRevoked: true });
  revalidatePath(USERS_PATH);

  if (user.id === actor.id) {
    await createClient().auth.signOut({ scope: "local" });
    redirect("/admin/login?error=session_expired");
  }

  return { ok: true, message: "Senha redefinida. As sessões abertas deste usuário foram encerradas." };
}

// ---------------------------------------------------------------------------

export async function deactivateUser(rawId: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsedId = userIdSchema.safeParse(rawId);
  if (!parsedId.success) return NOT_FOUND;
  const user = await getUser(parsedId.data);
  if (!user) return NOT_FOUND;
  if (user.status === "deactivated") return { ok: true, message: "O usuário já está desativado." };

  // 1. Perfil primeiro: derruba o acesso no próximo comando (RLS) e corta as
  //    sessões na mesma escrita. O trigger do último admin barra aqui.
  const { error } = await adminUpdateProfile({ targetId: user.id, deactivated: true });

  if (isLastAdminError(error)) return LAST_ADMIN;
  if (error) {
    logError("admin/users/deactivateUser:profile", error, { id: user.id });
    return GENERIC;
  }

  // 2. Ban no Auth: impede novos logins. Se falhar, o acesso já está bloqueado
  //    pelo passo 1 (falha fechado) — só registramos.
  const { error: banError } = await authSetBanned(user.id, true);
  if (banError) logError("admin/users/deactivateUser:ban", banError, { id: user.id });

  await recordEvent(actor, "deactivated", { id: user.id, email: user.email }, banError ? { banFailed: true } : {});
  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${user.id}`);

  if (user.id === actor.id) {
    await createClient().auth.signOut({ scope: "local" });
    redirect("/admin/login?error=deactivated");
  }

  return {
    ok: true,
    message: banError
      ? "Usuário desativado. O bloqueio de login no Auth falhou; tente desativar de novo."
      : "Usuário desativado.",
  };
}

export async function reactivateUser(rawId: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsedId = userIdSchema.safeParse(rawId);
  if (!parsedId.success) return NOT_FOUND;
  const user = await getUser(parsedId.data);
  if (!user) return NOT_FOUND;

  // Ordem inversa da desativação: só libera o perfil depois que o ban saiu.
  const { error: banError } = await authSetBanned(user.id, false);
  if (banError) {
    logError("admin/users/reactivateUser:unban", banError, { id: user.id });
    return GENERIC;
  }

  const { error } = await adminUpdateProfile({ targetId: user.id, deactivated: false });

  if (error) {
    logError("admin/users/reactivateUser:profile", error, { id: user.id });
    // Mantém Auth e perfil coerentes: o usuário segue bloqueado nos dois.
    const { error: rebanError } = await authSetBanned(user.id, true);
    if (rebanError) logError("admin/users/reactivateUser:reban", rebanError, { id: user.id });
    return GENERIC;
  }

  await recordEvent(actor, "reactivated", { id: user.id, email: user.email });
  revalidatePath(USERS_PATH);
  revalidatePath(`${USERS_PATH}/${user.id}`);
  return { ok: true, message: "Usuário reativado. Ele precisa entrar de novo com a senha." };
}

// ---------------------------------------------------------------------------

export async function deleteUser(rawId: unknown): Promise<ActionResult> {
  const actor = await authorize();
  if (!actor) return FORBIDDEN;

  const parsedId = userIdSchema.safeParse(rawId);
  if (!parsedId.success) return NOT_FOUND;
  const user = await getUser(parsedId.data);
  if (!user) return NOT_FOUND;

  // Mensagem amigável; o trigger enforce_last_admin é quem garante de fato
  // (ele dispara no DELETE em cascata de auth.users -> profiles).
  if (user.role === "admin" && user.status !== "deactivated") {
    try {
      if ((await countOtherActiveAdmins(user.id)) === 0) return LAST_ADMIN;
    } catch (error) {
      logError("admin/users/deleteUser:count", error, { id: user.id });
      return GENERIC;
    }
  }

  const { error } = await authDeleteUser(user.id);
  if (error) {
    logError("admin/users/deleteUser", error, { id: user.id });
    return GENERIC;
  }

  await recordEvent(actor, "deleted", { id: user.id, email: user.email }, { role: user.role });
  revalidatePath(USERS_PATH);

  if (user.id === actor.id) {
    await createClient().auth.signOut({ scope: "local" });
    redirect("/admin/login");
  }

  redirect(USERS_PATH);
}
