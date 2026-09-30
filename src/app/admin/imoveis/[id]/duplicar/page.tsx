import PropertyForm from "@/features/admin/properties/components/PropertyForm";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { BackLink } from "@/features/admin/components/BackLink";
import { getPropertyFormLookups } from "@/features/admin/properties/queries";

export default async function DuplicatePropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  const { data: property, error } = await supabase
    .from("properties")
    .select("*, property_features (features (id, name))")
    .eq("id", id)
    .single();

  if (error || !property) {
    notFound();
  }

  // Clear ID, slug, internal_code, cover_image, status, featured to make it a fresh copy
  const SUFFIX = " (Cópia)";
  const MAX_TITLE = 100; // mesmo limite do propertySchema / do feed VrSync

  const duplicateData = {
    ...property,
    id: undefined,
    internal_code: undefined,
    slug: undefined,
    cover_image_id: null,
    status: "draft",
    featured: false,
    // O sufixo pode estourar o limite de 100 caracteres do título, o que
    // travaria o salvamento da cópia. Corta o original, não o sufixo.
    title: `${property.title.slice(0, MAX_TITLE - SUFFIX.length).trimEnd()}${SUFFIX}`,
    // Uma cópia descreve o mesmo imóvel: mandá-la ao feed junto com a original
    // geraria erro de duplicidade no portal. Quem duplicou reabilita se quiser.
    olx_enabled: false,
    property_media: [],
  };

  const lookups = await getPropertyFormLookups();

  return (
    <div className="pb-12">
      <AdminPageHeader title="Duplicar Imóvel" description="Imagens não são copiadas. Você precisará adicioná-las novamente.">
        <BackLink href="/admin/imoveis" label="Voltar para imóveis" />
      </AdminPageHeader>
      
      <PropertyForm initialData={duplicateData} isEdit={false} lookups={lookups} />
    </div>
  );
}
