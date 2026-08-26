"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyFormValues, propertySchema } from "@/features/admin/properties/schema";
import { generateSlug } from "@/features/admin/properties/slug";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload, { PropertyMedia } from "./ImageUpload";
import { insertMediaRecord } from "@/features/admin/properties/components/media/mutations";
import { Save, Plus, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import {
  CHECKBOX_CLASSES,
  FormField,
  SELECT_ARROW_STYLE,
  SELECT_EXTRA,
  fieldClasses,
} from "@/components/ui/FormField";

import { useSectionNavigation } from "@/features/admin/properties/components/form/useSectionNavigation";
import { FormSection } from "@/features/admin/properties/components/form/FormSection";
import { FORM_SECTIONS } from "@/features/admin/properties/components/form/sections";

import { FilterOption } from "@/features/search/filters";
import { FeatureSelector, SelectedFeature } from "@/features/admin/properties/components/features/FeatureSelector";
import { FeatureOption, addPropertyFeatures } from "@/features/admin/properties/components/features/mutations";
import { AddressSection } from "@/features/admin/properties/components/address/AddressSection";
import { CityOption, NeighborhoodOption } from "@/features/admin/properties/components/address/types";

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues> & {
    id?: string;
    property_media?: PropertyMedia[];
    property_features?: { features: SelectedFeature }[];
  };
  isEdit?: boolean;
  lookups?: {
    propertyTypes: FilterOption[];
    cities: CityOption[];
    neighborhoods: NeighborhoodOption[];
    features: FeatureOption[];
  };
}

const autoResizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

const sectionNumber = (id: string) =>
  String(FORM_SECTIONS.findIndex((section) => section.id === id) + 1).padStart(2, "0");

