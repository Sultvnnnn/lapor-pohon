"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isUsernameTaken } from "@/lib/auth/checkUsername";
import {
  passwordRequirements,
  isPasswordValid,
} from "@/lib/auth/passwordValidation";

type RegisterStep = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const supabaseClient = createClient();

  const [step, setStep] = useState<RegisterStep>("form");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid(password)) {
      setErrorMessage("Password belum memenuhi semua ketentuan.");
      return;
    }

    setIsLoading(true);

    try {
      const taken = await isUsernameTaken(username);
      if (taken) {
        setErrorMessage("Username sudah digunakan. Coba yang lain.");
        setIsLoading(false);
        return;
      }

      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
        },
      });

      setIsLoading(false);

      if (error) {
        console.error(`[ERROR] Gagal mendaftar: ${error.message}`);
        setErrorMessage(
          error.message.includes("already registered")
            ? "Email sudah terdaftar. Silakan masuk."
            : "Gagal mendaftar. Silakan coba lagi.",
        );
        return;
      }

      console.log("[SUCCESS] Registrasi berhasil, menunggu verifikasi OTP.");
      setStep("otp");
    } catch (err) {
      console.error(
        "[ERROR] Terjadi kesalahan tidak terduga saat registrasi.",
        err,
      );
      setErrorMessage("Terjadi kesalahan tidak terduga. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabaseClient.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    setIsLoading(false);

    if (error) {
      console.error(`[ERROR] Kode OTP tidak valid: ${error.message}`);
      setErrorMessage("Kode OTP salah atau sudah kedaluwarsa.");
      return;
    }

    console.log("[SUCCESS] Verifikasi berhasil, akun aktif.");
    router.push("/onboarding");
    router.refresh();
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error(`[ERROR] Gagal mendaftar dengan Google: ${error.message}`);
      setErrorMessage("Gagal mendaftar dengan Google. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Daftar LaporPohon</h1>
        <p className="text-sm text-gray-500">
          {step === "form"
            ? "Buat akun baru untuk mulai melapor"
            : `Masukkan kode yang dikirim ke ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2">
          {errorMessage}
        </div>
      )}

      {step === "form" && (
        <>
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <ul className="text-xs space-y-1 pl-1">
              {passwordRequirements.map((req) => {
                const passed = req.test(password);
                return (
                  <li
                    key={req.label}
                    className={passed ? "text-green-600" : "text-gray-400"}
                  >
                    {passed ? "✓" : "○"} {req.label}
                  </li>
                );
              })}
            </ul>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white rounded px-3 py-2 disabled:opacity-50"
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-xs text-gray-400">ATAU</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            onClick={handleGoogleRegister}
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
            Daftar dengan Google
          </button>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-500 font-medium">
              Masuk di sini
            </Link>
          </p>
        </>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            required
            placeholder="Kode OTP"
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
            {isLoading ? "Memverifikasi..." : "Verifikasi & Aktifkan Akun"}
          </button>
        </form>
      )}
    </div>
  );
}
