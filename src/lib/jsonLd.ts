/**
 * Serialização segura de JSON-LD.
 *
 * O conteúdo vem do painel (título, descrição, endereço do imóvel), então um
 * `JSON.stringify` cru dentro de `dangerouslySetInnerHTML` permitiria a um
 * texto contendo `</script>` escapar da tag. Escapamos `<` como `<`, que o
 * parser JSON reconhece e o parser HTML não.
 *
 * `undefined` e `null` são removidos em profundidade, para que o grafo nunca
 * declare um campo que o site não conhece — melhor omitir do que afirmar vazio.
 */

type JsonLdValue = string | number | boolean | JsonLdNode | JsonLdValue[];
export type JsonLdNode = { [key: string]: JsonLdValue | null | undefined };

function prune(value: unknown): unknown {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, raw]) => [key, prune(raw)] as const)
      .filter(([, pruned]) => pruned !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  if (value === null || value === "") return undefined;
  return value;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(prune(data) ?? {}).replace(/</g, "\\u003c");
}

/** Props prontas para `<script {...jsonLdProps(node)} />`. */
export function jsonLdProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  } as const;
}
