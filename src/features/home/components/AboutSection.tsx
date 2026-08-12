import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { ImageGrid, ImageGridItem } from "./ImageGrid";
import { SectionEyebrow } from "./SectionEyebrow";

export function AboutSection() {
  return (
    <Container as="section" className="mb-10 md:mb-24">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        <div className="flex-1 space-y-6 md:space-y-8">
          <div>
            <SectionEyebrow>POR QUE ESCOLHER A MITRAM</SectionEyebrow>
            <Heading variant="h2">
              Onde seus planos <br /> encontram espaço.
            </Heading>
          </div>
          <Text variant="lead">
            Seja para construir uma nova fase em família ou investir no futuro, escolher um imóvel exige confiança. Por isso, ouvimos seus planos e ajudamos você a decidir com clareza e segurança.
          </Text>
          
          <ul className="space-y-3 md:space-y-4">
            {[
              "Ampla variedade de opções premium",
              "Condições flexíveis e processos transparentes",
              "Recomendações personalizadas para você",
              "Confiado por centenas de clientes felizes"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="bg-mitram-gold/20 p-1 rounded-full">
                  <CheckCircle2 size={18} className="text-mitram-gold" />
                </div>
                <span className="text-mitram-dark font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 md:pt-4">
            <Link href="/contato" className={buttonClasses("primary", "lg")}>
              Saiba Mais
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        
        <div className="flex-1 w-full">
          <ImageGrid className="grid-rows-2 h-[360px] md:h-[600px]">
            {/* Tall image */}
            <ImageGridItem
              src="/images/team/time-02.png"
              alt="Equipe Mitram com clientes em novo imóvel"
              className="col-span-2 row-span-2"
            />

            {/* Stacked image top */}
            <ImageGridItem
              src="/images/team/time-01.png"
              alt="Consultores Mitram acompanhando clientes"
              className="col-span-1"
            />

            {/* Stacked image bottom */}
            <ImageGridItem
              src="/images/team/time03.png"
              alt="Equipe Mitram entregando as chaves aos clientes"
              className="col-span-1"
            />
          </ImageGrid>
        </div>
      </div>
    </Container>
  );
}
