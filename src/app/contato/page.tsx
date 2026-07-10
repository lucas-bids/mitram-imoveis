"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { Phone, Mail } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("type", "contact");

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
    <div className="bg-mitram-grayLight min-h-screen pb-16">
      {/* Header section */}
      <div className="bg-white py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-mitram-dark mb-4">Contato</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Estamos à disposição para ajudar você a encontrar o imóvel ideal ou para avaliar sua propriedade. Entre em contato conosco.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-mitram-goldLight p-3 rounded-full text-mitram-dark">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-mitram-dark">WhatsApp / Telefone</h3>
                <p className="text-gray-600 mt-1">41 99678-7173</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-mitram-goldLight p-3 rounded-full text-mitram-dark">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-mitram-dark">E-mail</h3>
                <p className="text-gray-600 mt-1">lucas.vidal.andrade@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-mitram-dark mb-6">Mande uma mensagem</h2>
            
            {success ? (
              <div className="bg-green-50 text-green-800 p-8 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Mensagem enviada com sucesso!</h3>
                <p>Obrigado pelo seu contato. Retornaremos em breve.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-sm bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
                
                <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome completo*</label>
                  <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail*</label>
                    <input type="email" id="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                    <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem*</label>
                  <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-mitram-gold focus:border-mitram-gold"></textarea>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" id="lgpd-contact" name="consent" required className="mt-1.5" />
                  <label htmlFor="lgpd-contact" className="text-sm text-gray-600">
                    Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-3 bg-mitram-gold text-mitram-dark rounded font-bold hover:bg-yellow-500 transition-colors disabled:opacity-50 mt-4"
                >
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
