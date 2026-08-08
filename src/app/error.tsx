"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-xl md:text-2xl font-bold text-mitram-dark mb-4">Algo deu errado</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Desculpe, ocorreu um erro inesperado ao carregar esta página.
      </p>
      <div className="flex gap-4">
        <button onClick={() => reset()} className={buttonClasses("secondary", "md")}>
          <RotateCcw size={18} />
          Tentar novamente
        </button>
        <Link href="/" className={buttonClasses("gold", "md")}>
          <Home size={18} />
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
