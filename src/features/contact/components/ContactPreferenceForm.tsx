"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { MessageCircle, Mail, Send } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { cardClasses } from "@/components/ui/cardStyles";
import { CHECKBOX_CLASSES, FormField, fieldClasses } from "@/components/ui/FormField";
import { Text } from "@/components/ui/Text";
import { useContactFormSubmit } from "@/features/contact/hooks";
import { NetlifyFormName } from "@/features/contact/netlify";
import { CONTACT_PREFERENCE_LABELS, ContactPreference } from "@/features/contact/types";

const PREFERENCE_ICONS: Record<ContactPreference, typeof Mail> = {
  whatsapp: MessageCircle,
  email: Mail,
};

const PREFERENCE_ORDER: ContactPreference[] = ["whatsapp", "email"];

interface ContactPreferenceFormProps {
  /** Formulário de destino no Netlify — decide em qual lista o lead cai (ver features/contact/netlify.ts). */
  formName: NetlifyFormName;
  submitLabel: string;
  /** Campos extras enviados sem input visível, ex.: título/URL do imóvel de origem do lead. */
  hiddenFields?: Record<string, string>;
}

/**
 * Formulário de captura de lead com preferência de retorno (WhatsApp ou e-mail).
 *
 * O campo de e-mail só é montado quando essa é a preferência escolhida: pedir
 * e-mail a quem quer resposta por WhatsApp é atrito puro, e um campo vazio
 * enviado ao Netlify só suja a lista. Todo campo enviado daqui precisa existir
 * com o mesmo `name` em `public/__forms.html`, senão o Netlify o descarta em
 * silêncio.
 */
export function ContactPreferenceForm({ formName, submitLabel, hiddenFields }: ContactPreferenceFormProps) {
  const { loading, success, error, handleSubmit, setSuccess } = useContactFormSubmit(formName);
  const [preference, setPreference] = useState<ContactPreference>("whatsapp");
  const lgpdId = useId();

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
    <form name={formName} method="POST" data-netlify="true" onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-mitram-error text-sm">{error}</div>}

      {/* Honeypot: o Netlify descarta como spam qualquer envio que preencha este campo. */}
      <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      {/* Envia o rótulo em pt-BR, e não a chave, para o painel do Netlify ficar legível. */}
      <input type="hidden" name="contactPreference" value={CONTACT_PREFERENCE_LABELS[preference]} />

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

      {preference === "email" && (
        <FormField label="Seu e-mail *">
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder=" "
            className={fieldClasses()}
          />
        </FormField>
      )}

      <div className="flex items-start gap-3 pt-2">
        <input type="checkbox" id={lgpdId} name="consent" value="sim" required className={`mt-0.5 ${CHECKBOX_CLASSES}`} />
        {/* O link fica fora do <label>: dentro dele, clicar em "Política de
            Privacidade" também marcaria o checkbox. */}
        <Text variant="caption" className="leading-tight">
          <label htmlFor={lgpdId} className="cursor-pointer select-none">
            Concordo que a Mitram Imóveis utilize meus dados pessoais para responder a esta
            solicitação, conforme a
          </label>{" "}
          <Link href="/politica-de-privacidade" className="underline hover:text-mitram-dark">
            Política de Privacidade
          </Link>
          .
        </Text>
      </div>

      <button type="submit" disabled={loading} className={buttonClasses("primary", "md", "mt-2 w-full")}>
        <Send size={18} />
        {loading ? "Enviando..." : submitLabel}
      </button>
    </form>
  );
}
