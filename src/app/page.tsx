import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FeaturedPropertiesCarousel from "@/components/properties/FeaturedPropertiesCarousel";
import QuickSearch from "@/components/public/QuickSearch";
import TestimonialsCarousel from "@/components/public/TestimonialsCarousel";
import { PROPERTY_MEDIA_FIELDS } from "@/lib/properties/queries";
import { CheckCircle2, ShieldCheck, Headset, Sparkles, ArrowRight } from "lucide-react";

const TESTIMONIALS = [
  {
    text: "Hoje estamos realizados com o apartamento dos sonhos e isso com o suporte dos profissionais que nos atenderam e souberam escutar nossas necessidades e entender quais nossas expectativas.",
    author: "Isabely & Jean",
    type: "Apartamento comprado",
    image: "/images/testimonials/jean-300x297-1.png",
  },
  {
    text: "Estou muito satisfeita com minha compra através da Cansei de Aluguel, fui atendida por uma equipe muito atenciosa e prestativa que me ajudaram em todos os detalhes do processo, eu super indico essa Imobiliária!",
    author: "Cristiane",
    type: "Apartamento comprado",
    image: "/images/testimonials/cristiane-300x291-1.jpeg",
  },
  {
    text: "Desde o início a equipe foi super atenciosa e me auxiliou no processo de avaliação da Caixa e na escolha do imóvel. O Marcos, corretor que me atendeu, estava sempre de prontidão e manteve a negociação sempre transparente! Nota 10!",
    author: "Lucas Vidal",
    type: "Casa comprada",
    image: "/images/testimonials/lucas.jpg",
  },
  {
    text: "Além de uma experiência incrível por ser uma conquista pessoal. Eles fizeram ser algo ainda mais legal, porque me atenderam super bem, sempre muito atenciosos e cuidadosos. Não posso deixar de falar que o café deles é ótimo! Foi uma experiência lindaaa! Obrigada!",
    author: "Suelym",
    type: "Casa comprada",
    image: "/images/testimonials/suelyn-300x300-1.png",
  },
  {
    text: "Agradeço imensamente à dedicação e paciência do Guima e do Bruno, que sonharam comigo, e me ajudaram nessa grande conquista de ter meu apartamento.",
    author: "Daiane",
    type: "Apartamento comprado",
    image: "/images/testimonials/daiane-300x300-1.jpeg",
  },
];

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
    <div className="flex flex-col min-h-screen bg-mitram-white">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-4 pb-20 lg:pb-32">
        <div className="container mx-auto">
          <div className="relative h-[650px] w-full rounded-[2.5rem] overflow-hidden">
            <Image 
              src="/images/hero-image.jpg" 
              alt="Imóveis Modernos Mitram" 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-mitram-dark/80 via-mitram-dark/50 to-transparent z-10" />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24">
              <div className="max-w-2xl space-y-6">
                <span className="inline-block py-1.5 px-4 rounded-full bg-mitram-gold/20 text-mitram-goldLight text-sm font-semibold backdrop-blur-md border border-mitram-gold/30">
                  ✨ Encontre seu novo lar
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                  Descubra espaços que parecem um <span className="text-mitram-goldLight">lar</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl">
                  Encontre imóveis selecionados a dedo que combinam perfeitamente com seu estilo de vida e orçamento.
                </p>
              </div>
            </div>
            
            {/* Trusted Badge (Floating) */}
            <div className="absolute top-8 right-8 z-20 hidden lg:flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                  <Image src="https://i.pravatar.cc/100?img=1" alt="User" width={32} height={32} className="object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                  <Image src="https://i.pravatar.cc/100?img=2" alt="User" width={32} height={32} className="object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                  <Image src="https://i.pravatar.cc/100?img=3" alt="User" width={32} height={32} className="object-cover" />
                </div>
              </div>
              <span className="text-sm font-semibold text-mitram-dark">Mais de 100+ clientes satisfeitos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Search */}
      <div className="relative z-30 -mt-32 md:-mt-[10.5rem] container mx-auto px-4 mb-20">
        <QuickSearch types={propertyTypes || []} cities={cities || []} neighborhoods={neighborhoods || []} />
      </div>

      {/* Featured Properties */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="bg-white pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark">Imóveis em Destaque</h2>
                <p className="text-gray-500 mt-2">Confira as melhores opções selecionadas para você</p>
              </div>
              <Link href="/imoveis" className="group flex items-center gap-2 text-mitram-dark font-semibold hover:text-mitram-gold transition-colors">
                Ver Todos
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <FeaturedPropertiesCarousel properties={featuredProperties} />
          </div>
        </section>
      )}

      {/* Value Propositions */}
      <section className="container mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-mitram-grayLight p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-mitram-dark mb-1">Imóveis Verificados</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Todos os imóveis são verificados para sua paz de espírito.</p>
            </div>
          </div>
          <div className="bg-mitram-grayLight p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-mitram-dark mb-1">Seguro e Confiável</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Sua segurança é nossa prioridade em cada transação.</p>
            </div>
          </div>
          <div className="bg-mitram-grayLight p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="bg-green-100 text-green-600 p-3 rounded-xl">
              <Headset size={24} />
            </div>
            <div>
              <h3 className="font-bold text-mitram-dark mb-1">Suporte Completo</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Nossa equipe está aqui para ajudar você a qualquer momento.</p>
            </div>
          </div>
          <div className="bg-mitram-grayLight p-6 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="bg-red-100 text-red-600 p-3 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-mitram-dark mb-1">Melhores Oportunidades</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Garanta as melhores condições no mercado imobiliário.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional / About */}
      <section className="container mx-auto px-4 mb-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 block">POR QUE ESCOLHER A MITRAM</span>
              <h2 className="text-4xl md:text-5xl font-bold text-mitram-dark leading-tight">
                Muito mais que<br />um imóvel
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              O Grupo Mitram tem como objetivo englobar diversas vertentes do segmento imobiliário. 
              Trabalhamos com comercialização de imóveis usados, novos ou na planta, focando na sua necessidade e estilo de vida.
            </p>
            
            <ul className="space-y-4">
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

            <div className="pt-4">
              <Link href="/contato" className="inline-flex items-center gap-2 px-8 py-4 bg-mitram-dark text-white rounded-full font-semibold hover:bg-black transition-colors shadow-md">
                Saiba Mais
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="relative h-[500px] md:h-[600px] w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <Image 
                src="/images/garden-garage-entrance.png" 
                alt="Interior Moderno" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Avaliação CTA */}
      <section id="avaliacao" className="py-24 relative overflow-hidden bg-mitram-grayLight">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mitram-gold/10 text-mitram-gold font-bold text-xs uppercase tracking-widest border border-mitram-gold/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mitram-gold opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-mitram-gold"></span>
                  </span>
                  Avaliação Gratuita
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-mitram-dark leading-[1.15]">
                  Descubra o valor <br className="hidden lg:block"/>
                  <span className="text-mitram-gold">real</span> do seu imóvel
                </h2>
                
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg">
                  Nossos especialistas preparam uma análise de mercado precisa para o seu patrimônio. <strong>É rápido, seguro e sem compromisso.</strong>
                </p>
              </div>


              {/* Form Integrated */}
              <div className="max-w-lg pt-6">
                <form className="space-y-5">
                  <div className="relative">
                    <input 
                      type="text" 
                      id="name" 
                      placeholder=" " 
                      required 
                      className="block w-full px-5 pb-3 pt-6 rounded-xl border-2 border-transparent shadow-sm bg-white text-mitram-dark focus:ring-2 focus:ring-mitram-gold/20 focus:border-mitram-gold transition-all outline-none peer" 
                    />
                    <label 
                      htmlFor="name" 
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
                    >
                      Nome completo
                    </label>
                  </div>

                  <div className="relative">
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder=" " 
                      required 
                      className="block w-full px-5 pb-3 pt-6 rounded-xl border-2 border-transparent shadow-sm bg-white text-mitram-dark focus:ring-2 focus:ring-mitram-gold/20 focus:border-mitram-gold transition-all outline-none peer" 
                    />
                    <label 
                      htmlFor="phone" 
                      className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none"
                    >
                      WhatsApp ou Telefone
                    </label>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        type="checkbox" 
                        id="lgpd-home" 
                        required 
                        className="w-4 h-4 text-mitram-gold border-gray-300 rounded focus:ring-mitram-gold focus:ring-2 accent-mitram-gold cursor-pointer" 
                      />
                    </div>
                    <label htmlFor="lgpd-home" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                      Concordo que a Mitram utilize meus dados para entrar em contato referente a esta solicitação.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-4 bg-mitram-dark text-white rounded-xl font-bold text-lg hover:bg-mitram-gold hover:text-mitram-dark transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group mt-2"
                  >
                    Quero minha avaliação
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <span className="text-mitram-gold font-bold uppercase tracking-wider text-sm">DEPOIMENTOS</span>
          <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark">O que nossos clientes dizem</h2>
        </div>

        <TestimonialsCarousel testimonials={TESTIMONIALS} />
      </section>

    </div>
  );
}
