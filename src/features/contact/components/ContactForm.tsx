"use client";

import { Send } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { CHECKBOX_CLASSES, FormField, fieldClasses } from "@/components/ui/FormField";
import { useContactFormSubmit, useAutoResizeTextarea } from "@/features/contact/hooks";

export function ContactForm() {
  const { loading, success, error, handleSubmit, setSuccess } = useContactFormSubmit("contact");
  const handleResize = useAutoResizeTextarea();

  if (success) {
    return (
      <div className="bg-white p-6 md:p-10 rounded-3xl text-center shadow-sm border border-gray-100 mt-4 md:mt-8">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-mitram-dark mb-3">Mensagem enviada!</h3>
        <p className="text-gray-600 mb-6 md:mb-8">Obrigado pelo seu contato. Retornaremos em breve.</p>
        <button onClick={() => setSuccess(false)} className={buttonClasses("primary", "md")}>
          <Send size={18} />
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {error && <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}
      
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
        <input type="checkbox" id="lgpd-contact" required className={`mt-0.5 ${CHECKBOX_CLASSES}`} />
        <label htmlFor="lgpd-contact" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
          Concordo que a Mitram Imóveis armazene e processe meus dados pessoais de acordo com a LGPD (Lei Geral de Proteção de Dados), 
          exclusivamente para fins de atendimento e envio de informações relacionadas ao mercado imobiliário.
        </label>
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
