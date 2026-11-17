import { AdminChrome } from "@/features/admin/components/AdminChrome";
import { requireAdminPage } from "@/features/admin/users/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  // Defesa em profundidade: o middleware já barra editores aqui.
  await requireAdminPage();
  return <AdminChrome showUsers>{children}</AdminChrome>;
}
