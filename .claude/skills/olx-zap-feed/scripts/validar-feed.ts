/**
 * Validador do feed XML OLX/GrupoZap (formato VrSync).
 *
 * Valida as regras mecânicas documentadas em
 * `.claude/skills/olx-zap-feed/references/` (encoding, campos obrigatórios,
 * tamanhos de string, enumerações, regras condicionais de preço) contra um
 * arquivo XML real. Não substitui o validador oficial
 * (https://developers.grupozap.com/feeds/xml_validator/) nem cobre 100% das
 * regras de negócio (ex: duplicidade entre XML e cadastro manual) — só o
 * que é verificável estaticamente a partir do arquivo.
 *
 * Uso:
 *   npx tsx .claude/skills/olx-zap-feed/scripts/validar-feed.ts caminho/para/feed.xml
 */

import { readFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Enumerações fechadas (ver references/detalhes-precos-caracteristicas.md)
// ---------------------------------------------------------------------------

const TRANSACTION_TYPES = ["For Sale", "For Rent", "Sale/Rent"] as const;

const PUBLICATION_TYPES = [
  "STANDARD",
  "PREMIUM",
  "SUPER_PREMIUM",
  "PREMIERE_1",
  "PREMIERE_2",
  "TRIPLE",
] as const;

const RENTAL_PERIODS = ["Monthly", "Daily", "Weekly", "Quarterly", "Yearly"] as const;
const IPTU_PERIODS = ["Yearly", "Monthly"] as const;

const DISPLAY_ADDRESS = ["All", "Street", "Neighborhood"] as const;

const WARRANTIES = [
  "SECURITY_DEPOSIT",
  "GUARANTOR",
  "INSURANCE_GUARANTEE",
  "GUARANTEE_LETTER",
  "CAPITALIZATION_BONDS",
] as const;

// ---------------------------------------------------------------------------
// Helpers de parsing (fast-xml-parser não normaliza elemento único vs. array)
// ---------------------------------------------------------------------------

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Texto de um nó que pode vir como string/number puro ou como {"#text": ...}. */
function textOf(node: unknown): string | undefined {
  if (node === undefined || node === null) return undefined;
  if (typeof node === "object" && node !== null && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"]);
  }
  return String(node);
}

function attr(node: unknown, name: string): string | undefined {
  if (typeof node !== "object" || node === null) return undefined;
  const value = (node as Record<string, unknown>)[`@_${name}`];
  return value === undefined ? undefined : String(value);
}

// ---------------------------------------------------------------------------
// Coleta de erros
// ---------------------------------------------------------------------------

type Erro = { listingId: string; mensagem: string };

class Coletor {
  private erros: Erro[] = [];

  erro(listingId: string, mensagem: string) {
    this.erros.push({ listingId, mensagem });
  }

  get total() {
    return this.erros.length;
  }

  imprimir() {
    if (this.erros.length === 0) {
      console.log("✅ Nenhum erro encontrado.");
      return;
    }
    const porListing = new Map<string, string[]>();
    for (const { listingId, mensagem } of this.erros) {
      const lista = porListing.get(listingId) ?? [];
      lista.push(mensagem);
      porListing.set(listingId, lista);
    }
    console.log(`❌ ${this.erros.length} erro(s) encontrado(s):\n`);
    for (const [listingId, mensagens] of porListing) {
      console.log(`  ${listingId}:`);
      for (const mensagem of mensagens) console.log(`    - ${mensagem}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Validações
// ---------------------------------------------------------------------------

function validarEncoding(raw: string, coletor: Coletor) {
  const primeiraLinha = raw.split(/\r?\n/, 1)[0] ?? "";
  const match = primeiraLinha.match(/<\?xml\s+version="1\.0"\s+encoding="([^"]+)"\s*\?>/i);
  if (!match) {
    coletor.erro(
      "(arquivo)",
      'Primeira linha deve declarar o encoding, ex: <?xml version="1.0" encoding="UTF-8"?> (ver references/encoding-e-url.md)',
    );
    return;
  }
  const encoding = match[1].toUpperCase();
  if (encoding !== "UTF-8" && encoding !== "ISO8859-1") {
    coletor.erro(
      "(arquivo)",
      `Encoding "${match[1]}" não suportado — apenas ISO8859-1 ou UTF-8 (ver references/encoding-e-url.md)`,
    );
  }
}

function validarHeader(feed: Record<string, unknown>, coletor: Coletor) {
  const header = feed["Header"] as Record<string, unknown> | undefined;
  if (!header) {
    coletor.erro("(arquivo)", "Elemento <Header> ausente (ver references/estrutura-e-header-xml.md)");
    return;
  }
  for (const campo of ["Provider", "Email", "ContactName", "Telephone"]) {
    if (!textOf(header[campo])) {
      coletor.erro("(arquivo)", `<Header><${campo}> ausente ou vazio`);
    }
  }
  const publishDate = textOf(header["PublishDate"]);
  if (!publishDate) {
    coletor.erro("(arquivo)", "<Header><PublishDate> ausente");
  } else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(publishDate)) {
    coletor.erro(
      "(arquivo)",
      `<Header><PublishDate> "${publishDate}" não está no formato ISO 8601 YYYY-MM-DDTHH:MM:SS`,
    );
  }
}

const PrecoSchema = z.object({
  "@_currency": z.string().optional(),
  "#text": z.union([z.number(), z.string()]),
});

function validarInteiro(valor: string | undefined, campo: string, listingId: string, coletor: Coletor) {
  if (valor === undefined) return;
  if (!/^-?\d+$/.test(valor)) {
    coletor.erro(listingId, `<${campo}> deve ser um valor inteiro sem decimais/símbolos, recebido "${valor}"`);
  }
}

function validarListing(listingRaw: unknown, coletor: Coletor) {
  const listing = listingRaw as Record<string, unknown>;
  const listingId = textOf(listing["ListingID"]) ?? "(ListingID ausente)";

  // ListingID
  const idValue = textOf(listing["ListingID"]);
  if (!idValue) {
    coletor.erro(listingId, "<ListingID> ausente");
  } else if (idValue.length < 1 || idValue.length > 50) {
    coletor.erro(listingId, `<ListingID> deve ter entre 1 e 50 caracteres (tem ${idValue.length})`);
  }

  // Title
  const title = textOf(listing["Title"]);
  if (!title) {
    coletor.erro(listingId, "<Title> ausente");
  } else {
    if (title.length < 10 || title.length > 100) {
      coletor.erro(listingId, `<Title> deve ter entre 10 e 100 caracteres (tem ${title.length})`);
    }
    if (/<[a-z][\s\S]*>/i.test(title)) {
      coletor.erro(listingId, "<Title> não pode conter tags HTML");
    }
  }

  // TransactionType
  const transactionType = textOf(listing["TransactionType"]);
  if (!transactionType) {
    coletor.erro(listingId, "<TransactionType> ausente");
  } else if (!(TRANSACTION_TYPES as readonly string[]).includes(transactionType)) {
    coletor.erro(
      listingId,
      `<TransactionType> "${transactionType}" inválido — valores aceitos: ${TRANSACTION_TYPES.join(", ")}`,
    );
  }

  // PublicationType (opcional)
  const publicationType = textOf(listing["PublicationType"]);
  if (publicationType && !(PUBLICATION_TYPES as readonly string[]).includes(publicationType)) {
    coletor.erro(
      listingId,
      `<PublicationType> "${publicationType}" inválido — valores aceitos: ${PUBLICATION_TYPES.join(", ")}`,
    );
  }

  // Location
  const location = listing["Location"] as Record<string, unknown> | undefined;
  if (!location) {
    coletor.erro(listingId, "<Location> ausente");
  } else {
    const displayAddress = attr(location, "displayAddress");
    if (!displayAddress) {
      coletor.erro(listingId, "<Location> precisa do atributo displayAddress");
    } else if (!(DISPLAY_ADDRESS as readonly string[]).includes(displayAddress)) {
      coletor.erro(
        listingId,
        `<Location displayAddress="${displayAddress}"> inválido — valores aceitos: ${DISPLAY_ADDRESS.join(", ")}`,
      );
    }
    for (const campo of ["Country", "State", "City", "Neighborhood", "PostalCode"]) {
      if (!textOf(location[campo])) {
        coletor.erro(listingId, `<Location><${campo}> ausente (obrigatório)`);
      }
    }
    if (location["State"] && !attr(location["State"], "abbreviation")) {
      coletor.erro(listingId, "<Location><State> precisa do atributo abbreviation");
    }
  }

  // Media
  const media = listing["Media"] as Record<string, unknown> | undefined;
  if (!media) {
    coletor.erro(listingId, "<Media> ausente");
  } else {
    const items = asArray(media["Item"]);
    const imagens = items.filter((item) => attr(item, "medium") === "image");
    const primarias = imagens.filter((item) => attr(item, "primary") === "true");
    if (imagens.length < 5) {
      coletor.erro(listingId, `<Media> precisa de no mínimo 5 imagens (tem ${imagens.length})`);
    }
    if (primarias.length > 1) {
      coletor.erro(listingId, `<Media> só pode ter 1 imagem primary="true" (tem ${primarias.length})`);
    }
  }

  // ContactInfo
  const contactInfo = listing["ContactInfo"] as Record<string, unknown> | undefined;
  if (!contactInfo) {
    coletor.erro(listingId, "<ContactInfo> ausente");
  } else {
    if (!textOf(contactInfo["Name"])) coletor.erro(listingId, "<ContactInfo><Name> ausente");
    if (!textOf(contactInfo["Email"])) coletor.erro(listingId, "<ContactInfo><Email> ausente");
  }

  // Details
  const details = listing["Details"] as Record<string, unknown> | undefined;
  if (!details) {
    coletor.erro(listingId, "<Details> ausente");
  } else {
    const precisaListPrice = transactionType === "For Sale" || transactionType === "Sale/Rent";
    const precisaRentalPrice = transactionType === "For Rent" || transactionType === "Sale/Rent";

    const listPriceNode = details["ListPrice"];
    if (precisaListPrice && listPriceNode === undefined) {
      coletor.erro(listingId, `<ListPrice> obrigatório quando TransactionType="${transactionType}"`);
    }
    if (listPriceNode !== undefined) {
      const parsed = PrecoSchema.safeParse(listPriceNode);
      validarInteiro(parsed.success ? String(parsed.data["#text"]) : undefined, "ListPrice", listingId, coletor);
    }

    const rentalPriceNode = details["RentalPrice"];
    if (precisaRentalPrice && rentalPriceNode === undefined) {
      coletor.erro(listingId, `<RentalPrice> obrigatório quando TransactionType="${transactionType}"`);
    }
    if (rentalPriceNode !== undefined) {
      const parsed = PrecoSchema.safeParse(rentalPriceNode);
      validarInteiro(parsed.success ? String(parsed.data["#text"]) : undefined, "RentalPrice", listingId, coletor);
      const period = attr(rentalPriceNode, "period");
      if (period && !(RENTAL_PERIODS as readonly string[]).includes(period)) {
        coletor.erro(
          listingId,
          `<RentalPrice period="${period}"> inválido — valores aceitos: ${RENTAL_PERIODS.join(", ")}`,
        );
      }
    }

    const iptuNode = details["Iptu"];
    if (iptuNode !== undefined) {
      const period = attr(iptuNode, "period");
      if (period && !(IPTU_PERIODS as readonly string[]).includes(period)) {
        coletor.erro(listingId, `<Iptu period="${period}"> inválido — valores aceitos: ${IPTU_PERIODS.join(", ")}`);
      }
    }
    if (details["YearlyTax"] !== undefined) {
      coletor.erro(
        listingId,
        '<YearlyTax> está em desuso — usar <Iptu currency="BRL" period="Yearly"> (ver references/detalhes-precos-caracteristicas.md)',
      );
    }

    const description = textOf(details["Description"]);
    if (!description) {
      coletor.erro(listingId, "<Description> ausente");
    } else if (description.length < 50 || description.length > 3000) {
      coletor.erro(listingId, `<Description> deve ter entre 50 e 3000 caracteres (tem ${description.length})`);
    }

    if (!textOf(details["PropertyType"])) {
      coletor.erro(listingId, "<PropertyType> ausente");
    }

    if (details["LivingArea"] === undefined && details["LotArea"] === undefined) {
      coletor.erro(listingId, "Pelo menos uma área (<LivingArea> ou <LotArea>) é obrigatória");
    }

    const warranties = asArray((details["Warranties"] as Record<string, unknown> | undefined)?.["Warranty"]);
    for (const warranty of warranties) {
      const valor = textOf(warranty);
      if (valor && !(WARRANTIES as readonly string[]).includes(valor)) {
        coletor.erro(listingId, `<Warranty> "${valor}" inválido — valores aceitos: ${WARRANTIES.join(", ")}`);
      }
    }
  }
}

function validarUnicidade(listingIds: string[], coletor: Coletor) {
  const vistos = new Map<string, number>();
  for (const id of listingIds) {
    vistos.set(id, (vistos.get(id) ?? 0) + 1);
  }
  for (const [id, contagem] of vistos) {
    if (contagem > 1) {
      coletor.erro(id, `<ListingID> duplicado ${contagem}x — apenas um será processado pelo GrupoZap`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const caminho = process.argv[2];
  if (!caminho) {
    console.error("Uso: npx tsx validar-feed.ts caminho/para/feed.xml");
    process.exit(2);
  }

  const raw = readFileSync(caminho, "utf-8");
  const coletor = new Coletor();

  validarEncoding(raw, coletor);

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    parseTagValue: false,
    parseAttributeValue: false,
  });
  const parsed = parser.parse(raw) as Record<string, unknown>;
  const feed = parsed["ListingDataFeed"] as Record<string, unknown> | undefined;

  if (!feed) {
    coletor.erro("(arquivo)", "Elemento raiz <ListingDataFeed> ausente");
    coletor.imprimir();
    process.exit(1);
  }

  validarHeader(feed, coletor);

  const listingsWrapper = feed["Listings"] as Record<string, unknown> | undefined;
  const listings = asArray(listingsWrapper?.["Listing"]);

  if (listings.length === 0) {
    coletor.erro("(arquivo)", "Nenhum <Listing> encontrado dentro de <Listings>");
  } else {
    if (listings.length > 50_000) {
      coletor.erro(
        "(arquivo)",
        `Arquivo tem ${listings.length} anúncios — limite documentado é 50.000 por arquivo (ver references/regras-de-negocio.md)`,
      );
    }
    for (const listing of listings) validarListing(listing, coletor);
    validarUnicidade(
      listings.map((listing) => textOf((listing as Record<string, unknown>)["ListingID"]) ?? "(sem ID)"),
      coletor,
    );
  }

  coletor.imprimir();
  process.exit(coletor.total > 0 ? 1 : 0);
}

main();
