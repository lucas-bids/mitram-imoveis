import PropertyForm from "@/features/admin/properties/components/PropertyForm";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { BackLink } from "@/features/admin/components/BackLink";
import { getPropertyFormLookups } from "@/features/admin/properties/queries";

export default async function NewPropertyPage() {
  const lookups = await getPropertyFormLookups();
  return (
    <div className="max-w-6xl mx-auto pb-12">
      <AdminPageHeader title="Novo Imóvel">
        <BackLink href="/admin/imoveis" label="Voltar para imóveis" />
      </AdminPageHeader>
      
      <PropertyForm lookups={lookups} />
    </div>
  );
}
