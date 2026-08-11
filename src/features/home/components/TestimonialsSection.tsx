import TestimonialsCarousel from "@/features/home/components/TestimonialsCarousel";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";
import { TESTIMONIALS } from "../content";
import { SectionEyebrow } from "./SectionEyebrow";

export function TestimonialsSection() {
  return (
    <section className="bg-white py-10 md:py-24">
      <Container>
        <div className="max-w-3xl mb-6 md:mb-12 space-y-4 md:space-y-6">
          <SectionEyebrow>Depoimentos</SectionEyebrow>
          <Heading variant="h2">O que nossos clientes dizem</Heading>
          <Text variant="lead" className="max-w-2xl">
            Veja as histórias reais de quem confiou na Mitram para encontrar o lar perfeito ou realizar um excelente negócio.
          </Text>
        </div>

        <TestimonialsCarousel testimonials={TESTIMONIALS} />
      </Container>
    </section>
  );
}
