import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LogoutButton } from "@/features/admin/components/LogoutButton";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-mitram-grayLight flex flex-col">
      <header className="sticky top-20 z-40 bg-mitram-dark text-mitram-white shadow-md">
        <Container className="py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
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
            <LogoutButton />
          </div>
        </Container>
      </header>

      <Container as="main" className="flex-1 py-8">{children}</Container>
    </div>
  );
}
