import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/MITRAM-ouro-degrade.png" 
            alt="Mitram Imóveis Logo" 
            width={140} 
            height={35} 
            className="h-9 w-auto"
          />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-[15px] font-medium text-mitram-grayDark">
          <Link href="/" className="hover:text-mitram-gold transition-colors">
            Início
          </Link>
          <Link href="/imoveis" className="hover:text-mitram-gold transition-colors">
            Imóveis
          </Link>
          <Link href="/venda-seu-terreno" className="hover:text-mitram-gold transition-colors">
            Venda seu terreno
          </Link>
          <Link href="/#avaliacao" className="hover:text-mitram-gold transition-colors">
            Avalie
          </Link>
          <Link href="/contato" className="hover:text-mitram-gold transition-colors">
            Contato
          </Link>
        </nav>
        
        <div className="hidden md:flex">
          <Link 
            href="/contato" 
            className="bg-mitram-dark hover:bg-black text-white px-6 py-2.5 rounded-full text-[15px] font-semibold transition-all shadow-sm hover:shadow-md"
          >
            Falar com Especialista
          </Link>
        </div>

        {/* Mobile menu placeholder */}
        <div className="md:hidden flex items-center">
          <button className="text-mitram-dark p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
