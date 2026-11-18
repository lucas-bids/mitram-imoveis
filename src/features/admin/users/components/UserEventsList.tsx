import { cardClasses } from "@/components/ui/cardStyles";
import { ACTION_LABELS, type UserManagementEvent } from "../types";
import { ROLE_LABELS, type UserRole } from "../roles";

function roleLabel(value: unknown) {
  return typeof value === "string" && value in ROLE_LABELS ? ROLE_LABELS[value as UserRole] : "sem acesso";
}

function describeDetails(event: UserManagementEvent): string | null {
  const d = event.details;
  if ((event.action === "created" || event.action === "invited") && typeof d.role === "string") {
    return `como ${roleLabel(d.role)}`;
  }
  if (event.action === "password_set" && d.sessionsRevoked === false) {
    return "(sessões não encerradas)";
  }
  if (event.action === "email_changed" && typeof d.from === "string") return `(antes: ${d.from})`;
  if (event.action === "updated") {
    const parts: string[] = [];
    const role = d.role as { from?: unknown; to?: unknown } | undefined;
    if (role) parts.push(`papel: ${roleLabel(role.from)} → ${roleLabel(role.to)}`);
    if (d.fullName) parts.push("nome alterado");
    return parts.length ? `(${parts.join("; ")})` : null;
  }
  return null;
}

export function UserEventsList({ events }: { events: UserManagementEvent[] }) {
  return (
    <section aria-labelledby="usuarios-historico">
      <h2 id="usuarios-historico" className="mb-3 text-lg font-semibold text-mitram-dark">
        Histórico de alterações
      </h2>
      <div className={cardClasses("bg-white rounded-lg")}>
        {events.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">Nenhuma alteração registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => {
              const extra = describeDetails(event);
              return (
                <li key={event.id} className="flex flex-col gap-1 px-6 py-3 text-sm md:flex-row md:items-baseline md:justify-between">
                  <span className="text-gray-900 break-words">
                    <strong className="font-semibold">{event.actorEmail ?? "Sistema"}</strong>{" "}
                    {ACTION_LABELS[event.action] ?? event.action}{" "}
                    <strong className="font-semibold">{event.targetEmail ?? "—"}</strong>
                    {extra && <span className="text-gray-500"> {extra}</span>}
                  </span>
                  <time dateTime={event.createdAt} className="shrink-0 text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
