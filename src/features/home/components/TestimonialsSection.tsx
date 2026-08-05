import TestimonialsCarousel from "@/features/home/components/TestimonialsCarousel";
import { TESTIMONIALS } from "../content";
import { SectionEyebrow } from "./SectionEyebrow";

export function TestimonialsSection() {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="max-w-3xl mb-12 space-y-6">
        <SectionEyebrow>Depoimentos</SectionEyebrow>
        <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark leading-tight">O que nossos clientes dizem</h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl">
          Veja as histórias reais de quem confiou na Mitram para encontrar o lar perfeito ou realizar um excelente negócio.
        </p>
      </div>

      <TestimonialsCarousel testimonials={TESTIMONIALS} />
    </section>
  );
}
