import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Gallery from "@/components/properties/Gallery";
import PropertyCard from "@/components/properties/PropertyCard";
import SchedulingForm from "@/components/forms/SchedulingForm";
import PropertiesMap from "@/components/maps/PropertiesMap";
import { PROPERTY_MEDIA_ALL, PROPERTY_MEDIA_FIELDS } from "@/lib/properties/queries";
import { Bed, Bath, Car, Square, MapPin, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: property } = await supabase.from("properties").select("title, description").eq("slug", params.slug).single();
  
  if (!property) return { title: "Imóvel não encontrado | Mitram Imóveis" };

  return {
    title: `${property.title} | Mitram Imóveis`,
    description: property.description?.substring(0, 160),
  };
}

export default async function PropertyDetailsPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_types (name),
      neighborhoods (name, cities (name, state)),
      ${PROPERTY_MEDIA_ALL},
      property_features (features (name))
    `)
    .eq("slug", params.slug)
    .in("status", ["published", "sold", "rented"])
    .single();

  if (error || !property) {
    notFound();
  }

  // Similar properties
  const { data: similarProperties } = await supabase
    .from("properties")
    .select(`
      id, title, slug, price, purpose, status, total_area, bedrooms, suites, bathrooms, parking_spaces,
      property_types (name),
      neighborhoods (name, cities (name)),
      ${PROPERTY_MEDIA_FIELDS}
    `)
    .in("status", ["published", "sold", "rented"])
    .eq("property_type_id", property.property_type_id)
    .eq("purpose", property.purpose)
    .neq("id", property.id)
    .limit(3);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5541996787173";
  const propertyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel/${property.slug}`;
  const whatsappMessage = encodeURIComponent(`Olá, gostaria de saber mais sobre o imóvel: ${property.title}. Link: ${propertyUrl}`);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const priceFormatted = property.price 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)
    : 'Consulte';

  return (
    <div className="bg-mitram-grayLight min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            "name": property.title,
            "description": property.description,
            "url": propertyUrl,
            "offers": {
              "@type": "Offer",
              "price": property.price,
              "priceCurrency": "BRL"
            }
          })
        }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-mitram-dark text-white text-xs font-semibold px-2 py-1 rounded">
                {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
              </span>
              <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                {property.property_types?.name}
              </span>
              {property.status === 'sold' && <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">VENDIDO</span>}
              {property.status === 'rented' && <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">ALUGADO</span>}
            </div>
            <h1 className="text-3xl font-bold text-mitram-dark mb-2">{property.title}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <MapPin size={18} />
              {property.street && `${property.street}, `}
              {property.number && `${property.number} - `}
              {property.neighborhoods?.name}, {property.neighborhoods?.cities?.name} - {property.neighborhoods?.cities?.state}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-3xl font-bold text-mitram-gold">{priceFormatted}</p>
            {property.condominium_fee && <p className="text-sm text-gray-500">Condomínio: R$ {property.condominium_fee}</p>}
            {property.iptu && <p className="text-sm text-gray-500">IPTU: R$ {property.iptu}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Gallery media={property.property_media?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []} />

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-mitram-dark mb-4">Resumo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.total_area && (
                  <div>
                    <p className="text-gray-500 text-sm">Área Total</p>
                    <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.total_area} m²</p>
                  </div>
                )}
                {property.private_area && (
                  <div>
                    <p className="text-gray-500 text-sm">Área Útil</p>
                    <p className="font-semibold flex items-center gap-1"><Square size={16} /> {property.private_area} m²</p>
                  </div>
                )}
                {property.bedrooms > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm">Quartos</p>
                    <p className="font-semibold flex items-center gap-1"><Bed size={16} /> {property.bedrooms}</p>
                  </div>
                )}
                {property.suites > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm">Suítes</p>
                    <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.suites}</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm">Banheiros</p>
                    <p className="font-semibold flex items-center gap-1"><Bath size={16} /> {property.bathrooms}</p>
                  </div>
                )}
                {property.parking_spaces > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm">Vagas</p>
                    <p className="font-semibold flex items-center gap-1"><Car size={16} /> {property.parking_spaces}</p>
                  </div>
                )}
                {property.floor && (
                  <div>
                    <p className="text-gray-500 text-sm">Andar</p>
                    <p className="font-semibold">{property.floor}º</p>
                  </div>
                )}
                {property.furnished && (
                  <div>
                    <p className="text-gray-500 text-sm">Mobiliado</p>
                    <p className="font-semibold">Sim</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-mitram-dark mb-4">Descrição</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </div>
            </div>

            {property.property_features && property.property_features.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-mitram-dark mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                  {property.property_features.map((pf: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      <Check size={18} className="text-mitram-gold" />
                      {pf.features.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video & Virtual Tour */}
            {(property.youtube_url || property.virtual_tour_url) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-mitram-dark mb-4">Mídia</h2>
                <div className="flex gap-4 flex-wrap">
                  {property.youtube_url && (
                    <a href={property.youtube_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700">
                      <ExternalLink size={18} /> Ver Vídeo no YouTube
                    </a>
                  )}
                  {property.virtual_tour_url && (
                    <a href={property.virtual_tour_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-mitram-dark text-white px-4 py-2 rounded font-medium hover:bg-black">
                      <ExternalLink size={18} /> Abrir Tour Virtual
                    </a>
                  )}
                </div>
              </div>
            )}

            {property.latitude && property.longitude && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-mitram-dark mb-4">Localização</h2>
                <div className="h-[400px] w-full rounded overflow-hidden border">
                  <PropertiesMap properties={[property]} />
                </div>
              </div>
            )}

          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full bg-[#25D366] text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg hover:bg-[#128C7E] transition-colors shadow-md"
              >
                Conversar pelo WhatsApp
              </a>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-mitram-dark mb-4">Agendar Visita / Mais Informações</h3>
                <SchedulingForm propertyTitle={property.title} propertyUrl={propertyUrl} />
              </div>
            </div>
          </div>
        </div>

        {similarProperties && similarProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-mitram-dark mb-6">Imóveis Semelhantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
