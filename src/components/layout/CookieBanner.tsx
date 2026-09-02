"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Cookie } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Container } from "@/components/ui/Container";

const CONSENT_KEY = "mitram_cookie_consent";

/**
 * Aviso informativo — não é um banner de consentimento.
 *
 * O site usa apenas cookies e armazenamento local essenciais: não há analytics,
 * nem pixel, nem cookie de publicidade. A versão anterior oferecia "Aceitar
 * todos" para "cookies opcionais para análises" que não existem, e a escolha
 * gravada aqui não era lida por nenhum outro módulo — ou seja, o botão não
 * fazia nada. Um aviso factual com um botão neutro é a implementação honesta
 * para o estado atual.
 *
 * Quando alguma ferramenta opcional entrar, este componente volta a ter duas
 * ações de peso visual igual, a preferência passa a ser lida por um provider
 * que só monta o script mediante consentimento, e o rodapé ganha um link
 * permanente para reabrir a escolha.
 *
 * O valor "essential" é mantido para que quem já dispensou o aviso antes não o
 * veja de novo.
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setIsVisible(true);
    } catch {
      // Navegador com armazenamento bloqueado: não insistir com o aviso.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "essential");
    } catch {
      // Ignorado de propósito: fechar o aviso não pode falhar por isso.
    }
    setIsVisible(false);
  };

  if (!isVisible || pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6">
      <Container padding="none" className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700 max-w-3xl">
          <p className="font-semibold mb-1 flex items-center gap-2 text-mitram-dark">
            <Cookie size={16} aria-hidden="true" />
            Utilizamos cookies
          </p>
          Usamos apenas cookies essenciais ao funcionamento do site — não há ferramentas de
          análise nem de publicidade. Saiba mais na{" "}
          <Link href="/politica-de-privacidade" className="underline hover:text-mitram-dark">
            Política de Privacidade
          </Link>
          .
        </div>
        <div className="flex w-full md:w-auto">
          <button
            onClick={dismiss}
            className={buttonClasses("primary", "sm", "flex-1 md:flex-none whitespace-nowrap")}
          >
            <Check size={16} />
            Entendi
          </button>
        </div>
      </Container>
    </div>
  );
}
