"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LoginStep = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const supabaseClient = createClient();

  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setIsLoading(false);

    if (error) {
      console.error(`[ERROR] Gagal mengirim kode OTP: ${error.message}`);
      setErrorMessage("Gagal mengirim kode OTP. Silakan coba lagi.");
      return;
    }

    console.log("[SUCCESS] Kode OTP berhasil dikirim.");
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabaseClient.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    setIsLoading(false);

    if (error) {
      console.error(`[ERROR] Kode OTP tidak valid: ${error.message}`);
      setErrorMessage("Kode OTP salah atau sudah kedaluwarsa.");
      return;
    }

    console.log("[SUCCESS] Login berhasil.");
    router.push("/");
    router.refresh();
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
      console.error(`[ERROR] Gagal login dengan Google: ${error.message}`);
      setErrorMessage("Gagal login dengan Google. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">LaporPohon</h1>
        <p className="text-sm text-gray-500">
          {step === "email"
            ? "Masuk dengan email untuk melanjutkan"
            : `Masukkan kode yang dikirim ke ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2">
          {errorMessage}
        </div>
      )}

      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white rounded px-3 py-2 disabled:opacity-50"
          >
            {isLoading ? "Mengirim..." : "Kirim Kode OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded px-3 py-2 text-center tracking-widest text-lg"
            maxLength={8}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white rounded px-3 py-2 disabled:opacity-50"
          >
            {isLoading ? "Memverifikasi..." : "Verifikasi"}
          </button>
          <button
            type="button"
            onClick={() => setStep("email")}
            className="w-full text-sm text-gray-500"
          >
            Ganti email
          </button>
        </form>
      )}

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
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
      c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
      c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          />
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
      C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          />
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
      c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          />
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
      c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24
      C44,22.659,43.862,21.35,43.611,20.083z"
          />
        </svg>
        Masuk dengan Google
      </button>
    </div>
  );
}
