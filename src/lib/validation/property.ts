import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  purpose: z.enum(["sale", "rent"], { required_error: "Selecione a finalidade" }),
  property_type_id: z.string({ required_error: "Selecione o tipo de imóvel" }),
  status: z.enum(["draft", "published", "archived", "sold", "rented"]),
  price: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero").optional().nullable(),
  condominium_fee: z.coerce.number().optional().nullable(),
  iptu: z.coerce.number().optional().nullable(),
  description: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood_id: z.string().optional().nullable(),
  city_id: z.string({ required_error: "Selecione a cidade" }),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  total_area: z.coerce.number().optional().nullable(),
  private_area: z.coerce.number().optional().nullable(),
  bedrooms: z.coerce.number().optional().nullable(),
  suites: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  parking_spaces: z.coerce.number().optional().nullable(),
  floor: z.coerce.number().optional().nullable(),
  furnished: z.boolean().default(false),
  youtube_url: z.string().url().optional().nullable().or(z.literal("")),
  virtual_tour_url: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
