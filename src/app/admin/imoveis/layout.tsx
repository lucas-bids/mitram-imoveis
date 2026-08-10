"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { LogoutButton } from "@/features/admin/components/LogoutButton";
import { ImoveisSectionToggle } from "@/features/admin/components/ImoveisSectionToggle";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed inset-0 -z-10 bg-mitram-grayLight" />
      <Container as="main" className="flex-1 py-8">
        <div className="mb-6 flex justify-between items-center text-mitram-grayDark">
          <div className="flex items-center gap-4">
            <ImoveisSectionToggle />
            {pathname === "/admin/imoveis" && (
              <Link href="/admin/imoveis/novo" className={buttonClasses("primary", "sm")}>
                <Plus size={18} />
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
