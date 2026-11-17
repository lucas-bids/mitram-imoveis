import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessPanel,
  canManageUsers,
  panelDenial,
  type SessionAccess,
} from "@/features/admin/users/roles";

// Só o login fica fora do gate. As telas de recuperação/redefinição por e-mail
// foram removidas: senhas são definidas pelo admin no painel.
const AUTH_ROUTES = ["/admin/login"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isUsersRoute(pathname: string) {
  return pathname === "/admin/usuarios" || pathname.startsWith("/admin/usuarios/");
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminRoute(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are not configured.");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAuthRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data: access, error } = await supabase.rpc("my_access").maybeSingle<SessionAccess>();

    if (error) {
      console.error("Failed to load access in middleware:", error.message);
    }

    const denial = panelDenial(access);
    if (denial) {
      // Sessão cortada por um admin (senha redefinida) ou conta desativada:
      // encerra a sessão local também, para não ficar presa em redirect.
      if (denial !== "unauthorized") await supabase.auth.signOut({ scope: "local" });
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      url.searchParams.set("error", denial);
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }

    // Gerenciamento de usuários é só de admin. Editores voltam para imóveis.
    // (Defesa em profundidade: a página, as actions e o RLS checam de novo.)
    if (isUsersRoute(pathname) && !canManageUsers(access)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/imoveis";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (user && (pathname === "/admin/login" || pathname === "/admin")) {
    const { data: access } = await supabase.rpc("my_access").maybeSingle<SessionAccess>();

    if (canAccessPanel(access)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/imoveis";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
