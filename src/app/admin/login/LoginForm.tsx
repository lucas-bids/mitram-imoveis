"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { FormField, fieldClasses } from "@/components/ui/FormField";
import { Heading } from "@/components/ui/Heading";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("Sua conta não possui permissão de administrador.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError("Sua conta não possui permissão de administrador.");
      setLoading(false);
      return;
    }

    const nextPath = searchParams.get("next");
    router.push(nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin/imoveis");
    router.refresh();
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

        <Heading as="h1" variant="h3" className="text-center mb-6">Painel Administrativo</Heading>

        {error && (
          <AlertMessage tone="error" className="mb-4">
            {error}
          </AlertMessage>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <FormField label="E-mail">
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

          <FormField label="Senha">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className={fieldClasses()}
            />
          </FormField>

          <div className="flex justify-end">
            <Link href="/admin/recuperar-senha" className="text-sm text-mitram-gold hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" disabled={loading} className={buttonClasses("primary", "md", "w-full")}>
            <LogIn size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
