import { Handshake, Compass, MapPinned, LandPlot } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Text } from "@/components/ui/Text";

export function ValuePropositions() {
  return (
    <Container as="section" className="mb-10 md:mb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <Handshake size={24} />
          </div>
          <div>
            <Heading as="h3" variant="h4" className="mb-1">Negociação descomplicada</Heading>
            <Text variant="bodySm">Acompanhamento e suporte em todas as etapas da negociação.</Text>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Compass size={24} />
          </div>
          <div>
            <Heading as="h3" variant="h4" className="mb-1">Apoio em cada escolha</Heading>
            <Text variant="bodySm">Recomendações alinhadas ao seu perfil e orçamento.</Text>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <MapPinned size={24} />
          </div>
          <div>
            <Heading as="h3" variant="h4" className="mb-1">Imóveis selecionados</Heading>
            <Text variant="bodySm">Imóveis de qualidade em Curitiba e região.</Text>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <LandPlot size={24} />
          </div>
          <div>
            <Heading as="h3" variant="h4" className="mb-1">Compra e venda de terrenos</Heading>
            <Text variant="bodySm">Intermediação segura para comprar ou vender terrenos.</Text>
          </div>
        </div>
      </div>
    </Container>
  );
}
