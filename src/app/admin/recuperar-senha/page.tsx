"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/redefinir-senha`,
    });

    if (error) {
      setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
    } else {
      setMessage("Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mitram-grayLight px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image 
            src="/images/MITRAM-ouro.png" 
            alt="Mitram Imóveis Logo" 
            width={200} 
            height={50} 
            className="h-12 w-auto"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-mitram-dark">Recuperar Senha</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}
        
        <form onSubmit={handleRecover} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mitram-grayDark mb-1" htmlFor="email">
              E-mail cadastrado
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mitram-gold"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mitram-dark text-white py-2 px-4 rounded hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm text-mitram-grayDark hover:text-mitram-gold transition-colors">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
