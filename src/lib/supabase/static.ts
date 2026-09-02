import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente anônimo sem cookies, para leituras públicas em rotas que precisam
 * continuar cacheáveis — hoje, `src/app/sitemap.ts`.
 *
 * Por que não os outros três:
 * - `server.ts` chama `cookies()`, e é exatamente essa chamada que marca a rota
 *   como dinâmica. Usá-lo no sitemap anularia o `revalidate`.
 * - `client.ts` é `createBrowserClient`, escopo de navegador.
 * - `admin.ts` ignora RLS. Aqui usamos a chave publishable de propósito: como a
 *   requisição é anônima, as policies de RLS continuam valendo e é fisicamente
 *   impossível o sitemap vazar um imóvel em rascunho ou na lixeira.
 *
 * Sem sessão e sem refresh de token: não há usuário nesta conexão.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
