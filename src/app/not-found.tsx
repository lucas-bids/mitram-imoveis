import Link from "next/link";
import { Home } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <Heading as="h2" variant="h2" className="mb-4">Página não encontrada</Heading>
      <Text variant="body" className="mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </Text>
      <Link href="/" className={buttonClasses("gold", "md")}>
        <Home size={18} />
        Voltar para a página inicial
      </Link>
    </div>
  );
}
