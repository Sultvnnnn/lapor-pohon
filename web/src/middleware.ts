import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// page yg bisa diakses tanpa login
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth/callback"];
const ONBOARDING_PATH = "/onboarding";

export const middleware = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[ERROR] Missing Supabase environment variables in middleware.",
    );
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

  if (user && (pathname === "/login" || pathname === "/register")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  //! Cek apakah user sudah pilih role, kalau belum paksa ke /onboarding
  if (user && pathname !== ONBOARDING_PATH && !isPublicPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && profile.role === null) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = ONBOARDING_PATH;
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return supabaseResponse;
};

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua route KECUALI:
     * - file static (_next/static, _next/image, favicon.ico)
     * - file dengan ekstensi (gambar, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
