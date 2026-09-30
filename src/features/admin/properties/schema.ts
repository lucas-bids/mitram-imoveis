import { z } from "zod";

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

export const propertySchema = z.object({
  internal_code: z.string().trim().min(1, "Informe o código do imóvel").max(50, "Máximo de 50 caracteres"),
  // 10-100 caracteres é a regra do feed VrSync (OLX/ZAP/VivaReal) para Title.
  // Validar aqui, e não só na geração do feed, evita que um imóvel publicado
  // saia silenciosamente do portal por causa de uma edição de título.
  title: z
    .string()
    .trim()
    .min(10, "Título deve ter no mínimo 10 caracteres")
    .max(100, "Título deve ter no máximo 100 caracteres"),
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
  // 50-3.000 caracteres: mesma regra do Description do feed.
  description: z
    .string()
    .trim()
    .min(50, "Descrição deve ter no mínimo 50 caracteres")
    .max(3000, "Descrição deve ter no máximo 3.000 caracteres"),
  street: z.string().trim().min(1, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().optional().nullable(),
  neighborhood_id: z.string().min(1, "Selecione o bairro"),
  city_id: z.string().min(1, "Selecione a cidade"),
  state: z.string().length(2, "Selecione o estado"),
  postal_code: z.string().trim().min(8, "Informe um CEP válido"),
  latitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  longitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  // O que o portal mostra publicamente do endereço.
  display_address: z.enum(["All", "Street", "Neighborhood"]).default("Street"),
  total_area: z.coerce.number().optional().nullable(),
  private_area: z.coerce.number().optional().nullable(),
  bedrooms: z.coerce.number().optional().nullable(),
  suites: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  parking_spaces: z.coerce.number().optional().nullable(),
  floor: optionalNumber,
  building_floors: optionalNumber,
  year_built: optionalNumber,
  furnished: z.boolean().default(false),
  youtube_url: z.string().url().optional().nullable().or(z.literal("")),
  virtual_tour_url: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
  // Opt-out: imóvel novo nasce habilitado, imóvel antigo nasceu desabilitado
  // pela migration (ver 20260922000000_olx_feed_fields.sql).
  olx_enabled: z.boolean().default(true),
}).superRefine((data, context) => {
  if (data.latitude === null) context.addIssue({ code: z.ZodIssueCode.custom, path: ["latitude"], message: "Confirme o endereço no mapa" });
  if (data.longitude === null) context.addIssue({ code: z.ZodIssueCode.custom, path: ["longitude"], message: "Confirme o endereço no mapa" });
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
