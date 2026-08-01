"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyFormValues } from "@/lib/validation/property";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ImageUpload, { PropertyMedia } from "./ImageUpload";

interface PropertyFormProps {
  initialData?: any;
  isEdit?: boolean;
}

const SECTIONS: { id: string; label: string; requiresSavedProperty?: boolean }[] = [
  { id: "informacoes", label: "Informações básicas" },
  { id: "preco", label: "Preço e finalidade" },
  { id: "caracteristicas", label: "Características" },
  { id: "endereco", label: "Endereço" },
  { id: "descricao", label: "Descrição e mídias" },
  { id: "fotos", label: "Fotos", requiresSavedProperty: true },
];

const autoResizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
};

const sectionNumber = (id: string) =>
  String(SECTIONS.findIndex((section) => section.id === id) + 1).padStart(2, "0");

const FIELD_BASE =
  "peer h-12 w-full border-0 border-b-2 bg-transparent px-0 py-3 font-medium leading-normal text-mitram-dark transition-colors focus:outline-none focus:ring-0";
const FIELD_NORMAL = "border-gray-300 focus:border-mitram-dark";
const FIELD_ERROR = "border-red-400 focus:border-red-500";
// Os spinners nativos colidem com os sufixos (R$ / m²) exibidos dentro do campo.
const FIELD_NUMBER =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

const fieldClass = (hasError?: boolean, extra?: string) =>
  [FIELD_BASE, hasError ? FIELD_ERROR : FIELD_NORMAL, extra].filter(Boolean).join(" ");

const CHECKBOX_INPUT =
  "h-5 w-5 cursor-pointer rounded border-2 border-gray-300 accent-mitram-dark transition-colors";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 px-6 py-12 md:px-10">
      <div className="mb-10">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-bold tracking-wider text-gray-300">{sectionNumber(id)}</span>
          <h2 className="text-2xl font-bold text-mitram-dark">{title}</h2>
        </div>
        <p className="mt-2 text-gray-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

