import { getTrashedProperties } from "@/features/properties/queries";
import { RefreshCw, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import ConfirmSubmitButton from "@/features/admin/components/ConfirmSubmitButton";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { BackLink } from "@/features/admin/components/BackLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { restorePropertyFromTrash, deletePropertyPermanently } from "@/features/admin/properties/actions";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const properties = await getTrashedProperties();

  return (
    <div>
      <AdminPageHeader title="Lixeira">
        <BackLink href="/admin/imoveis" label="Voltar para imóveis" />
      </AdminPageHeader>

      <AdminTable headers={["Código", "Imóvel", "Data de Exclusão", "Ações"]}>
        {properties && properties.length > 0 ? (
          properties.map((prop: any) => (
            <tr key={prop.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{prop.internal_code}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{prop.title}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(prop.deleted_at).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                <form action={restorePropertyFromTrash}>
                  <input type="hidden" name="id" value={prop.id} />
                  <button type="submit" className="text-green-600 hover:text-green-900 flex items-center gap-1" title="Restaurar">
                    <RefreshCw size={16} /> Restaurar
                  </button>
                </form>
                <form action={deletePropertyPermanently}>
                  <input type="hidden" name="id" value={prop.id} />
                  <ConfirmSubmitButton
                    className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    title="Excluir Permanentemente"
                    confirmMessage={`Excluir permanentemente o imóvel ${prop.internal_code}? Esta ação não pode ser desfeita.`}
                  >
                    <Trash2 size={16} /> Excluir
                  </ConfirmSubmitButton>
                </form>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="px-6 py-8">
              <EmptyState title="A lixeira está vazia" />
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
