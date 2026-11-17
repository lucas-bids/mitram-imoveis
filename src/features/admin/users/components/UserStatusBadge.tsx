import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { STATUS_LABELS, type UserStatus } from "../types";
import { ROLE_LABELS, type UserRole } from "../roles";

const STATUS_TONES: Record<UserStatus, BadgeTone> = {
  active: "green",
  deactivated: "gray",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function UserRoleBadge({ role }: { role: UserRole | null }) {
  if (!role) return <Badge tone="redLight">Sem acesso</Badge>;
  return <Badge tone={role === "admin" ? "blue" : "purple"}>{ROLE_LABELS[role]}</Badge>;
}
