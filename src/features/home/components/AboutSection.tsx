import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
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
          <div className="relative h-[360px] md:h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl">
            <Image 
              src="/images/garden-garage-entrance.png" 
              alt="Interior Moderno" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
