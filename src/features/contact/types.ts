/** Como o lead prefere ser retornado pelo corretor. */
export type ContactPreference = "whatsapp" | "call";

// Rótulos ficam aqui — e não no formulário — porque o mesmo texto é exibido ao
// usuário e enviado ao Netlify Forms como valor de `contactPreference`.
export const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  whatsapp: "WhatsApp",
  call: "Ligação",
};
