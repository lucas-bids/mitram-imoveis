import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { BackLink } from "@/features/admin/components/BackLink";
import { EditUserForm } from "@/features/admin/users/components/EditUserForm";
import { SetPasswordForm } from "@/features/admin/users/components/SetPasswordForm";
import { UserAccountActions } from "@/features/admin/users/components/UserAccountActions";
import { UserStatusBadge } from "@/features/admin/users/components/UserStatusBadge";
import { userIdSchema } from "@/features/admin/users/schema";
import { getUser, requireAdminPage } from "@/features/admin/users/server";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminPage();
  const { id } = await params;

  const parsed = userIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  const user = await getUser(parsed.data);
  if (!user) notFound();

  const isSelf = user.id === actor.id;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={user.fullName || user.email} description={user.fullName ? user.email : undefined}>
        <BackLink href="/admin/usuarios" label="Voltar para usuários" />
      </AdminPageHeader>

      <div className="flex items-center gap-3">
        <UserStatusBadge status={user.status} />
        {isSelf && <span className="text-sm text-gray-500">Esta é a sua conta.</span>}
      </div>

      <EditUserForm user={user} isSelf={isSelf} />
      <SetPasswordForm user={user} isSelf={isSelf} />
      <UserAccountActions user={user} isSelf={isSelf} />
    </div>
  );
}
