"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cardClasses } from "@/components/ui/cardStyles";

const sections = [
  { href: "/admin/imoveis", label: "Imóveis" },
  { href: "/admin/imoveis/lixeira", label: "Lixeira" },
];

export function ImoveisSectionToggle() {
  const pathname = usePathname();

  return (
    <div className={cardClasses("bg-white rounded-full p-1.5 flex")}>
      {sections.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
            pathname === href
              ? "bg-mitram-gold text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
