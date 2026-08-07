"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Menu, X } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center relative z-50 bg-transparent">
        <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
          <Image 
            src="/images/mitram-dark.png" 
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
          <Link href="/#avaliacao" className="hover:text-mitram-gold transition-colors">
            Avalie
          </Link>
          <Link href="/contato" className="hover:text-mitram-gold transition-colors">
            Contato
          </Link>
        </nav>
        
        <div className="hidden md:flex">
          <Link href="/contato" className={buttonClasses("primary", "md")}>
            <MessageCircle size={18} />
            Falar com Especialista
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button 
            className="text-mitram-dark p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col space-y-4">
          <Link 
            href="/" 
            className="text-mitram-grayDark font-medium py-2 hover:text-mitram-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link 
            href="/imoveis" 
            className="text-mitram-grayDark font-medium py-2 hover:text-mitram-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Imóveis
          </Link>
          <Link 
            href="/#avaliacao" 
            className="text-mitram-grayDark font-medium py-2 hover:text-mitram-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Avalie
          </Link>
          <Link 
            href="/contato" 
            className="text-mitram-grayDark font-medium py-2 hover:text-mitram-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contato
          </Link>
          <div className="pt-4 border-t border-gray-100">
            <Link 
              href="/contato" 
              className={`${buttonClasses("primary", "md")} w-full justify-center`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageCircle size={18} />
              Falar com Especialista
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
