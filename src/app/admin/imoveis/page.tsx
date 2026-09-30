import Link from "next/link";
import { Edit, Copy, Trash2, Eye } from "lucide-react";
import { formatPrice, purposeLabel, statusLabel, locationLabel } from "@/features/properties/format";
import { AdminPropertyListItem } from "@/features/properties/types";
import { getAdminProperties } from "@/features/properties/queries";
import { movePropertyToTrash } from "@/features/admin/properties/actions";

import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const properties = await getAdminProperties();

  const getStatusBadge = (status: string) => {
    const label = statusLabel(status);
    switch (status) {
      case "published": return <Badge tone="green">{label}</Badge>;
      case "draft": return <Badge tone="gray">{label}</Badge>;
      case "sold": return <Badge tone="blue">{label}</Badge>;
      case "rented": return <Badge tone="purple">{label}</Badge>;
      case "archived": return <Badge tone="yellow">{label}</Badge>;
      case "trashed": return <Badge tone="red">{label}</Badge>;
      default: return <Badge tone="gray">{label}</Badge>;
    }
  };

  return (
    <div>
      <AdminPageHeader title="Imóveis" />

      <AdminTable headers={["Código", "Imóvel", "Tipo/Finalidade", "Status", "Preço", "Ações"]}>
        {properties && properties.length > 0 ? (
          (properties as unknown as AdminPropertyListItem[]).map((prop: AdminPropertyListItem) => (
            <tr key={prop.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{prop.internal_code}</td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={prop.title}>{prop.title}</div>
                <div className="text-xs text-gray-500">
                  {locationLabel(prop.neighborhoods)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{prop.property_types?.name}</div>
                <div className="text-xs text-gray-500">{purposeLabel(prop.purpose)}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1 items-start">
                  {getStatusBadge(prop.status)}
                  {prop.featured && <Badge tone="gold">Destaque</Badge>}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formatPrice(prop.price)}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-2">
                <Link href={`/imovel/${prop.slug}`} target="_blank" className="text-gray-500 hover:text-mitram-dark" title="Visualizar no site">
                  <Eye size={18} />
                </Link>
                <Link href={`/admin/imoveis/${prop.id}/editar`} className="text-blue-600 hover:text-blue-900" title="Editar">
                  <Edit size={18} />
                </Link>
                <Link href={`/admin/imoveis/${prop.id}/duplicar`} className="text-green-600 hover:text-green-900" title="Duplicar">
                  <Copy size={18} />
                </Link>
                <form action={movePropertyToTrash}>
                  <input type="hidden" name="id" value={prop.id} />
                  <button type="submit" className="text-red-600 hover:text-red-900" title="Mover para lixeira">
                    <Trash2 size={18} />
                  </button>
                </form>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="px-6 py-8">
              <EmptyState title="Nenhum imóvel encontrado" />
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
}
