import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  // `cookies()` é assíncrono a partir do Next 15. A chamada precisa acontecer
  // aqui, durante a renderização, e não dentro dos callbacks do @supabase/ssr:
  // é ela que sinaliza ao Next que a rota é dinâmica. Chamada de dentro de um
  // callback assíncrono, o sinal escapa da renderização e a build quebra.
  const cookieStorePromise = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStorePromise).getAll()
        },
        async setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
          try {
            const cookieStore = await cookieStorePromise
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
