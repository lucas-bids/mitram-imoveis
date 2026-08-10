"use client";

import { useState } from "react";
import { MessageCircle, Phone, Send } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { CHECKBOX_CLASSES, FormField, fieldClasses } from "@/components/ui/FormField";
import { Text } from "@/components/ui/Text";
import { useContactFormSubmit } from "@/features/contact/hooks";
import { CONTACT_PREFERENCE_LABELS, ContactPreference } from "@/features/contact/types";

const PREFERENCE_ICONS: Record<ContactPreference, typeof Phone> = {
  whatsapp: MessageCircle,
  call: Phone,
};

const PREFERENCE_ORDER: ContactPreference[] = ["whatsapp", "call"];

interface CallbackFormProps {
  propertyTitle: string;
  propertyUrl: string;
}

/** Captura de lead do imóvel: o corretor liga ou manda WhatsApp, o usuário só deixa os dados. */
export default function CallbackForm({ propertyTitle, propertyUrl }: CallbackFormProps) {
  const { loading, success, error, handleSubmit, setSuccess } = useContactFormSubmit("callback");
  const [preference, setPreference] = useState<ContactPreference>("whatsapp");

  if (success) {
    return (
      <div className="bg-mitram-successLight text-mitram-success p-4 rounded-lg text-center">
        <p className="font-semibold">Recebemos seu contato!</p>
        <p className="text-sm mt-2">
          Em breve um consultor da Mitram fala com você por {CONTACT_PREFERENCE_LABELS[preference]}.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-mitram-dark underline"
        >
          Enviar outro contato
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-mitram-error text-sm">{error}</div>}

      {/* Honeypot field for basic spam protection */}
      <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="propertyTitle" value={propertyTitle} />
      <input type="hidden" name="propertyUrl" value={propertyUrl} />
      <input type="hidden" name="contactPreference" value={preference} />

      <FormField label="Seu nome *">
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder=" "
          className={fieldClasses()}
        />
      </FormField>

      <FormField label="Seu telefone *">
        <input
          type="tel"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder=" "
          className={fieldClasses()}
        />
      </FormField>

      <div>
        <Text variant="label" as="p" className="mb-2">
          Como prefere que a gente fale com você?
        </Text>
        <div className={cardClasses("flex rounded-full bg-white p-1.5")} role="group">
          {PREFERENCE_ORDER.map((value) => {
            const Icon = PREFERENCE_ICONS[value];
            const isActive = preference === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPreference(value)}
                aria-pressed={isActive}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition-colors ${
                  isActive ? "bg-mitram-gold text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                {CONTACT_PREFERENCE_LABELS[value]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id="lgpd-callback" name="consent" required className={`mt-0.5 ${CHECKBOX_CLASSES}`} />
        <Text as="label" variant="caption" htmlFor="lgpd-callback" className="leading-tight">
          Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação.
        </Text>
      </div>

      <button type="submit" disabled={loading} className={buttonClasses("primary", "md", "mt-2 w-full")}>
        <Send size={18} />
        {loading ? "Enviando..." : "Quero ser contatado"}
      </button>
    </form>
  );
}