const FIELD_NUMBER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export default function PropertyForm({ initialData, isEdit = false, lookups }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [types] = useState<FilterOption[]>(lookups?.propertyTypes || []);
  const [media, setMedia] = useState<PropertyMedia[]>(initialData?.property_media || []);
  const [selectedFeatures, setSelectedFeatures] = useState<SelectedFeature[]>(
    (initialData?.property_features || []).map((pf) => pf.features),
  );
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) setPendingPropertyId(crypto.randomUUID());
  }, [isEdit]);

  const effectivePropertyId = initialData?.id ?? pendingPropertyId;

  const { activeSection, scrollToSection } = useSectionNavigation(FORM_SECTIONS.map((s) => s.id));

  const router = useRouter();
  const supabase = createClient();

  const inferredState = initialData?.state || lookups?.cities.find((city) => city.id === initialData?.city_id)?.state;
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData ? { ...initialData, state: inferredState } : {
      status: "draft",
      purpose: "sale",
      featured: false,
      furnished: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const { ref: registerDescriptionRef, ...descriptionField } = register("description");
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (descriptionRef.current) autoResizeTextarea(descriptionRef.current);
  }, []);

  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true);
    try {
      const slug = generateSlug(data.title);
      
      const payload: Record<string, unknown> = {
        ...data,
      };

      if (!isEdit) {
        payload.slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        payload.id = pendingPropertyId;
      } else {
        payload.updated_at = new Date().toISOString();
      }

      let propertyId = initialData?.id;

      if (isEdit) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", propertyId);

        if (error) throw error;
      } else {
        const { data: newProp, error } = await supabase
          .from("properties")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        propertyId = newProp.id;

        if (selectedFeatures.length > 0) {
          await addPropertyFeatures(newProp.id, selectedFeatures.map((f) => f.id));
        }

        let failedImages = 0;
        for (const item of media) {
          try {
            await insertMediaRecord(newProp.id, item.storage_path, item.public_url, item.sort_order, item.is_cover);
          } catch (mediaError) {
            console.error("Failed to attach staged image:", mediaError);
            failedImages += 1;
          }
        }

        if (failedImages > 0) {
          alert(
            `Imóvel salvo, mas ${failedImages} imagem(ns) não puderam ser anexadas. Tente adicioná-las novamente na tela de edição.`,
          );
          router.push(`/admin/imoveis/${newProp.id}/editar`);
          router.refresh();
          return;
        }
      }

      alert("Imóvel salvo com sucesso!");
      router.push("/admin/imoveis");
      router.refresh();

    } catch (error) {
      const isDuplicateCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505";

      if (!isDuplicateCode) console.error(error);

      alert(
        isDuplicateCode
          ? "Este código já está em uso, escolha outro."
          : "Erro ao salvar o imóvel: " + (error instanceof Error ? error.message : "Desconhecido"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
      <nav aria-label="Seções do formulário" className="sticky top-32 hidden lg:block">
        <ul className="space-y-1">
          {FORM_SECTIONS.map((section, index) => {
            const active = activeSection === section.id;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-baseline gap-2.5 rounded-full px-4 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-mitram-dark font-medium text-white"
                      : "text-gray-600 hover:bg-gray-200/60 hover:text-mitram-dark"
                  }`}
                >
                  <span className={`text-xs font-bold ${active ? "text-white/50" : "text-gray-400"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg bg-white"
      >
        <FormSection
          id="informacoes"
          title="Informações básicas"
          description="Como o imóvel será identificado no site e no painel."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <FormField label="Título do anúncio" error={errors.title?.message} className="md:col-span-2">
              <input {...register("title")} placeholder=" " className={fieldClasses(!!errors.title)} />
            </FormField>
            <FormField label="Código do imóvel" error={errors.internal_code?.message} alwaysFloat>
              <input
                {...register("internal_code")}
                placeholder="Ex: AP-1234"
                className={fieldClasses(!!errors.internal_code)}
              />
            </FormField>
            <FormField label="Tipo de imóvel" error={errors.property_type_id?.message} alwaysFloat>
              <select
                {...register("property_type_id")}
                className={fieldClasses(!!errors.property_type_id, SELECT_EXTRA)}
                style={SELECT_ARROW_STYLE}
              >
                <option value="">Selecione...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </FormField>
            <FormField label="Status" error={errors.status?.message} alwaysFloat>
              <select
                {...register("status")}
                className={fieldClasses(!!errors.status, SELECT_EXTRA)}
                style={SELECT_ARROW_STYLE}
              >
                <option value="rented">Alugado</option>
                <option value="archived">Arquivado</option>
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="sold">Vendido</option>
              </select>
            </FormField>
            <label className="group flex cursor-pointer items-center gap-3 md:col-span-2">
              <input type="checkbox" {...register("featured")} className={CHECKBOX_CLASSES} />
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-mitram-dark">
                Destaque na página inicial
              </span>
            </label>
          </div>
        </FormSection>

        <FormSection
          id="preco"
          title="Preço e finalidade"
          description="Valores exibidos no anúncio. Deixe em branco os que não se aplicam."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <FormField label="Finalidade" error={errors.purpose?.message} alwaysFloat>
              <select
                {...register("purpose")}
                className={fieldClasses(!!errors.purpose, SELECT_EXTRA)}
                style={SELECT_ARROW_STYLE}
              >
                <option value="rent">Aluguel</option>
                <option value="sale">Venda</option>
              </select>
            </FormField>
            <FormField label="Preço" error={errors.price?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("price")}
                className={`${fieldClasses(!!errors.price, FIELD_NUMBER)} pr-12`}
              />
            </FormField>
            <FormField label="Condomínio" error={errors.condominium_fee?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("condominium_fee")}
                className={`${fieldClasses(!!errors.condominium_fee, FIELD_NUMBER)} pr-12`}
              />
            </FormField>
            <FormField label="IPTU" error={errors.iptu?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("iptu")}
                className={`${fieldClasses(!!errors.iptu, FIELD_NUMBER)} pr-12`}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection
          id="caracteristicas"
          title="Características"
          description="Metragem e comodidades usadas nos filtros de busca."
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            <FormField label="Área total" error={errors.total_area?.message} affix="m²">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("total_area")}
                className={`${fieldClasses(!!errors.total_area, FIELD_NUMBER)} pr-12`}
              />
            </FormField>
            <FormField label="Área privativa" error={errors.private_area?.message} affix="m²">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("private_area")}
                className={`${fieldClasses(!!errors.private_area, FIELD_NUMBER)} pr-12`}
              />
            </FormField>
            <FormField label="Quartos" error={errors.bedrooms?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("bedrooms")}
                className={fieldClasses(!!errors.bedrooms, FIELD_NUMBER)}
              />
            </FormField>
            <FormField label="Suítes" error={errors.suites?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("suites")}
                className={fieldClasses(!!errors.suites, FIELD_NUMBER)}
              />
            </FormField>
            <FormField label="Banheiros" error={errors.bathrooms?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("bathrooms")}
                className={fieldClasses(!!errors.bathrooms, FIELD_NUMBER)}
              />
            </FormField>
            <FormField label="Vagas" error={errors.parking_spaces?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("parking_spaces")}
                className={fieldClasses(!!errors.parking_spaces, FIELD_NUMBER)}
              />
            </FormField>
            <label className="group flex cursor-pointer items-center gap-3 self-end pb-3">
              <input type="checkbox" {...register("furnished")} className={CHECKBOX_CLASSES} />
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-mitram-dark">
                Mobiliado
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <FeatureSelector
              propertyId={initialData?.id}
              allFeatures={lookups?.features || []}
              selected={selectedFeatures}
              onSelectedChange={setSelectedFeatures}
            />
          </div>
        </FormSection>

        <AddressSection form={form} initialCities={lookups?.cities || []} initialNeighborhoods={lookups?.neighborhoods || []} />

        <FormSection
          id="descricao"
          title="Descrição e mídias"
          description="Texto do anúncio e links de vídeo ou tour virtual."
        >
          <div className="space-y-6">
            <FormField label="Descrição do imóvel" error={errors.description?.message}>
              <textarea
                rows={1}
                placeholder=" "
                {...descriptionField}
                ref={(element) => {
                  registerDescriptionRef(element);
                  descriptionRef.current = element;
                }}
                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                className={`${fieldClasses(!!errors.description)} resize-none`}
              />
            </FormField>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <FormField label="URL do YouTube" error={errors.youtube_url?.message}>
                <input
                  type="url"
                  placeholder=" "
                  {...register("youtube_url")}
                  className={fieldClasses(!!errors.youtube_url)}
                />
              </FormField>
              <FormField label="Tour virtual (URL)" error={errors.virtual_tour_url?.message}>
                <input
                  type="url"
                  placeholder=" "
                  {...register("virtual_tour_url")}
                  className={fieldClasses(!!errors.virtual_tour_url)}
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection
          id="fotos"
          title="Fotos do imóvel"
          description='Arraste para reordenar e use "Definir capa" para escolher a imagem principal.'
        >
          {effectivePropertyId && (
            <ImageUpload
              propertyId={effectivePropertyId}
              initialMedia={media}
              onMediaUpdate={setMedia}
              deferDbWrites={!isEdit}
            />
          )}
        </FormSection>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-b-lg bg-white/95 px-6 py-4 backdrop-blur md:px-10">
          <button type="button" onClick={() => router.back()} className={buttonClasses("secondary", "sm")}>
            <X size={16} />
            Cancelar
          </button>
          <button type="submit" disabled={loading} className={buttonClasses("primary", "sm")}>
            {isEdit ? <Save size={16} /> : <Plus size={16} />}
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar Imóvel"}
          </button>
        </div>
      </form>
    </div>
  );
}
