"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-mitram-grayLight flex flex-col">
      <header className="bg-mitram-dark text-mitram-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/admin/imoveis">
              <Image
                src="/images/mitram-full-branco.png"
                alt="Mitram Imóveis"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/admin/imoveis"
                className="text-sm hover:text-mitram-gold transition-colors font-medium"
              >
                Imóveis
              </Link>
              <Link
                href="/admin/imoveis/lixeira"
                className="text-sm hover:text-mitram-gold transition-colors"
              >
                Lixeira
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:text-mitram-gold transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
