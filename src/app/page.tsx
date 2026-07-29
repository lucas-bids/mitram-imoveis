import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FeaturedPropertiesCarousel from "@/components/properties/FeaturedPropertiesCarousel";
import QuickSearch from "@/components/public/QuickSearch";
import { PROPERTY_MEDIA_FIELDS } from "@/lib/properties/queries";
import { CheckCircle2, ShieldCheck, Headset, Sparkles, ArrowRight } from "lucide-react";

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
      <section id="avaliacao" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-mitram-dark z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-mitram-gold/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/4"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white rounded-[2rem] p-8 md:p-16 shadow-2xl max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <span className="text-mitram-gold font-bold uppercase tracking-wider text-sm">AVALIAÇÃO GRATUITA</span>
              <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark leading-tight">
                Venda seu imóvel com a expertise da Mitram
              </h2>
              <p className="text-gray-600 text-lg">
                Deixe que nossa equipe entre em contato para uma avaliação sem compromisso do seu imóvel ou terreno.
              </p>
            </div>
            
            <div className="flex-1 w-full bg-mitram-grayLight p-8 rounded-2xl">
              <form className="space-y-4">
                <div>
                  <input type="text" placeholder="Seu nome completo" required className="w-full px-5 py-4 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-mitram-gold bg-white" />
                </div>
                <div>
                  <input type="tel" placeholder="Seu telefone/WhatsApp" required className="w-full px-5 py-4 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-mitram-gold bg-white" />
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <input type="checkbox" id="lgpd-home" required className="mt-1.5 w-4 h-4 text-mitram-gold border-gray-300 rounded focus:ring-mitram-gold" />
                  <label htmlFor="lgpd-home" className="text-sm text-gray-600 leading-relaxed">
                    Concordo que meus dados sejam utilizados pela Mitram para retornar esta solicitação.
                  </label>
                </div>
                <button type="submit" className="w-full py-4 mt-2 bg-mitram-gold text-mitram-dark rounded-xl font-bold text-lg hover:bg-yellow-500 transition-colors shadow-md">
                  Solicitar Avaliação
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-mitram-gold font-bold uppercase tracking-wider text-sm">DEPOIMENTOS</span>
          <h2 className="text-3xl md:text-4xl font-bold text-mitram-dark">O que nossos clientes dizem</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div key={i} className="bg-mitram-grayLight p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div className="absolute top-8 right-8 text-mitram-gold/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 relative z-10">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-mitram-gold/20 flex items-center justify-center text-mitram-gold font-bold text-lg">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-mitram-dark">{t.author}</p>
                  <p className="text-sm text-mitram-gold">{t.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
