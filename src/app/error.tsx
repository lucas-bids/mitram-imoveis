"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

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
      <Heading as="h2" variant="h3" className="mb-4">Algo deu errado</Heading>
      <Text variant="body" className="mb-8 max-w-md">
        Desculpe, ocorreu um erro inesperado ao carregar esta página.
      </Text>
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
