import Link from "next/link";
import FeaturedPropertiesCarousel from "@/features/properties/components/FeaturedPropertiesCarousel";
import QuickSearch from "@/features/search/components/QuickSearch";
import { ArrowRight } from "lucide-react";
import { PropertyListItem } from "@/features/properties/types";
import { getFeaturedProperties, getFilterLookups } from "@/features/properties/queries";
import { HeroSection } from "@/features/home/components/HeroSection";
import { ValuePropositions } from "@/features/home/components/ValuePropositions";
import { AboutSection } from "@/features/home/components/AboutSection";
import { ValuationCta } from "@/features/home/components/ValuationCta";
import { TestimonialsSection } from "@/features/home/components/TestimonialsSection";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();
  const lookups = await getFilterLookups();

  return (
    <div className="flex flex-col min-h-screen bg-mitram-white">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Search */}
      <div className="relative z-30 -mt-[116px] md:-mt-10 container mx-auto px-4 mb-10 md:mb-20">
        <QuickSearch types={lookups.propertyTypes} cities={lookups.cities} neighborhoods={lookups.neighborhoods} />
      </div>

      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="bg-white pb-12 md:pb-24 pt-8 md:pt-0">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-mitram-dark">Imóveis em Destaque</h2>
                <p className="text-gray-500 mt-2">Confira as melhores opções selecionadas para você</p>
              </div>
              <Link href="/imoveis" className="group flex items-center gap-2 text-mitram-dark font-semibold hover:text-mitram-gold transition-colors">
                Ver Todos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <FeaturedPropertiesCarousel properties={featuredProperties as unknown as PropertyListItem[]} />
          </div>
        </section>
      )}

      {/* Value Propositions */}
      <ValuePropositions />

      {/* Institutional / About */}
      <AboutSection />

      {/* Avaliação CTA */}
      <ValuationCta />

      {/* Testimonials */}
      <TestimonialsSection />

    </div>
  );
}
