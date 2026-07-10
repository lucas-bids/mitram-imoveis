"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Verifies if there's a valid session hash in URL
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Ready to reset
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError("Erro ao redefinir a senha. O link pode ter expirado.");
    } else {
      setMessage("Senha redefinida com sucesso.");
      setTimeout(() => {
        router.push("/admin/imoveis");
      }, 2000);
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
        
        <h1 className="text-2xl font-bold text-center mb-6 text-mitram-dark">Redefinir Senha</h1>
        
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
        
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mitram-grayDark mb-1" htmlFor="password">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mitram-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-mitram-grayDark mb-1" htmlFor="confirmPassword">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mitram-gold"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-mitram-dark text-white py-2 px-4 rounded hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
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
