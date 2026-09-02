/**
 * Como o lead prefere ser retornado pelo corretor.
 *
 * São os dois canais que a Mitram de fato usa. "Ligação" existia aqui antes e
 * foi removida: oferecer um canal que ninguém atende é uma promessa quebrada no
 * primeiro contato.
 */
export type ContactPreference = "whatsapp" | "email";

// Rótulos ficam aqui — e não no formulário — porque o mesmo texto é exibido ao
// usuário e enviado ao Netlify Forms como valor de `contactPreference`.
export const CONTACT_PREFERENCE_LABELS: Record<ContactPreference, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};
