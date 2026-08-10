// Sistema de cartões: no lugar de sombra, toda superfície é delimitada por uma
// borda cinza que fica dourada quando o cartão está ativo (hover, foco ou
// seleção) — o mesmo padrão do carrossel de depoimentos da home.
// Sombra fica reservada para o que realmente flutua sobre o conteúdo:
// dropdowns, menus, banners fixos e botões.
const CARD_BASE = "border";

/** Cartão em repouso. */
export const CARD_BORDER_IDLE = "border-gray-200";
/** Cartão ativo: selecionado, em hover ou com foco dentro dele. */
export const CARD_BORDER_ACTIVE = "border-mitram-gold/60";

/** Cartão estático — blocos de conteúdo, formulários, tabelas. */
export function cardClasses(extra?: string) {
  return [CARD_BASE, CARD_BORDER_IDLE, extra].filter(Boolean).join(" ");
}

// As classes de estado ficam escritas por extenso porque o Tailwind varre o
// código-fonte: uma classe montada por interpolação não seria gerada.
/** Cartão clicável — acende a borda dourada no hover e ao receber foco. */
export function interactiveCardClasses(extra?: string) {
  return [
    CARD_BASE,
    CARD_BORDER_IDLE,
    "transition-colors hover:border-mitram-gold/60 focus-within:border-mitram-gold/60",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Cartão cujo estado ativo é controlado por dado (seleção, item corrente). */
export function selectableCardClasses(isActive: boolean, extra?: string) {
  return [
    CARD_BASE,
    "transition-colors",
    isActive ? "border-mitram-gold/60" : CARD_BORDER_IDLE,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}
