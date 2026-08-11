"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { reportClientError } from "@/lib/logger";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError("admin-error-boundary", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <Heading as="h2" variant="h3" className="mb-4">Erro no painel administrativo</Heading>
      <Text variant="body" className="mb-8 max-w-md">
        Ocorreu um erro inesperado.
        {error.digest && ` Código: ${error.digest}`}
      </Text>
      <div className="flex gap-4">
        <button onClick={() => reset()} className={buttonClasses("secondary", "md")}>
          <RotateCcw size={18} />
          Tentar novamente
        </button>
        <Link href="/admin/imoveis" className={buttonClasses("gold", "md")}>
          <LayoutDashboard size={18} />
          Voltar ao painel
        </Link>
      </div>
    </div>
  );
}