// O rótulo ocupa o lugar do placeholder enquanto o campo está vazio e sobe ao receber foco
// ou valor. Selects não têm :placeholder-shown, por isso o rótulo fica sempre no alto.
function Field({
  label,
  error,
  affix,
  alwaysFloat,
  className,
  children,
}: {
  label: string;
  error?: string;
  affix?: string;
  alwaysFloat?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const restingLabel =
    "peer-placeholder-shown:top-8 peer-placeholder-shown:text-base peer-focus:top-0 peer-focus:text-xs";

  return (
    <label className={`relative block pt-5 ${className ?? ""}`}>
      {children}
      <span
        className={`pointer-events-none absolute left-0 top-0 text-xs font-medium transition-all duration-150 ${
          error ? "text-red-500" : "text-gray-500"
        } ${alwaysFloat ? "" : restingLabel}`}
      >
        {label}
      </span>
      {affix && (
        <span className="pointer-events-none absolute right-0 top-5 py-3 font-medium text-gray-400">
          {affix}
        </span>
      )}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [media, setMedia] = useState<PropertyMedia[]>(initialData?.property_media || []);
  const [activeSection, setActiveSection] = useState<string>(SECTIONS[0].id);

  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      status: "draft",
      purpose: "sale",
      featured: false,
      furnished: false,
    },
  });

  const watchCity = watch("city_id");

  const { ref: registerDescriptionRef, ...descriptionField } = register("description");
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (descriptionRef.current) autoResizeTextarea(descriptionRef.current);
  }, []);

  useEffect(() => {
    async function loadFormDependencies() {
      const [
        { data: typesData },
        { data: citiesData },
      ] = await Promise.all([
        supabase.from("property_types").select("*").eq("active", true).order("sort_order"),
        supabase.from("cities").select("*").eq("active", true).order("name"),
      ]);

      if (typesData) setTypes(typesData);
      if (citiesData) setCities(citiesData);
    }
    loadFormDependencies();
  }, [supabase]);

  useEffect(() => {
    async function loadNeighborhoods() {
      if (watchCity) {
        const { data } = await supabase
          .from("neighborhoods")
          .select("*")
          .eq("city_id", watchCity)
          .eq("active", true)
          .order("name");
        
        if (data) setNeighborhoods(data);
      } else {
        setNeighborhoods([]);
      }
    }
    loadNeighborhoods();
  }, [watchCity, supabase]);

  useEffect(() => {
    const elements = SECTIONS
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const topMost = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (topMost) setActiveSection(topMost.target.id);
      },
      { rootMargin: "-120px 0px -55% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [isEdit]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const onSubmit = async (data: PropertyFormValues) => {
    setLoading(true);
    try {
      const slug = generateSlug(data.title);
      
      const payload: any = {
        ...data,
      };

      if (!isEdit) {
        payload.slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        // generate a pseudo internal code
        payload.internal_code = `MIT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
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
      }

      alert("Imóvel salvo com sucesso!");
      router.push("/admin/imoveis");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("Erro ao salvar o imóvel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
      <nav aria-label="Seções do formulário" className="sticky top-24 hidden lg:block">
        <ul className="space-y-1">
          {SECTIONS.map((section, index) => {
            const disabled = section.requiresSavedProperty && !isEdit;
            const active = activeSection === section.id;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => scrollToSection(section.id)}
                  aria-current={active ? "true" : undefined}
                  title={disabled ? "Disponível após salvar o imóvel" : undefined}
                  className={`flex w-full items-baseline gap-2.5 rounded-full px-4 py-2 text-left text-sm transition-colors ${
                    disabled
                      ? "cursor-not-allowed text-gray-400"
                      : active
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
        className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm"
      >
        <Section
          id="informacoes"
          title="Informações básicas"
          description="Como o imóvel será identificado no site e no painel."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <Field label="Título do anúncio" error={errors.title?.message} className="md:col-span-2">
              <input {...register("title")} placeholder=" " className={fieldClass(!!errors.title)} />
            </Field>
            <Field label="Tipo de imóvel" error={errors.property_type_id?.message} alwaysFloat>
              <select
                {...register("property_type_id")}
                className={fieldClass(!!errors.property_type_id)}
              >
                <option value="">Selecione...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Status" error={errors.status?.message} alwaysFloat>
              <select {...register("status")} className={fieldClass(!!errors.status)}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
                <option value="sold">Vendido</option>
                <option value="rented">Alugado</option>
              </select>
            </Field>
            <label className="group flex cursor-pointer items-center gap-3 md:col-span-2">
              <input type="checkbox" {...register("featured")} className={CHECKBOX_INPUT} />
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-mitram-dark">
                Destaque na página inicial
              </span>
            </label>
          </div>
        </Section>

        <Section
          id="preco"
          title="Preço e finalidade"
          description="Valores exibidos no anúncio. Deixe em branco os que não se aplicam."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
            <Field label="Finalidade" error={errors.purpose?.message} alwaysFloat>
              <select {...register("purpose")} className={fieldClass(!!errors.purpose)}>
                <option value="sale">Venda</option>
                <option value="rent">Aluguel</option>
              </select>
            </Field>
            <Field label="Preço" error={errors.price?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("price")}
                className={`${fieldClass(!!errors.price, FIELD_NUMBER)} pr-10`}
              />
            </Field>
            <Field label="Condomínio" error={errors.condominium_fee?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("condominium_fee")}
                className={`${fieldClass(!!errors.condominium_fee, FIELD_NUMBER)} pr-10`}
              />
            </Field>
            <Field label="IPTU" error={errors.iptu?.message} affix="R$">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("iptu")}
                className={`${fieldClass(!!errors.iptu, FIELD_NUMBER)} pr-10`}
              />
            </Field>
          </div>
        </Section>

        <Section
          id="caracteristicas"
          title="Características"
          description="Metragem e comodidades usadas nos filtros de busca."
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            <Field label="Área total" error={errors.total_area?.message} affix="m²">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("total_area")}
                className={`${fieldClass(!!errors.total_area, FIELD_NUMBER)} pr-10`}
              />
            </Field>
            <Field label="Área privativa" error={errors.private_area?.message} affix="m²">
              <input
                type="number"
                step="0.01"
                placeholder=" "
                {...register("private_area")}
                className={`${fieldClass(!!errors.private_area, FIELD_NUMBER)} pr-10`}
              />
            </Field>
            <Field label="Quartos" error={errors.bedrooms?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("bedrooms")}
                className={fieldClass(!!errors.bedrooms, FIELD_NUMBER)}
              />
            </Field>
            <Field label="Suítes" error={errors.suites?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("suites")}
                className={fieldClass(!!errors.suites, FIELD_NUMBER)}
              />
            </Field>
            <Field label="Banheiros" error={errors.bathrooms?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("bathrooms")}
                className={fieldClass(!!errors.bathrooms, FIELD_NUMBER)}
              />
            </Field>
            <Field label="Vagas" error={errors.parking_spaces?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("parking_spaces")}
                className={fieldClass(!!errors.parking_spaces, FIELD_NUMBER)}
              />
            </Field>
            <Field label="Andar" error={errors.floor?.message}>
              <input
                type="number"
                placeholder=" "
                {...register("floor")}
                className={fieldClass(!!errors.floor, FIELD_NUMBER)}
              />
            </Field>
            <label className="group flex cursor-pointer items-center gap-3 self-end pb-3">
              <input type="checkbox" {...register("furnished")} className={CHECKBOX_INPUT} />
              <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-mitram-dark">
                Mobiliado
              </span>
            </label>
          </div>
        </Section>

        <Section
          id="endereco"
          title="Endereço"
          description="A cidade e o bairro definem onde o imóvel aparece nas buscas."
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <Field label="Cidade" error={errors.city_id?.message} alwaysFloat>
              <select {...register("city_id")} className={fieldClass(!!errors.city_id)}>
                <option value="">Selecione...</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field
              label="Bairro"
              error={errors.neighborhood_id?.message}
              alwaysFloat
              className="md:col-span-2"
            >
              <select
                {...register("neighborhood_id")}
                disabled={!watchCity}
                className={`${fieldClass(!!errors.neighborhood_id)} disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400`}
              >
                <option value="">{watchCity ? "Selecione..." : "Selecione a cidade primeiro"}</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </Field>
            <Field label="Rua" error={errors.street?.message} className="md:col-span-2">
              <input placeholder=" " {...register("street")} className={fieldClass(!!errors.street)} />
            </Field>
            <Field label="Número" error={errors.number?.message}>
              <input placeholder=" " {...register("number")} className={fieldClass(!!errors.number)} />
            </Field>
          </div>
        </Section>

        <Section
          id="descricao"
          title="Descrição e mídias"
          description="Texto do anúncio e links de vídeo ou tour virtual."
        >
          <div className="space-y-6">
            <Field label="Descrição do imóvel" error={errors.description?.message}>
              <textarea
                rows={1}
                placeholder=" "
                {...descriptionField}
                ref={(element) => {
                  registerDescriptionRef(element);
                  descriptionRef.current = element;
                }}
                onInput={(event) => autoResizeTextarea(event.currentTarget)}
                className={`${fieldClass(!!errors.description)} resize-none`}
              />
            </Field>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <Field label="URL do YouTube" error={errors.youtube_url?.message}>
                <input
                  type="url"
                  placeholder=" "
                  {...register("youtube_url")}
                  className={fieldClass(!!errors.youtube_url)}
                />
              </Field>
              <Field label="Tour virtual (URL)" error={errors.virtual_tour_url?.message}>
                <input
                  type="url"
                  placeholder=" "
                  {...register("virtual_tour_url")}
                  className={fieldClass(!!errors.virtual_tour_url)}
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section
          id="fotos"
          title="Fotos do imóvel"
          description={
            isEdit
              ? "Arraste para reordenar e use \"Definir capa\" para escolher a imagem principal."
              : "Disponível depois que o imóvel for salvo pela primeira vez."
          }
        >
          {isEdit ? (
            <ImageUpload propertyId={initialData.id} initialMedia={media} onMediaUpdate={setMedia} />
          ) : (
            <p className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              Você poderá adicionar imagens após salvar o imóvel pela primeira vez.
            </p>
          )}
        </Section>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-b-lg bg-white/95 px-6 py-4 backdrop-blur md:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-mitram-dark px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
          >
            {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar Imóvel"}
          </button>
        </div>
      </form>
    </div>
  );
}
