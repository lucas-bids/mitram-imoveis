import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { SITE } from "@/lib/site";

const linkClasses = "hover:text-mitram-goldLight hover:translate-x-1 inline-block transition-all";
const contactIconClasses =
  "w-8 h-8 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-mitram-gold";

export default function Footer() {
  return (
    <footer className="bg-mitram-dark text-mitram-white pt-12 md:pt-20 pb-8 mt-auto rounded-t-[2.5rem]">
      <Container padding="loose" className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
        <div className="md:col-span-2">
          <Image
            src={SITE.logo.path}
            alt={`${SITE.name} Logo`}
            width={180}
            height={60}
            className="h-16 w-auto mb-4 md:mb-6"
          />
          <p className="text-[15px] text-gray-400 mb-4 md:mb-6 max-w-sm leading-relaxed">
            Nossa missão é proporcionar uma experiência única para o cliente, de forma
            com que a complexidade do processo imobiliário se torne descomplicada.
          </p>
          <div className="inline-block px-4 py-2 bg-white/5 rounded-full text-sm text-mitram-goldLight border border-white/10">
            CRECI {SITE.creci}
          </div>
        </div>

        <div>
          <Heading as="h3" variant="h4" tone="light" className="mb-4 md:mb-6 tracking-wide">Acesso Rápido</Heading>
          <ul className="space-y-3 md:space-y-4 text-[15px] text-gray-400">
            <li><Link href="/" className={linkClasses}>Início</Link></li>
            <li><Link href="/imoveis" className={linkClasses}>Imóveis</Link></li>
            <li><Link href="/contato" className={linkClasses}>Contato</Link></li>
            <li><Link href="/politica-de-privacidade" className={linkClasses}>Política de Privacidade</Link></li>
          </ul>
        </div>

        <div>
          <Heading as="h3" variant="h4" tone="light" className="mb-4 md:mb-6 tracking-wide">Fale Conosco</Heading>
          <ul className="space-y-3 md:space-y-4 text-[15px] text-gray-400">
            <li className="flex items-start gap-3">
              <span className={contactIconClasses} aria-hidden="true">📍</span>
              {/* `not-italic` porque o browser italiciza <address> por padrão. */}
              <address className="not-italic leading-relaxed">
                {SITE.address.street}
                <br />
                {SITE.address.locality}, {SITE.address.region} — CEP {SITE.address.postalCode}
              </address>
            </li>
            <li className="flex items-center gap-3">
              <span className={contactIconClasses} aria-hidden="true">📞</span>
              <a href={`tel:${SITE.phone.e164}`} className="hover:text-mitram-goldLight transition-colors">
                {SITE.phone.display}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className={contactIconClasses} aria-hidden="true">✉️</span>
              <a href={`mailto:${SITE.email}`} className="hover:text-mitram-goldLight transition-colors break-all">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className={contactIconClasses} aria-hidden="true">📷</span>
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mitram-goldLight transition-colors"
              >
                {SITE.social.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container padding="loose" className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <Text variant="bodySm">
          © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
        </Text>
        <Link
          href="/admin/login"
          className="text-xs px-4 py-2 rounded-full bg-white/5 text-gray-400 hover:text-mitram-goldLight hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
        >
          Área do Corretor
        </Link>
      </Container>
    </footer>
  );
}
