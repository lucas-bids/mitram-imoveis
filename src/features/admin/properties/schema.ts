import { z } from "zod";
import { FEED_LIMITS } from "@/features/feed/limits";
import { type FeedIssueField, feedIssues, isValidPostalCode, virtualTourUrlIssue, youtubeUrlIssue } from "@/features/feed/rules";

const { MIN_TITLE, MAX_TITLE, MIN_DESCRIPTION, MAX_DESCRIPTION } = FEED_LIMITS;

/**
 * Inputs numéricos do formulário chegam como string, e um campo vazio chega
 * como `""`. `z.coerce.number()` converteria isso em `0` — aceitável para
 * contagens de cômodos, mas errado para ano de construção ou andar, onde `0`
 * é um valor real. Aqui `""` vira `null`.
 */
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().nullable(),
);

const basePropertySchema = z.object({
  internal_code: z.string().trim().min(1, "Informe o código do imóvel").max(50, "Máximo de 50 caracteres"),
  // Limites do Title no feed VrSync (OLX/ZAP/VivaReal). Validar aqui, e não só
  // na geração do feed, evita que um imóvel publicado saia silenciosamente do
  // portal por causa de uma edição de título.
  title: z
    .string()
    .trim()
    .min(MIN_TITLE, `Título deve ter no mínimo ${MIN_TITLE} caracteres`)
    .max(MAX_TITLE, `Título deve ter no máximo ${MAX_TITLE} caracteres`),
  purpose: z.enum(["sale", "rent"], { required_error: "Selecione a finalidade" }),
  // A coluna é NOT NULL no banco; antes isto era opcional e o insert quebrava
  // no Postgres em vez de no formulário.
  property_type_id: z.string().min(1, "Selecione o tipo de imóvel"),
  status: z.enum(["draft", "published", "archived", "sold", "rented"]),
  price: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero").optional().nullable(),
  condominium_fee: z.coerce.number().optional().nullable(),
  iptu: z.coerce.number().optional().nullable(),
  // O VrSync exige saber se o IPTU informado é anual ou mensal.
  iptu_period: z.enum(["Yearly", "Monthly"]).default("Yearly"),
  // Mesma regra do Description do feed.
  description: z
    .string()
    .trim()
    .min(MIN_DESCRIPTION, `Descrição deve ter no mínimo ${MIN_DESCRIPTION} caracteres`)
    .max(MAX_DESCRIPTION, `Descrição deve ter no máximo ${MAX_DESCRIPTION.toLocaleString("pt-BR")} caracteres`),
  street: z.string().trim().min(1, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().optional().nullable(),
  neighborhood_id: z.string().min(1, "Selecione o bairro"),
  city_id: z.string().min(1, "Selecione a cidade"),
  state: z.string().length(2, "Selecione o estado"),
  postal_code: z.string().trim().refine(isValidPostalCode, "Informe um CEP válido"),
  latitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  longitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  // O que o portal mostra publicamente do endereço.
  display_address: z.enum(["All", "Street", "Neighborhood"]).default("Street"),
  total_area: z.coerce.number().optional().nullable(),
  private_area: z.coerce.number().optional().nullable(),
  // Vazio precisa virar null, não 0: para publicar no portal, quartos e
  // banheiros são obrigatórios em vários tipos, e 0 esconderia a omissão.
  bedrooms: optionalNumber,
  suites: z.coerce.number().optional().nullable(),
  bathrooms: optionalNumber,
  parking_spaces: z.coerce.number().optional().nullable(),
  floor: optionalNumber,
  building_floors: optionalNumber,
  year_built: optionalNumber,
  furnished: z.boolean().default(false),
  youtube_url: z.string().url().optional().nullable().or(z.literal("")),
  virtual_tour_url: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof basePropertySchema>;

/**
 * O que o formulário sabe além dos próprios campos e que as regras do portal
 * precisam: quantas fotos o imóvel tem e o tipo OLX de cada tipo de imóvel.
 */
export type PropertySchemaContext = {
  imageCount: number;
  olxTypeById: ReadonlyMap<string, string | null>;
};

/** Regras do portal que o schema base (ou o bloco acima) já cobre com mensagem própria. */
const VALIDATED_AT_EVERY_STATUS: ReadonlySet<FeedIssueField> = new Set<FeedIssueField>([
  "internal_code",
  "title",
  "description",
  "postal_code",
  "neighborhood_id",
  "city_id",
  "state",
  "youtube_url",
  "virtual_tour_url",
]);

/**
 * Rascunhos podem ser salvos incompletos — as fotos, por exemplo, costumam
 * chegar depois. Já `published` exige tudo o que o OLX/ZAP/VivaReal exigem
 * (`feedIssues`), porque todo imóvel publicado vai para o feed e um imóvel
 * fora das regras seria descartado em silêncio.
 */
export function buildPropertySchema(ctx: PropertySchemaContext) {
  return basePropertySchema.superRefine((data, context) => {
    const issue = (path: string, message: string) =>
      context.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (data.latitude === null) issue("latitude", "Confirme o endereço no mapa");
    if (data.longitude === null) issue("longitude", "Confirme o endereço no mapa");

    // Formato dos links vale em qualquer status: um link inválido nunca é útil.
    const youtubeIssue = youtubeUrlIssue(data.youtube_url);
    if (youtubeIssue) issue("youtube_url", youtubeIssue);
    const tourIssue = virtualTourUrlIssue(data.virtual_tour_url);
    if (tourIssue) issue("virtual_tour_url", tourIssue);

    if (data.status !== "published") return;

    const problems = feedIssues({
      internal_code: data.internal_code,
      title: data.title,
      description: data.description,
      purpose: data.purpose,
      olxPropertyType: ctx.olxTypeById.get(data.property_type_id) ?? null,
      price: data.price,
      postal_code: data.postal_code,
      hasNeighborhood: !!data.neighborhood_id,
      hasCity: !!data.city_id,
      hasState: !!data.state,
      total_area: data.total_area,
      private_area: data.private_area,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      imageCount: ctx.imageCount,
      youtube_url: data.youtube_url,
      virtual_tour_url: data.virtual_tour_url,
    });

    for (const problem of problems) {
      if (VALIDATED_AT_EVERY_STATUS.has(problem.field)) continue;
      if (problem.field === "media") {
        // As fotos não são um campo do formulário; o erro aparece junto do
        // status, que é o que o usuário tentou mudar.
        issue("status", `Para publicar, adicione ao menos ${FEED_LIMITS.MIN_IMAGES} fotos (há ${ctx.imageCount})`);
        continue;
      }
      issue(problem.field, problem.message);
    }
  });
}
