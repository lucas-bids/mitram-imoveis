"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/actions/contact";

interface SchedulingFormProps {
  propertyTitle: string;
  propertyUrl: string;
}

export default function SchedulingForm({ propertyTitle, propertyUrl }: SchedulingFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    formData.append("type", "scheduling");
    formData.append("propertyTitle", propertyTitle);
    formData.append("propertyUrl", propertyUrl);

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

  if (success) {
    return (
      <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
        <p className="font-semibold">Mensagem enviada com sucesso!</p>
        <p className="text-sm mt-2">Entraremos em contato em breve.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-mitram-dark underline"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      {/* Honeypot field for basic spam protection */}
      <input type="text" name="address_field" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
        <input type="text" id="name" name="name" required className="w-full px-3 py-2 border rounded focus:ring-mitram-gold focus:border-mitram-gold" />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp *</label>
        <input type="tel" id="phone" name="phone" required className="w-full px-3 py-2 border rounded focus:ring-mitram-gold focus:border-mitram-gold" />
      </div>

      <div className="flex items-start gap-2 pt-2">
        <input type="checkbox" id="lgpd-scheduling" name="consent" required className="mt-1" />
        <label htmlFor="lgpd-scheduling" className="text-xs text-gray-600 leading-tight">
          Concordo que meus dados sejam utilizados pela Mitram Imóveis para responder a esta solicitação.
        </label>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 bg-mitram-dark text-white rounded font-medium hover:bg-black transition-colors disabled:opacity-50 mt-2"
      >
        {loading ? "Enviando..." : "Enviar Mensagem"}
      </button>
    </form>
  );
}
