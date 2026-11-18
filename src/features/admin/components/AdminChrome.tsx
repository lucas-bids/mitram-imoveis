"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { LogoutButton } from "@/features/admin/components/LogoutButton";
import { ImoveisSectionToggle } from "@/features/admin/components/ImoveisSectionToggle";

interface AdminChromeProps {
  /** Só controla a exibição do item "Usuários". A autorização é do middleware, da página e do RLS. */
  showUsers: boolean;
  children: React.ReactNode;
}

export function AdminChrome({ showUsers, children }: AdminChromeProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10 bg-mitram-grayLight" />
      <Container as="main" className="flex-1 py-8">
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4 text-mitram-grayDark">
          <div className="flex flex-wrap items-center gap-4">
            <ImoveisSectionToggle showUsers={showUsers} />
            {pathname === "/admin/imoveis" && (
              <Link href="/admin/imoveis/novo" className={buttonClasses("primary", "sm")}>
                <Plus size={18} aria-hidden="true" />
                Novo imóvel
              </Link>
            )}
          </div>
          <LogoutButton />
        </div>
        {children}
      </Container>
    </div>
  );
}
