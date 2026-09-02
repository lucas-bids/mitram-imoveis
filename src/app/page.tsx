import type { Metadata } from "next";
import Link from "next/link";
import FeaturedPropertiesCarousel from "@/features/properties/components/FeaturedPropertiesCarousel";
import QuickSearch from "@/features/search/components/QuickSearch";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { PropertyListItem } from "@/features/properties/types";
import { getFeaturedProperties, getFilterLookups } from "@/features/properties/queries";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ValuePropositions } from "@/features/home/components/ValuePropositions";
import { AboutSection } from "@/features/home/components/AboutSection";
import { ValuationCta } from "@/features/home/components/ValuationCta";
import { TestimonialsSection } from "@/features/home/components/TestimonialsSection";

// Sem `title` aqui de propósito: omiti-lo faz valer o `title.default` da raiz,
// evitando tanto o sufixo de marca duplicado quanto um "Início | Mitram Imóveis"
// redundante.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();
  const lookups = await getFilterLookups();

  return (
    <div className="flex flex-col min-h-screen bg-mitram-white">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Search */}
      <Container className="relative z-30 -mt-[100px] md:-mt-10 mb-8 md:mb-20">
        <QuickSearch types={lookups.propertyTypes} cities={lookups.cities} neighborhoods={lookups.neighborhoods} />
      </Container>

      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="bg-white pb-10 md:pb-24 pt-4 md:pt-0">
          <Container>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-10 gap-4">
              <div>
                <Heading variant="h2">Imóveis em Destaque</Heading>
              </div>
              <Link href="/imoveis" className="group hidden md:flex items-center gap-2 text-mitram-dark font-semibold hover:text-mitram-gold transition-colors">
                Ver Todos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <FeaturedPropertiesCarousel properties={featuredProperties as unknown as PropertyListItem[]} />

            <Link href="/imoveis" className="group mt-4 flex md:hidden items-center justify-center gap-2 text-mitram-dark font-semibold hover:text-mitram-gold transition-colors">
              Ver Todos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Container>
        </section>
      )}

      {/* Value Propositions */}
      <ValuePropositions />

      {/* Institutional / About */}
      <AboutSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Avaliação CTA */}
      <ValuationCta />

    </div>
  );
}
