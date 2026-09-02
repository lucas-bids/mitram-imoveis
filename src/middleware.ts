import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  /*
   * Só `/admin`. `updateSession` já retornava `NextResponse.next()` na primeira
   * linha para qualquer caminho fora de /admin, então isto preserva o
   * comportamento — mas evita invocar a função em toda requisição pública,
   * incluindo /robots.txt, /sitemap.xml e os assets de metadata.
   *
   * Os dois padrões são explícitos de propósito: `/admin` sozinho (login e
   * redirecionamento do admin autenticado) e tudo abaixo dele. Mexer aqui é
   * uma alteração de segurança — ver agent_docs/supabase.md.
   */
  matcher: ['/admin', '/admin/:path*'],
}
