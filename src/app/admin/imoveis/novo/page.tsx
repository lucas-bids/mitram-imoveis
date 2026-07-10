import PropertyForm from "@/components/admin/PropertyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewPropertyPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <Link href="/admin/imoveis" className="text-gray-500 hover:text-mitram-dark inline-flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} />
          Voltar para imóveis
        </Link>
        <h1 className="text-2xl font-bold text-mitram-dark mt-2">Novo Imóvel</h1>
      </div>
      
      <PropertyForm />
    </div>
  );
}
