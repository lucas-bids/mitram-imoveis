import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { jsonLdProps } from "@/lib/jsonLd";
import { absoluteUrl } from "@/lib/site";

export type Crumb = { name: string; href: string };

/**
 * Trilha de navegação visível e o `BreadcrumbList` correspondente, no mesmo
 * componente — assim a marcação e o que o visitante vê não podem divergir.
 *
 * O último item é a página atual: texto, não link.
 */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };

  return (
    <>
      <script {...jsonLdProps(jsonLd)} />
      <nav aria-label="Você está aqui" className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={14} aria-hidden="true" className="text-gray-400" />}
                {isLast ? (
                  <span aria-current="page" className="text-mitram-dark line-clamp-1">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="rounded hover:text-mitram-dark hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
