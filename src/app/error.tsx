"use client";

import { useEffect } from "react";
import Link from "next/link";

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
      <h2 className="text-3xl font-bold text-mitram-dark mb-4">Algo deu errado</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Desculpe, ocorreu um erro inesperado ao carregar esta página.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 border border-mitram-dark text-mitram-dark font-medium rounded hover:bg-gray-50 transition-colors"
        >
          Tentar novamente
        </button>
        <Link href="/" className="px-6 py-2 bg-mitram-gold text-mitram-dark font-medium rounded hover:bg-yellow-500 transition-colors">
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
