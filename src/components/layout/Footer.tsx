import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-mitram-dark text-mitram-white pt-20 pb-8 mt-auto rounded-t-[2.5rem]">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-2">
          <Image 
            src="/images/mitram-full-ouro-degrade.png" 
            alt="Mitram Imóveis Logo" 
            width={180} 
            height={60} 
            className="h-16 w-auto mb-6"
          />
          <p className="text-[15px] text-gray-400 mb-6 max-w-sm leading-relaxed">
            Nossa missão é proporcionar uma experiência única para o cliente, de forma
            com que a complexidade do processo imobiliário se torne descomplicada.
          </p>
          <div className="inline-block px-4 py-2 bg-white/5 rounded-full text-sm text-mitram-goldLight border border-white/10">
            CRECI J06908
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">Acesso Rápido</h3>
          <ul className="space-y-4 text-[15px] text-gray-400">
            <li><Link href="/" className="hover:text-mitram-goldLight hover:translate-x-1 inline-block transition-all">Início</Link></li>
            <li><Link href="/imoveis" className="hover:text-mitram-goldLight hover:translate-x-1 inline-block transition-all">Imóveis</Link></li>
            <li><Link href="/contato" className="hover:text-mitram-goldLight hover:translate-x-1 inline-block transition-all">Contato</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">Fale Conosco</h3>
          <ul className="space-y-4 text-[15px] text-gray-400">
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-mitram-gold">📍</span>
              Curitiba, PR
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-mitram-gold">📞</span>
              41 99678-7173
            </li>
            <li className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-mitram-gold">✉️</span>
              contato@mitram.com
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Mitram Imóveis. Todos os direitos reservados.
        </p>
        <Link
          href="/admin/login"
          className="text-xs px-4 py-2 rounded-full bg-white/5 text-gray-400 hover:text-mitram-goldLight hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        >
          Área do Corretor
        </Link>
      </div>
    </footer>
  );
}
