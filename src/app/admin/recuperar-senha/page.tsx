"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { FormField, fieldClasses } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";

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
        
        <Heading as="h1" variant="h3" className="text-center mb-6">Recuperar Senha</Heading>

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
        
        <form onSubmit={handleRecover} className="space-y-4">
          <FormField label="E-mail cadastrado">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className={fieldClasses()}
            />
          </FormField>

          <button type="submit" disabled={loading} className={buttonClasses("primary", "md", "w-full")}>
            <Mail size={18} />
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
