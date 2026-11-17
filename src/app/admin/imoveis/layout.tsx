import { AdminChrome } from "@/features/admin/components/AdminChrome";
import { getCurrentUserRole } from "@/features/admin/users/server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getCurrentUserRole();
  return <AdminChrome showUsers={role === "admin"}>{children}</AdminChrome>;
}
