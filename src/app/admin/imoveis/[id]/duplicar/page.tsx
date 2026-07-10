import PropertyForm from "@/components/admin/PropertyForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function DuplicatePropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !property) {
    notFound();
  }

  // Clear ID, slug, internal_code, cover_image, status, featured to make it a fresh copy
  const duplicateData = {
    ...property,
    id: undefined,
    internal_code: undefined,
    slug: undefined,
    cover_image_id: null,
    status: "draft",
    featured: false,
    title: `${property.title} (Cópia)`,
    property_media: [],
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <Link href="/admin/imoveis" className="text-gray-500 hover:text-mitram-dark inline-flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} />
          Voltar para imóveis
        </Link>
        <h1 className="text-2xl font-bold text-mitram-dark mt-2">Duplicar Imóvel</h1>
        <p className="text-sm text-gray-500 mt-1">Imagens não são copiadas. Você precisará adicioná-las novamente.</p>
      </div>
      
      <PropertyForm initialData={duplicateData} isEdit={false} />
    </div>
  );
}
