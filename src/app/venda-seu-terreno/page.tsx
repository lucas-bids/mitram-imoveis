"use client";

import { useState } from "react";
import Image from "next/image";
import { submitContactForm } from "@/app/actions/contact";

export default function SellLandPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("type", "sell_land");

    try {
      const result = await submitContactForm(formData);
      if (result.success) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(result.error || "Ocorreu um erro ao enviar.");
      }
    } catch (err) {
      setError("Falha de conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mitram-grayLight min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row max-w-5xl mx-auto">
          
          <div className="md:w-1/2 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-mitram-dark mb-4">
              Venda seu terreno com a Mitram.
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Procura rentabilizar sua área? Temos diversas opções para que
              você faça o melhor negócio com o seu terreno! Deixe seu
              contato e ficaremos feliz em explicar o processo!
            </p>

            {success ? (
              <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Mensagem enviada com sucesso!</h3>
                <p>Nossa equipe entrará em contato com você o mais breve possível para explicar o processo.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
                
                <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold" />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone*</label>
                  <input type="tel" id="phone" name="phone" required className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold" />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" id="lgpd-land" name="consent" required className="mt-1.5" />
                  <label htmlFor="lgpd-land" className="text-sm text-gray-600">
                    Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-mitram-dark text-white rounded font-bold text-lg hover:bg-black transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? "Enviando..." : "Enviar"}
                </button>
              </form>
            )}
          </div>

          <div className="md:w-1/2 relative h-[400px] md:h-auto min-h-[400px]">
            <Image 
              src="/images/placeholder.jpg" 
              alt="Terreno Mitram" 
              fill 
              className="object-cover"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
