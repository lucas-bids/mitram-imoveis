import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Edit, Copy, Trash2, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();
  
  const { data: properties, error } = await supabase
    .from("properties")
    .select(`
      id,
      internal_code,
      title,
      slug,
      purpose,
      status,
      price,
      featured,
      created_at,
      property_types (name),
      neighborhoods (name, cities (name))
    `)
    .in("status", ["draft", "published", "archived", "sold", "rented"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Publicado</span>;
      case "draft": return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">Rascunho</span>;
      case "sold": return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Vendido</span>;
      case "rented": return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">Alugado</span>;
      case "archived": return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Arquivado</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-mitram-dark">Imóveis</h1>
        <Link 
          href="/admin/imoveis/novo" 
          className="flex items-center gap-2 bg-mitram-dark text-white px-4 py-2 rounded hover:bg-black transition-colors"
        >
          <Plus size={18} />
          Novo imóvel
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Código</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Imóvel</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tipo/Finalidade</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Preço</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties && properties.length > 0 ? (
                properties.map((prop: any) => (
                  <tr key={prop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{prop.internal_code}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={prop.title}>{prop.title}</div>
                      <div className="text-xs text-gray-500">
                        {prop.neighborhoods?.name}, {prop.neighborhoods?.cities?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{prop.property_types?.name}</div>
                      <div className="text-xs text-gray-500">{prop.purpose === 'sale' ? 'Venda' : 'Aluguel'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(prop.status)}
                        {prop.featured && <span className="px-2 py-1 bg-mitram-goldLight text-mitram-dark rounded text-xs font-medium">Destaque</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {prop.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price) : '-'}
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
                      <form action={async () => {
                        "use server"
                        const sb = createClient();
                        await sb.from('properties').update({ status: 'trashed', deleted_at: new Date().toISOString() }).eq('id', prop.id);
                        const { revalidatePath } = await import('next/cache');
                        revalidatePath('/admin/imoveis');
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-900" title="Mover para lixeira">
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
