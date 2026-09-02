import type { Metadata } from "next";
import { Phone, Mail, Instagram, MapPin } from "lucide-react";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { SITE } from "@/lib/site";

const TITLE = "Contato";
const DESCRIPTION =
  `Fale com a ${SITE.name}: WhatsApp, telefone e e-mail para comprar, alugar ou anunciar um imóvel em ${SITE.address.locality} e região.`;

export const metadata: Metadata = {
  // Sem sufixo manual: o template do layout raiz acrescenta "| Mitram Imóveis".
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contato" },
  openGraph: { url: "/contato", title: TITLE, description: DESCRIPTION },
};

export default function ContactPage() {
  return (
    <div className="bg-mitram-white min-h-screen py-6 md:py-16 px-0 md:px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl md:bg-white md:rounded-[2.5rem] overflow-hidden md:border md:border-gray-200 flex flex-col md:flex-row">
        
        {/* Left Side: Contact Info */}
        <div className="w-full md:w-2/5 px-4 py-4 md:p-16 flex flex-col justify-between md:bg-white relative mb-6 md:mb-0">
          <div>
            <div className="space-y-6 md:space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Phone size={20} className="text-gray-400" />
                  <Heading as="h3" variant="h4">WhatsApp / Telefone</Heading>
                </div>
                <Text variant="bodySm" className="mb-1 ml-8">Nossa equipe está pronta para ajudar.</Text>
                <a
                  href={`tel:${SITE.phone.e164}`}
                  className="text-mitram-dark font-semibold ml-8 block hover:text-mitram-gold transition-colors"
                >
                  {SITE.phone.display}
                </a>
                <Text variant="caption" className="mt-1 ml-8">{SITE.openingHours.display}.</Text>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Mail size={20} className="text-gray-400" />
                  <Heading as="h3" variant="h4">E-mail</Heading>
                </div>
                <Text variant="bodySm" className="mb-1 ml-8">Envie-nos um e-mail para propostas e parcerias.</Text>
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-mitram-dark font-semibold ml-8 block break-all hover:text-mitram-gold transition-colors"
                >
                  {SITE.email}
                </a>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={20} className="text-gray-400" />
                  <Heading as="h3" variant="h4">Endereço</Heading>
                </div>
                <Text variant="bodySm" className="mb-1 ml-8">Nosso escritório em {SITE.address.locality}.</Text>
                {/* `not-italic` porque o browser italiciza <address> por padrão. */}
                <address className="text-mitram-dark font-semibold ml-8 not-italic leading-relaxed">
                  {SITE.address.street}
                  <br />
                  {SITE.address.locality}, {SITE.address.region} — CEP {SITE.address.postalCode}
                </address>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Instagram size={20} className="text-gray-400" />
                  <Heading as="h3" variant="h4">Instagram</Heading>
                </div>
                <Text variant="bodySm" className="mb-1 ml-8">Acompanhe nossos imóveis e novidades.</Text>
                <a
                  href={SITE.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mitram-dark font-semibold ml-8 hover:text-mitram-gold transition-colors"
                >
                  {SITE.social.instagramHandle}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-3/5 bg-white md:bg-mitram-grayLight px-4 py-6 md:p-16 rounded-none md:rounded-l-none md:rounded-r-[2.5rem]">
          <Heading variant="h2" className="mb-3 md:mb-4">
            Tem alguma dúvida?<br/>Vamos conversar.
          </Heading>
          <Text variant="lead" className="mb-6 md:mb-10">
            Conte-nos um pouco sobre você e o que está buscando.
          </Text>
          
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
