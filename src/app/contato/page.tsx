"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { Phone, Mail, Instagram } from "lucide-react";

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

  const inputClasses = "w-full border-0 border-b-2 border-gray-300 bg-transparent px-0 py-3 text-mitram-dark focus:ring-0 focus:border-mitram-dark transition-colors placeholder:text-gray-500 font-medium";

  return (
    <div className="bg-mitram-white min-h-screen py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Left Side: Contact Info */}
        <div className="w-full md:w-2/5 p-10 md:p-16 flex flex-col justify-between bg-white relative">
          <div>
            
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Phone size={20} className="text-gray-400" />
                  <h3 className="font-bold text-mitram-dark text-lg">WhatsApp / Telefone</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1 ml-8">Nossa equipe está pronta para ajudar.</p>
                <p className="text-mitram-dark font-semibold ml-8">41 99678-7173</p>
                <p className="text-gray-400 text-xs mt-1 ml-8">Segunda a Sexta das 8h às 18h.</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Mail size={20} className="text-gray-400" />
                  <h3 className="font-bold text-mitram-dark text-lg">E-mail</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1 ml-8">Envie-nos um e-mail para propostas e parcerias.</p>
                <p className="text-mitram-dark font-semibold ml-8">lucas.vidal.andrade@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-full text-gray-500 hover:text-mitram-gold hover:bg-mitram-gold/10 transition-colors" title="Instagram">
              <Instagram size={22} />
            </a>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-3/5 bg-mitram-grayLight p-10 md:p-16 rounded-t-[2.5rem] md:rounded-l-none md:rounded-r-[2.5rem]">
          <h2 className="text-4xl md:text-5xl font-bold text-mitram-dark leading-tight mb-4">
            Tem alguma dúvida?<br/>Vamos conversar.
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Conte-nos um pouco sobre você e o que está buscando.
          </p>
          
          {success ? (
            <div className="bg-white p-10 rounded-3xl text-center shadow-sm border border-gray-100 mt-8">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-mitram-dark mb-3">Mensagem enviada!</h3>
              <p className="text-gray-600 mb-8">Obrigado pelo seu contato. Retornaremos em breve.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-sm font-bold bg-mitram-dark text-white px-8 py-4 rounded-xl hover:bg-black transition-colors"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}
              
              <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <input type="text" id="name" name="name" required placeholder="Seu nome" className={inputClasses} />
                </div>
                <div>
                  <input type="email" id="email" name="email" required placeholder="seu@email.com" className={inputClasses} />
                </div>
              </div>

              <div>
                <input type="tel" id="phone" name="phone" placeholder="Seu telefone (opcional)" className={inputClasses} />
              </div>

              <div>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={1} 
                  required 
                  placeholder="Como podemos ajudar?" 
                  className={`${inputClasses} resize-none`} 
                  onInput={(e) => {
                    e.currentTarget.style.height = 'auto';
                    e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                  }}
                ></textarea>
              </div>

              <div className="pt-2">
                <p className="text-sm font-semibold text-gray-500 mb-5 uppercase tracking-wider">Qual é o seu interesse principal?</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {['Comprar imóvel', 'Vender imóvel', 'Avaliação', 'Outros'].map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input type="checkbox" name="interests" value={option} className="w-5 h-5 border-2 border-gray-300 rounded text-mitram-dark focus:ring-mitram-dark focus:ring-offset-mitram-grayLight transition-colors cursor-pointer" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-mitram-dark transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-mitram-dark text-white rounded-xl font-bold text-lg hover:bg-black transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                </button>
              </div>
              
              <div className="flex items-start gap-3">
                <input type="checkbox" id="lgpd-contact" name="consent" required className="mt-1 w-4 h-4 border-2 border-gray-300 rounded text-mitram-dark focus:ring-mitram-dark focus:ring-offset-mitram-grayLight transition-colors cursor-pointer" />
                <label htmlFor="lgpd-contact" className="text-xs text-gray-500 leading-relaxed">
                  Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação de acordo com as leis de privacidade.
                </label>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
