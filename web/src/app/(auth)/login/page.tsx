"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getEmailByUsername } from "@/lib/auth/checkUsername";

export default function LoginPage() {
  const router = useRouter();
  const supabaseClient = createClient();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const email = await getEmailByUsername(usernameOrEmail);

      if (!email) {
        setErrorMessage("Username atau email tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      setIsLoading(false);

      if (error) {
        console.error(`[ERROR] Gagal masuk: ${error.message}`);
        setErrorMessage("Username/email atau password salah.");
        return;
      }

      console.log("[SUCCESS] Login berhasil.");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[ERROR] Terjadi kesalahan tidak terduga saat login.", err);
      setErrorMessage("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(`[ERROR] Gagal masuk dengan Google: ${error.message}`);
      setErrorMessage("Gagal masuk dengan Google. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Masuk ke LaporPohon</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali</p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Username atau email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs text-gray-400">ATAU</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full border rounded px-3 py-2 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-gray-50 transition"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
        Masuk dengan Google
      </button>

      <p className="text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="text-blue-500 font-medium">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}
