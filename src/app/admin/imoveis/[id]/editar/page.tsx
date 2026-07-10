import PropertyForm from "@/components/admin/PropertyForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_media (*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !property) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <Link href="/admin/imoveis" className="text-gray-500 hover:text-mitram-dark inline-flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} />
          Voltar para imóveis
        </Link>
        <h1 className="text-2xl font-bold text-mitram-dark mt-2">Editar Imóvel: {property.internal_code}</h1>
      </div>
      
      <PropertyForm initialData={property} isEdit={true} />
    </div>
  );
}
