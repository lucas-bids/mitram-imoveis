import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-bold text-mitram-dark mb-4">Página não encontrada</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/" className="px-6 py-3 bg-mitram-gold text-mitram-dark font-medium rounded hover:bg-yellow-500 transition-colors">
        Voltar para a página inicial
      </Link>
    </div>
  );
}
