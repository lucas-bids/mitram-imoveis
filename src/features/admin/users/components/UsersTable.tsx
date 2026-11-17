import Link from "next/link";
import { Edit } from "lucide-react";
import { AdminTable } from "@/features/admin/components/AdminTable";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AdminUser } from "../types";
import { UserRoleBadge, UserStatusBadge } from "./UserStatusBadge";

function formatDateTime(value: string | null) {
  if (!value) return "Nunca";
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

interface UsersTableProps {
  users: AdminUser[];
  currentUserId: string;
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  return (
    <section aria-labelledby="usuarios-lista">
      <h2 id="usuarios-lista" className="mb-3 text-lg font-semibold text-mitram-dark">
        Usuários cadastrados
      </h2>
      <AdminTable headers={["Usuário", "Papel", "Status", "Último acesso", "Ações"]}>
        {users.length > 0 ? (
          users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {/* O nome também é o link: no celular a coluna de ações fica fora da tela. */}
                  <Link href={`/admin/usuarios/${user.id}`} className="hover:text-mitram-gold hover:underline">
                    {user.fullName || user.email}
                  </Link>
                  {user.id === currentUserId && <span className="ml-2 text-xs font-normal text-gray-500">(você)</span>}
                </div>
                <div className="text-xs text-gray-500 break-all">{user.email}</div>
              </td>
              <td className="px-6 py-4">
                <UserRoleBadge role={user.role} />
              </td>
              <td className="px-6 py-4">
                <UserStatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(user.lastSignInAt)}</td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/usuarios/${user.id}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg p-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-mitram-dark"
                  aria-label={`Gerenciar ${user.fullName || user.email}`}
                >
                  <Edit size={18} aria-hidden="true" />
                  <span className="hidden md:inline">Gerenciar</span>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5}>
              <EmptyState title="Nenhum usuário encontrado." />
            </td>
          </tr>
        )}
      </AdminTable>
    </section>
  );
}
