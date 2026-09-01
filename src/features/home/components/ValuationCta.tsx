import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ContactPreferenceForm } from "@/features/contact/components/ContactPreferenceForm";
import { NETLIFY_FORMS } from "@/features/contact/netlify";
import { ImageGrid, ImageGridItem } from "./ImageGrid";
import { SectionEyebrow } from "./SectionEyebrow";

export function ValuationCta() {
  return (
    <section id="avaliacao" className="py-10 md:py-24 relative overflow-hidden bg-mitram-grayLight">
      <Container className="relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16">
          
          {/* Left Side: Image Grid */}
          <div className="flex-1 w-full">
            <div className="relative w-full">

              <ImageGrid>
                {/* Top wide image */}
                <ImageGridItem
                  src="/images/aerial-view-curitiba.jpg"
                  alt="Avaliação Mitram - Vista"
                  className="col-span-3 h-40 md:h-64"
                />

                {/* Bottom left image (~1/3) */}
                <ImageGridItem
                  src="/images/keys-on-table.jpg"
                  alt="Avaliação Mitram - Chaves"
                  className="col-span-1 h-32 md:h-52"
                />

                {/* Bottom right image (~2/3, taller) */}
                <ImageGridItem
                  src="/images/hero-image.jpg"
                  alt="Avaliação Mitram - Interior"
                  className="col-span-2 h-44 md:h-72"
                />
              </ImageGrid>

              {/* Center Badge */}
              <div className="absolute top-1/2 left-[30%] -translate-x-[30%] -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 bg-mitram-gold rounded-full flex items-center justify-center text-white shadow-2xl z-20">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <path id="badgePath" d="M 50, 12 A 38,38 0 1,1 49.9,12" fill="none" />
                    <text fill="currentColor" className="text-[10.5px] font-bold uppercase tracking-[0.24em]">
                      <textPath href="#badgePath" startOffset="0%">• AVALIAÇÃO GRATUITA MITRAM</textPath>
                    </text>
                  </svg>
                </div>
                {/* Inner Icon */}
                <div className="relative z-10 text-white transform -rotate-45">
                  <ArrowRight size={24} strokeWidth={3} />
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Text & Form */}
          <div className="flex-1 w-full space-y-6 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
              <SectionEyebrow>Avaliação Gratuita</SectionEyebrow>

              <Heading variant="h2">
                Venda sua casa ou terreno <br className="hidden lg:block"/>
                com a Mitram
              </Heading>

              <Text variant="lead" className="max-w-lg">
                Nossos especialistas preparam uma análise de mercado precisa para o seu patrimônio. <strong>É rápido, seguro e sem compromisso.</strong>
              </Text>
            </div>


            {/* Form Integrated */}
            <div className="max-w-lg pt-2 md:pt-6">
              <ContactPreferenceForm formName={NETLIFY_FORMS.sellLand} submitLabel="Quero minha avaliação" />
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
