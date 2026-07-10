import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { RefreshCw, Trash2, ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function LixeiraPage() {
  const supabase = createClient();
  
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, internal_code, title, deleted_at")
    .eq("status", "trashed")
    .order("deleted_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/imoveis" className="text-gray-500 hover:text-mitram-dark inline-flex items-center gap-1 text-sm font-medium">
          <ArrowLeft size={16} />
          Voltar para imóveis
        </Link>
        <h1 className="text-2xl font-bold text-mitram-dark mt-2">Lixeira</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Código</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Imóvel</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Data de Exclusão</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties && properties.length > 0 ? (
                properties.map((prop: any) => (
                  <tr key={prop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{prop.internal_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{prop.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(prop.deleted_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex justify-end gap-3">
                      <form action={async () => {
                        "use server"
                        const sb = createClient();
                        await sb.from('properties').update({ status: 'draft', deleted_at: null }).eq('id', prop.id);
                        revalidatePath('/admin/imoveis/lixeira');
                      }}>
                        <button type="submit" className="text-green-600 hover:text-green-900 flex items-center gap-1" title="Restaurar">
                          <RefreshCw size={16} /> Restaurar
                        </button>
                      </form>
                      <form action={async () => {
                        "use server"
                        const sb = createClient();
                        // This will trigger cascade delete on media and features if configured, otherwise we'd need to delete media first.
                        await sb.from('properties').delete().eq('id', prop.id);
                        revalidatePath('/admin/imoveis/lixeira');
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-900 flex items-center gap-1" title="Excluir Permanentemente" onClick={(e) => {
                           // Using native confirmation is tricky in server actions, 
                           // In MVP we assume the user is careful, or we use a client component wrapper.
                        }}>
                          <Trash2 size={16} /> Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    A lixeira está vazia.
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
