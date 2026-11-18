"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cardClasses } from "@/components/ui/cardStyles";

const sections = [
  { href: "/admin/imoveis", label: "Imóveis", match: (p: string) => p === "/admin/imoveis" },
  { href: "/admin/imoveis/lixeira", label: "Lixeira", match: (p: string) => p === "/admin/imoveis/lixeira" },
];

const usersSection = {
  href: "/admin/usuarios",
  label: "Usuários",
  match: (p: string) => p === "/admin/usuarios" || p.startsWith("/admin/usuarios/"),
};

export function ImoveisSectionToggle({ showUsers = false }: { showUsers?: boolean }) {
  const pathname = usePathname();
  const items = showUsers ? [...sections, usersSection] : sections;

  return (
    <nav aria-label="Seções do painel" className={cardClasses("bg-white rounded-full p-1.5 flex")}>
      {items.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
              active ? "bg-mitram-gold text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
