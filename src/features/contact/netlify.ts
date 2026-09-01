import { logWarn } from "@/lib/logger";

/**
 * Nomes dos formulários no painel do Netlify. Cada um aparece como uma lista
 * separada em Forms, com notificações próprias.
 *
 * Precisam bater exatamente com os `name` declarados em `public/__forms.html`.
 */
export const NETLIFY_FORMS = {
  contact: "contato",
  callback: "retorno-imovel",
  sellLand: "avaliacao-terreno",
} as const;

export type NetlifyFormName = (typeof NETLIFY_FORMS)[keyof typeof NETLIFY_FORMS];

// O Netlify só aceita submissões no site publicado: /__forms.html é servido
// pela camada de forms deles, que não existe no `next dev`. Em desenvolvimento
// registramos o payload e devolvemos sucesso, para que o fluxo e os estados de
// sucesso possam ser testados localmente.
const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Envia um lead para o Netlify Forms.
 *
 * Formato exigido pela documentação: POST url-encoded para `/__forms.html`,
 * com o campo `form-name` identificando o formulário.
 */
export async function submitToNetlifyForms(formName: NetlifyFormName, formData: FormData) {
  formData.set("form-name", formName);

  const fields = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );

  if (IS_DEV) {
    logWarn("contact/netlify", "Submissão simulada — o Netlify Forms só recebe no site publicado", {
      form: formName,
      fields,
    });
    return;
  }

  const response = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });

  if (!response.ok) {
    throw new Error(`Netlify Forms respondeu ${response.status}`);
  }
}
