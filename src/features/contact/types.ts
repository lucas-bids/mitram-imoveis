/** Como o lead prefere ser retornado pelo corretor. */
export type ContactPreference = "whatsapp" | "call";

// Rótulos ficam aqui — e não no formulário — porque o e-mail enviado pela
// server action precisa dos mesmos nomes exibidos ao usuário.
export const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  whatsapp: "WhatsApp",
  call: "Ligação",
};

export function contactPreferenceLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return CONTACT_PREFERENCE_LABELS[value as ContactPreference] ?? null;
}
