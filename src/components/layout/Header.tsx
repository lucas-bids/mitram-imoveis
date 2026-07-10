import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <Image 
            src="/images/MITRAM-ouro.png" 
            alt="Mitram Imóveis Logo" 
            width={150} 
            height={40} 
            className="h-10 w-auto"
          />
        </Link>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-mitram-grayDark">
          <Link href="/imoveis" className="hover:text-mitram-gold transition-colors">
            Imóveis
          </Link>
          <Link href="/#avaliacao" className="hover:text-mitram-gold transition-colors">
            Avalie
          </Link>
          <Link href="/venda-seu-terreno" className="hover:text-mitram-gold transition-colors">
            Venda seu terreno
          </Link>
          <Link href="/contato" className="hover:text-mitram-gold transition-colors">
            Contato
          </Link>
        </nav>
        
        {/* Mobile menu placeholder */}
        <div className="md:hidden">
          <button className="text-mitram-grayDark">Menu</button>
        </div>
      </div>
    </header>
  );
}
