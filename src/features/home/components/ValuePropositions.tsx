import { Handshake, Compass, MapPinned, LandPlot } from "lucide-react";

export function ValuePropositions() {
  return (
    <section className="container mx-auto px-4 mb-10 md:mb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <Handshake size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-mitram-dark mb-1">Negociação descomplicada</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Acompanhamento e suporte em todas as etapas da negociação.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Compass size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-mitram-dark mb-1">Apoio em cada escolha</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Recomendações alinhadas ao seu perfil e orçamento.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-green-100 text-green-600 p-3 rounded-xl">
            <MapPinned size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-mitram-dark mb-1">Imóveis selecionados</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Imóveis de qualidade em Curitiba e região.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-2xl flex items-start gap-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <LandPlot size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-mitram-dark mb-1">Compra e venda de terrenos</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Intermediação segura para comprar ou vender terrenos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
