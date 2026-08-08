import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  purpose: z.enum(["sale", "rent"], { required_error: "Selecione a finalidade" }),
      property_type_id: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived", "sold", "rented"]),
  price: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero").optional().nullable(),
  condominium_fee: z.coerce.number().optional().nullable(),
  iptu: z.coerce.number().optional().nullable(),
  description: z.string().optional().nullable(),
  street: z.string().trim().min(1, "Informe a rua"),
  number: z.string().trim().min(1, "Informe o número"),
  complement: z.string().optional().nullable(),
  neighborhood_id: z.string().min(1, "Selecione o bairro"),
  city_id: z.string().min(1, "Selecione a cidade"),
  state: z.string().length(2, "Selecione o estado"),
  postal_code: z.string().trim().min(8, "Informe um CEP válido"),
  latitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  longitude: z.coerce.number({ invalid_type_error: "Confirme o endereço no mapa" }).nullable(),
  total_area: z.coerce.number().optional().nullable(),
  private_area: z.coerce.number().optional().nullable(),
  bedrooms: z.coerce.number().optional().nullable(),
  suites: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  parking_spaces: z.coerce.number().optional().nullable(),
  furnished: z.boolean().default(false),
  youtube_url: z.string().url().optional().nullable().or(z.literal("")),
  virtual_tour_url: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
}).superRefine((data, context) => {
  if (data.latitude === null) context.addIssue({ code: z.ZodIssueCode.custom, path: ["latitude"], message: "Confirme o endereço no mapa" });
  if (data.longitude === null) context.addIssue({ code: z.ZodIssueCode.custom, path: ["longitude"], message: "Confirme o endereço no mapa" });
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
