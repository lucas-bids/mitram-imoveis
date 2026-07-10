import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-mitram-dark text-mitram-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Image 
            src="/images/mitram-full-ouro-degrade.png" 
            alt="Mitram Imóveis Logo" 
            width={180} 
            height={60} 
            className="h-16 w-auto mb-4"
          />
          <p className="text-sm text-mitram-grayLight mb-4">
            Nossa missão é proporcionar uma experiência única para o cliente, de forma
            com que a complexidade do processo imobiliário se torne descomplicada.
          </p>
          <p className="text-xs text-mitram-grayLight">CRECI J06908</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-mitram-white">Mapa do site</h3>
          <ul className="space-y-2 text-sm text-mitram-grayLight">
            <li><Link href="/" className="hover:text-mitram-gold transition-colors">Início</Link></li>
            <li><Link href="/imoveis" className="hover:text-mitram-gold transition-colors">Imóveis</Link></li>
            <li><Link href="/venda-seu-terreno" className="hover:text-mitram-gold transition-colors">Venda seu terreno</Link></li>
            <li><Link href="/contato" className="hover:text-mitram-gold transition-colors">Contato</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-mitram-white">Contato</h3>
          <ul className="space-y-2 text-sm text-mitram-grayLight">
            <li>Curitiba, PR</li>
            <li>Fone 41 99678-7173</li>
            <li>lucas.vidal.andrade@gmail.com</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
