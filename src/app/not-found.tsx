import Link from "next/link";
import { Home } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-mitram-dark mb-4">Página não encontrada</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/" className={buttonClasses("gold", "md")}>
        <Home size={18} />
        Voltar para a página inicial
      </Link>
    </div>
  );
}
