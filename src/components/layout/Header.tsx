"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Menu, X } from "lucide-react";
import { buttonShapeClasses } from "@/components/ui/buttonStyles";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5541996787173";
const whatsappMessage = encodeURIComponent("Olá, gostaria de falar com um corretor da Mitram Imóveis.");
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

const brokerButtonClasses = buttonShapeClasses("md", "bg-[#25D366] text-white shadow-md hover:bg-[#128C7E]");

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 pt-4">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="flex justify-between items-center rounded-full border border-gray-100 bg-white/80 backdrop-blur-md px-4 py-3 md:px-6 md:py-4">
            <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <Image 
                src="/images/mitram-dark.png" 
                alt="Mitram Imóveis Logo" 
                width={140} 
                height={35} 
                className="h-[31px] w-auto md:h-9"
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
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={brokerButtonClasses}
              >
                <MessageCircle size={18} />
                Fale com um corretor
              </a>
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
            <div className="md:hidden absolute top-full inset-x-0 mt-2 rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-md shadow-lg py-4 px-6 flex flex-col space-y-4">
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
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${brokerButtonClasses} w-full`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MessageCircle size={18} />
                  Fale com um corretor
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
