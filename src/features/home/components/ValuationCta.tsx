import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { CHECKBOX_CLASSES, FormField, fieldClasses } from "@/components/ui/FormField";
import { SectionEyebrow } from "./SectionEyebrow";

export function ValuationCta() {
  return (
    <section id="avaliacao" className="py-16 md:py-24 relative overflow-hidden bg-mitram-grayLight">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          
          {/* Left Side: Image Grid */}
          <div className="flex-1 w-full">
            <div className="relative w-full">
              
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {/* Top wide image */}
                <div className="col-span-3 relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg">
                  <Image 
                    src="/images/aerial-view-curitiba.jpg" 
                    fill 
                    className="object-cover" 
                    alt="Avaliação Mitram - Vista" 
                  />
                </div>
                
                {/* Bottom left image (~1/3) */}
                <div className="col-span-1 relative h-40 md:h-52 rounded-3xl overflow-hidden shadow-lg">
                  <Image 
                    src="/images/keys-on-table.jpg" 
                    fill 
                    className="object-cover" 
                    alt="Avaliação Mitram - Chaves" 
                  />
                </div>
                
                {/* Bottom right image (~2/3, taller) */}
                <div className="col-span-2 relative h-56 md:h-72 rounded-3xl overflow-hidden shadow-lg">
                  <Image 
                    src="/images/hero-image.jpg" 
                    fill 
                    className="object-cover" 
                    alt="Avaliação Mitram - Interior" 
                  />
                </div>
              </div>
              
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
          <div className="flex-1 w-full space-y-10">
            <div className="space-y-6">
              <SectionEyebrow>Avaliação Gratuita</SectionEyebrow>
              
              <h2 className="text-2xl md:text-4xl font-bold text-mitram-dark leading-tight">
                Venda sua casa ou terreno <br className="hidden lg:block"/>
                com a Mitram
              </h2>
              
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg">
                Nossos especialistas preparam uma análise de mercado precisa para o seu patrimônio. <strong>É rápido, seguro e sem compromisso.</strong>
              </p>
            </div>


            {/* Form Integrated */}
            <div className="max-w-lg pt-6">
              <form className="space-y-5">
                <FormField label="Nome completo">
                  <input type="text" id="name" placeholder=" " required className={fieldClasses()} />
                </FormField>

                <FormField label="WhatsApp ou Telefone">
                  <input type="tel" id="phone" placeholder=" " required className={fieldClasses()} />
                </FormField>

                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="lgpd-home" required className={`mt-0.5 ${CHECKBOX_CLASSES}`} />
                  <label htmlFor="lgpd-home" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                    Concordo que a Mitram utilize meus dados para entrar em contato referente a esta solicitação.
                  </label>
                </div>

                <button type="submit" className={buttonClasses("primary", "lg", "w-full")}>
                  Quero minha avaliação
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
