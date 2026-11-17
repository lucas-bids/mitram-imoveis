import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { CreateUserForm } from "@/features/admin/users/components/CreateUserForm";
import { UsersTable } from "@/features/admin/users/components/UsersTable";
import { UserEventsList } from "@/features/admin/users/components/UserEventsList";
import { getUserEvents, listUsers, requireAdminPage } from "@/features/admin/users/server";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { logError } from "@/lib/logger";
import type { AdminUser } from "@/features/admin/users/types";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const actor = await requireAdminPage();

  let users: AdminUser[] | null = null;
  try {
    users = await listUsers();
  } catch (error) {
    logError("admin/usuarios/page", error);
  }
  const events = await getUserEvents(30);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Usuários"
        description="Administradores gerenciam usuários e todo o conteúdo. Editores gerenciam todo o conteúdo, mas não usuários."
      />

      <CreateUserForm />

      {users ? (
        <UsersTable users={users} currentUserId={actor.id} />
      ) : (
        <AlertMessage tone="error">Não foi possível carregar os usuários. Tente novamente.</AlertMessage>
      )}

      <UserEventsList events={events} />
    </div>
  );
}
