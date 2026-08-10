"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Save } from "lucide-react";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { FormField, fieldClasses } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";

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
      <div className="bg-white p-8 rounded-lg border border-gray-200 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image 
            src="/images/MITRAM-ouro.png" 
            alt="Mitram Imóveis Logo" 
            width={200} 
            height={50} 
            className="h-12 w-auto"
          />
        </div>
        
        <Heading as="h1" variant="h3" className="text-center mb-6">Redefinir Senha</Heading>

        {error && (
          <AlertMessage tone="error" className="mb-4">
            {error}
          </AlertMessage>
        )}

        {message && (
          <AlertMessage tone="success" className="mb-4">
            {message}
          </AlertMessage>
        )}
        
        <form onSubmit={handleReset} className="space-y-4">
          <FormField label="Nova senha">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder=" "
              className={fieldClasses()}
            />
          </FormField>

          <FormField label="Confirmar nova senha">
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder=" "
              className={fieldClasses()}
            />
          </FormField>

          <button
            type="submit"
            disabled={loading || !!message}
            className={buttonClasses("primary", "md", "w-full")}
          >
            <Save size={18} />
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
