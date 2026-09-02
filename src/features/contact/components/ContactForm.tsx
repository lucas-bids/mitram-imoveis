"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { CHECKBOX_CLASSES, FormField, fieldClasses } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { useContactFormSubmit, useAutoResizeTextarea } from "@/features/contact/hooks";
import { NETLIFY_FORMS } from "@/features/contact/netlify";

export function ContactForm() {
  const { loading, success, error, handleSubmit, setSuccess } = useContactFormSubmit(NETLIFY_FORMS.contact);
  const handleResize = useAutoResizeTextarea();

  if (success) {
    return (
      <div className={cardClasses("bg-white p-6 md:p-10 rounded-3xl text-center mt-4 md:mt-8")}>
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <Heading as="h3" variant="h3" className="mb-3">Mensagem enviada!</Heading>
        <Text variant="body" className="mb-6 md:mb-8">Obrigado pelo seu contato. Retornaremos em breve.</Text>
        <button onClick={() => setSuccess(false)} className={buttonClasses("primary", "md")}>
          <Send size={18} />
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      name={NETLIFY_FORMS.contact}
      method="POST"
      data-netlify="true"
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6"
    >
      {error && <AlertMessage tone="error">{error}</AlertMessage>}

      {/* Honeypot: o Netlify descarta como spam qualquer envio que preencha este campo. */}
      <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FormField label="Seu nome">
          <input type="text" name="name" id="name" placeholder=" " required className={fieldClasses()} />
        </FormField>

        <FormField label="E-mail">
          <input type="email" name="email" id="email" placeholder=" " required className={fieldClasses()} />
        </FormField>
      </div>

      <FormField label="WhatsApp ou Telefone">
        <input type="tel" name="phone" id="phone" placeholder=" " required className={fieldClasses()} />
      </FormField>

      <FormField label="Sua mensagem">
        <textarea 
          name="message" 
          id="message" 
          rows={3} 
          placeholder=" " 
          required 
          className={`${fieldClasses()} resize-none overflow-hidden transition-all duration-200 min-h-[5rem]`}
          onChange={handleResize}
        />
      </FormField>

      <div className="flex items-start gap-3 pt-1 md:pt-2">
        <input type="checkbox" id="lgpd-contact" name="consent" value="sim" required className={`mt-0.5 ${CHECKBOX_CLASSES}`} />
        {/* O link fica fora do <label>: dentro dele, clicar em "Política de
            Privacidade" também marcaria o checkbox. */}
        <Text variant="caption" className="leading-relaxed">
          <label htmlFor="lgpd-contact" className="cursor-pointer select-none">
            Concordo que a Mitram Imóveis utilize meus dados pessoais para responder a esta
            solicitação, conforme a
          </label>{" "}
          <Link href="/politica-de-privacidade" className="underline hover:text-mitram-dark">
            Política de Privacidade
          </Link>
          .
        </Text>
      </div>

      <div className="pt-2 md:pt-4">
        <button type="submit" disabled={loading} className={buttonClasses("primary", "lg", "w-full")}>
          <Send size={18} />
          {loading ? "Enviando..." : "Enviar Mensagem"}
        </button>
      </div>
    </form>
  );
}
