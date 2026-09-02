import type { Metadata } from "next";

/**
 * Layout server-side de passagem, criado só para carregar o `noindex`.
 *
 * `src/app/admin/imoveis/layout.tsx` é um Client Component e por isso não pode
 * exportar metadata. Este layout fica na raiz de /admin, então cobre login,
 * recuperar-senha, redefinir-senha, tudo sob /admin/imoveis e qualquer página
 * futura do painel — sem alterar a UI.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
