import { z } from "zod";
import { USER_ROLES } from "./roles";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail.")
  .max(254, "E-mail muito longo.")
  .email("E-mail inválido.");

const fullName = z
  .string()
  .trim()
  .min(2, "Informe o nome (mínimo de 2 caracteres).")
  .max(100, "Nome muito longo (máximo de 100 caracteres).");

const role = z.enum(USER_ROLES, { error: "Selecione um papel válido." });

/**
 * Regra de senha do painel: mínimo de 8 caracteres, ao menos uma letra e um
 * número. Máximo de 72 porque o Supabase Auth (bcrypt) ignora o que passa disso.
 * Não aplicar trim: espaços fazem parte da senha.
 */
export const PASSWORD_RULE_HINT = "Mínimo de 8 caracteres, com letras e números.";

const password = z
  .string()
  .min(8, "A senha precisa ter ao menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  // Só A–Z, como a regra "Letters and digits" do Supabase Auth: uma senha só
  // com letras acentuadas passaria aqui e seria recusada lá.
  .regex(/[A-Za-z]/, "A senha precisa ter ao menos uma letra (A–Z).")
  .regex(/\d/, "A senha precisa ter ao menos um número.");

function passwordsMatch(values: { password: string; passwordConfirmation: string }, ctx: z.RefinementCtx) {
  if (values.password !== values.passwordConfirmation) {
    ctx.addIssue({
      code: "custom",
      path: ["passwordConfirmation"],
      message: "As senhas não coincidem.",
    });
  }
}

// z.guid() aceita qualquer UUID no formato 8-4-4-4-12, como o .uuid() do zod 3;
// o .uuid() do zod 4 exige os bits de versão/variante da RFC 9562.
export const userIdSchema = z.guid("Usuário inválido.");

export const createUserSchema = z
  .object({
    email,
    fullName,
    role,
    password,
    passwordConfirmation: z.string(),
  })
  .superRefine(passwordsMatch);
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    id: userIdSchema,
    fullName,
    role,
    email,
    emailConfirmation: z.string().trim().toLowerCase(),
  })
  .superRefine((values, ctx) => {
    if (values.email !== values.emailConfirmation) {
      ctx.addIssue({
        code: "custom",
        path: ["emailConfirmation"],
        message: "Os e-mails não coincidem.",
      });
    }
  });
export type UpdateUserValues = z.infer<typeof updateUserSchema>;

export const setPasswordSchema = z
  .object({
    id: userIdSchema,
    password,
    passwordConfirmation: z.string(),
  })
  .superRefine(passwordsMatch);
export type SetPasswordValues = z.infer<typeof setPasswordSchema>;

/** Converte erros do zod em { campo: mensagem } (primeira mensagem por campo). */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
