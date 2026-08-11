import PropertyForm from "@/features/admin/properties/components/PropertyForm";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_MEDIA_ALL } from "@/features/properties/queries";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { BackLink } from "@/features/admin/components/BackLink";
import { getPropertyFormLookups } from "@/features/admin/properties/queries";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  
  const { data: propertyData, error } = await supabase
    .from("properties")
    .select(`
      *,
      ${PROPERTY_MEDIA_ALL},
      property_features (features (id, name))
    `)
    .eq("id", id)
    .single();

  const property = propertyData as any;

  if (error || !property) {
    notFound();
  }

  const lookups = await getPropertyFormLookups();

  return (
    <div className="pb-12">
      <AdminPageHeader title={`Editar Imóvel: ${property.internal_code}`}>
        <BackLink href="/admin/imoveis" label="Voltar para imóveis" />
      </AdminPageHeader>
      
      <PropertyForm initialData={property} isEdit={true} lookups={lookups} />
    </div>
  );
}
