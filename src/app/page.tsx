import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PropertyCard from "@/components/properties/PropertyCard";
import QuickSearch from "@/components/public/QuickSearch";
import { PROPERTY_MEDIA_FIELDS } from "@/lib/properties/queries";

export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  const supabase = createClient();
  
  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from("properties")
    .select(`
      id,
      title,
      slug,
      price,
      purpose,
      status,
      total_area,
      bedrooms,
      suites,
      bathrooms,
      parking_spaces,
      property_types (name),
      neighborhoods (name, cities (name)),
      ${PROPERTY_MEDIA_FIELDS}
    `)
    .in("status", ["published", "sold", "rented"])
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  // Load locations for Quick Search
  const { data: propertyTypes } = await supabase.from("property_types").select("id, name").eq("active", true);
  const { data: cities } = await supabase.from("cities").select("id, name").eq("active", true);
  const { data: neighborhoods } = await supabase.from("neighborhoods").select("id, city_id, name").eq("active", true);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <Image 
            src="/images/mitram-full-branco.png" 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-20 max-w-4xl mx-auto space-y-6">
          <Image 
            src="/images/mitram-full-branco.png" 
            alt="Mitram Logo" 
            width={300} 
            height={100} 
            className="mx-auto"
          />
        </div>
      </section>

      {/* Quick Search */}
      <div className="relative z-30 -mt-16 container mx-auto px-4">
        <QuickSearch types={propertyTypes || []} cities={cities || []} neighborhoods={neighborhoods || []} />
      </div>

      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-2xl font-bold text-mitram-dark mb-8 text-center">Imóveis em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/imoveis" className="inline-block px-6 py-3 bg-mitram-dark text-white rounded hover:bg-black transition-colors font-medium">
              Ver todos os imóveis
            </Link>
          </div>
        </section>
      )}

      {/* Institutional */}
      <section className="py-16 bg-mitram-grayLight">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold text-mitram-dark">
              Trabalhamos com comercialização de imóveis usados, novos ou na planta.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              O Grupo Mitram tem como objetivo englobar diversas vertentes do segmento imobiliário.
              No mercado de áreas/terrenos focamos em estudar a viabilidade de potencial do mesmo
              e assim encontramos o cliente perfeito, fazemos a ponte entre o proprietário, investidores,
              construtores e no final do processo, o cliente final para o produto construído.
            </p>
            <p className="font-semibold text-mitram-dark">CRECI J06908</p>
          </div>
          <div className="flex-1 relative h-[400px] w-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="/images/mitram-full-ouro-degrade.png" 
              alt="Sobre a Mitram" 
              fill 
              className="object-contain p-12 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Avaliação CTA */}
      <section id="avaliacao" className="py-16 bg-mitram-goldLight">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <h2 className="text-3xl font-bold text-mitram-dark">Venda sua casa, terreno ou apartamento com a Mitram.</h2>
          <p className="text-mitram-dark/80 text-lg">
            Deixe que nós te ligamos para uma avaliação grátis e sem compromisso.
          </p>
          <form className="max-w-md mx-auto space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-mitram-dark mb-1">Nome*</label>
              <input type="text" required className="w-full px-4 py-2 rounded border-0 shadow-sm focus:ring-2 focus:ring-mitram-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-mitram-dark mb-1">Telefone*</label>
              <input type="tel" required className="w-full px-4 py-2 rounded border-0 shadow-sm focus:ring-2 focus:ring-mitram-gold" />
            </div>
            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="lgpd-home" required className="mt-1" />
              <label htmlFor="lgpd-home" className="text-xs text-mitram-dark">
                Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação.
              </label>
            </div>
            <button type="submit" className="w-full py-3 bg-mitram-dark text-white rounded font-medium hover:bg-black transition-colors">
              Enviar Solicitação
            </button>
          </form>
        </div>
      </section>

      {/* Testimonials (Static as requested) */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-mitram-dark mb-10 text-center">O que os nossos clientes estão dizendo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              text: "Hoje estamos realizados com o apartamento dos sonhos e isso com o suporte dos profissionais que nos atenderam e souberam escutar nossas necessidades e entender quais nossas expectativas.",
              author: "Inácio & Jean",
              type: "Apartamento comprado"
            },
            {
              text: "Estou muito satisfeita com minha compra através da Corretora Mitram, fui atendida por uma equipe muito atenciosa e prestativa que me ajudaram em todos os detalhes do processo, eu super indico esta imobiliária!",
              author: "Cristiane",
              type: "Apartamento comprado"
            },
            {
              text: "Desde o início a equipe foi super atenciosa e me auxiliou no processo da avaliação da Caixa e na escolha do imóvel. O Marcos, corretor que me atendeu, esteve sempre de prontidão e manteve a negociação sempre transparente! Nota 10!",
              author: "Lucas Melo",
              type: "Casa comprada"
            }
          ].map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
              <p className="text-gray-600 text-sm italic mb-6">&quot;{t.text}&quot;</p>
              <div>
                <p className="font-semibold text-mitram-dark">{t.author}</p>
                <p className="text-xs text-gray-500">{t.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
