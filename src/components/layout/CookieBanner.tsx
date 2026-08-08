"use client";

import { useState, useEffect } from "react";
import { Check, Cookie } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Container } from "@/components/ui/Container";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("mitram_cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("mitram_cookie_consent", "all");
    setIsVisible(false);
    // Future: Enable Analytics here
  };

  const acceptEssential = () => {
    localStorage.setItem("mitram_cookie_consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6">
      <Container padding="none" className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 max-w-3xl">
          <p className="font-semibold mb-1 text-mitram-dark">Utilizamos cookies</p>
          Utilizamos cookies essenciais para o funcionamento do site e, com o seu consentimento, 
          cookies opcionais para análises e melhorias. Você pode escolher quais cookies deseja permitir.
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={acceptEssential}
            className={buttonClasses("secondary", "sm", "flex-1 md:flex-none whitespace-nowrap")}
          >
            <Cookie size={16} />
            Apenas Essenciais
          </button>
          <button
            onClick={acceptAll}
            className={buttonClasses("primary", "sm", "flex-1 md:flex-none whitespace-nowrap")}
          >
            <Check size={16} />
            Aceitar Todos
          </button>
        </div>
      </Container>
    </div>
  );
}
