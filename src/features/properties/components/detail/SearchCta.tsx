import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";

export function SearchCta() {
  return (
    <section className="mt-10 mb-6 md:mt-20 md:mb-8">
      <div className="relative w-full rounded-[2.5rem] overflow-hidden">
        <Image 
          src="/images/bicicleta-parque.jpg" 
          alt="Encontre o Imóvel Perfeito" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-mitram-dark/50 z-10" />
        
        <div className="relative z-20 flex flex-col items-center justify-center px-4 py-14 md:py-32 text-center">
          <h2 className="text-xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            Encontre o Imóvel Perfeito com a Mitram
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mb-6 md:mb-8">
            Procurando a casa dos seus sonhos? A Mitram torna a busca por imóveis fácil e sem estresse! Com nossa plataforma amigável e corretores especialistas.
          </p>
          <Link href="/imoveis" className={buttonClasses("inverse", "lg")}>
            <Search size={18} />
            Comece sua Busca
          </Link>
        </div>
      </div>
    </section>
  );
}
