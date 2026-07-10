"use client";

import { useState, useEffect } from "react";
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

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [media, setMedia] = useState<PropertyMedia[]>(initialData?.property_media || []);
  
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm">
      {/* 1. Informações Básicas */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título do Anúncio *</label>
            <input {...register("title")} className="mt-1 w-full px-3 py-2 border rounded" />
            {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Imóvel *</label>
            <select {...register("property_type_id")} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="">Selecione...</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {errors.property_type_id && <span className="text-red-500 text-xs">{errors.property_type_id.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status *</label>
            <select {...register("status")} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
              <option value="sold">Vendido</option>
              <option value="rented">Alugado</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" id="featured" {...register("featured")} className="h-4 w-4 text-mitram-gold" />
            <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Destaque na página inicial</label>
          </div>
        </div>
      </section>

      {/* 2. Preço e Finalidade */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Preço e Finalidade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Finalidade *</label>
            <select {...register("purpose")} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="sale">Venda</option>
              <option value="rent">Aluguel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
            <input type="number" step="0.01" {...register("price")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Condomínio (R$)</label>
            <input type="number" step="0.01" {...register("condominium_fee")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IPTU (R$)</label>
            <input type="number" step="0.01" {...register("iptu")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
        </div>
      </section>

      {/* 3. Características */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Características</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Área Total (m²)</label>
            <input type="number" step="0.01" {...register("total_area")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Área Privativa (m²)</label>
            <input type="number" step="0.01" {...register("private_area")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quartos</label>
            <input type="number" {...register("bedrooms")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Suítes</label>
            <input type="number" {...register("suites")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Banheiros</label>
            <input type="number" {...register("bathrooms")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vagas</label>
            <input type="number" {...register("parking_spaces")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Andar</label>
            <input type="number" {...register("floor")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" id="furnished" {...register("furnished")} className="h-4 w-4 text-mitram-gold" />
            <label htmlFor="furnished" className="ml-2 text-sm text-gray-700">Mobiliado</label>
          </div>
        </div>
      </section>

      {/* 4. Endereço */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Endereço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cidade *</label>
            <select {...register("city_id")} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="">Selecione...</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.city_id && <span className="text-red-500 text-xs">{errors.city_id.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bairro</label>
            <select {...register("neighborhood_id")} className="mt-1 w-full px-3 py-2 border rounded">
              <option value="">Selecione...</option>
              {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Rua</label>
              <input {...register("street")} className="mt-1 w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <input {...register("number")} className="mt-1 w-full px-3 py-2 border rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Descrição */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Descrição e Mídias</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição do Imóvel</label>
          <textarea {...register("description")} rows={5} className="mt-1 w-full px-3 py-2 border rounded"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">URL do YouTube</label>
            <input type="url" {...register("youtube_url")} className="mt-1 w-full px-3 py-2 border rounded" placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tour Virtual (URL)</label>
            <input type="url" {...register("virtual_tour_url")} className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
        </div>
      </section>

      {/* 6. Fotos (Apenas se já estiver salvo, senão pede pra salvar antes) */}
      {isEdit ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Fotos do Imóvel</h2>
          <ImageUpload propertyId={initialData.id} initialMedia={media} onMediaUpdate={setMedia} />
        </section>
      ) : (
        <div className="bg-blue-50 text-blue-800 p-4 rounded text-sm">
          Você poderá adicionar imagens após salvar o imóvel pela primeira vez.
        </div>
      )}

      {/* Submit */}
      <div className="pt-4 flex justify-end gap-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-mitram-dark text-white rounded hover:bg-black transition-colors disabled:opacity-50"
        >
          {loading ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar Imóvel"}
        </button>
      </div>
    </form>
  );
}
