import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// page yg bisa diakses tanpa login
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth/callback"];

export const proxy = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[ERROR] Missing Supabase environment variables in proxy.");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  //! trigger refresh session kalau token udah mau expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    // Fetch profile role to handle Admin vs Regular user routing
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const defaultTarget = isAdmin ? "/admin" : "/dashboard";

    if (pathname === "/login" || pathname === "/register") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = defaultTarget;
      return NextResponse.redirect(homeUrl);
    }

    if (pathname === "/") {
      const fromDashboard =
        request.nextUrl.searchParams.get("from") === "dashboard" ||
        request.nextUrl.searchParams.get("from") === "admin" ||
        request.nextUrl.searchParams.has("landing");
      if (!fromDashboard) {
        const homeUrl = request.nextUrl.clone();
        homeUrl.pathname = defaultTarget;
        return NextResponse.redirect(homeUrl);
      }
    }

    if (isAdmin && pathname === "/dashboard") {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = "/admin";
      return NextResponse.redirect(adminUrl);
    }
  }

  return supabaseResponse;
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
