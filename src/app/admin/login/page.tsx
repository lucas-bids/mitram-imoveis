"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setLoading(false);
      return;
    }

    router.push("/admin/imoveis");
    router.refresh();
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
        
        <h1 className="text-2xl font-bold text-center mb-6 text-mitram-dark">Painel Administrativo</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-mitram-grayDark mb-1" htmlFor="email">
              E-mail
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
          
          <div>
            <label className="block text-sm font-medium text-mitram-grayDark mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-mitram-gold"
            />
          </div>
          
          <div className="flex justify-end">
            <Link href="/admin/recuperar-senha" className="text-sm text-mitram-gold hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mitram-dark text-white py-2 px-4 rounded hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
