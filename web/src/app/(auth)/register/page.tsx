"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, CircleNotch, WarningCircle, CheckCircle } from "@phosphor-icons/react";
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
            : "Gagal mendaftar. Silakan coba lagi."
        );
        return;
      }

      console.log("[SUCCESS] Registrasi berhasil, menunggu verifikasi OTP.");
      setStep("otp");
    } catch (err) {
      console.error(
        "[ERROR] Terjadi kesalahan tidak terduga saat registrasi.",
        err
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
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      console.error(`[ERROR] Gagal mendaftar dengan Google: ${error.message}`);
      setErrorMessage("Gagal mendaftar dengan Google. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
          Daftar LaporPohon
        </h1>
        <p className="text-xs text-[#111111]/60">
          {step === "form"
            ? "Buat akun baru untuk mulai melapor & berpartisipasi"
            : `Masukkan kode OTP yang dikirim ke ${email}`}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl px-4 py-3 flex items-center gap-2">
          <WarningCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === "form" && (
        <>
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="Pilih username unik"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                placeholder="Buat kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
              />
            </div>

            <ul className="text-xs space-y-1 pl-1 py-1">
              {passwordRequirements.map((req) => {
                const passed = req.test(password);
                return (
                  <li
                    key={req.label}
                    className={`flex items-center gap-1.5 ${
                      passed ? "text-[#0b3d2c] font-semibold" : "text-gray-400"
                    }`}
                  >
                    {passed ? (
                      <CheckCircle size={14} weight="fill" className="text-[#0b3d2c]" />
                    ) : (
                      <span className="text-[10px]">○</span>
                    )}
                    <span>{req.label}</span>
                  </li>
                );
              })}
            </ul>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b3d2c] hover:bg-[#15543e] text-white py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                  <span>Mendaftar...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} weight="bold" />
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">
              ATAU
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-[#111111] py-3 px-4 rounded-2xl text-sm font-medium transition-colors shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-60"
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
            <span>Daftar dengan Google</span>
          </button>

          <p className="text-center text-xs text-[#111111]/70">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#0b3d2c] font-bold hover:underline"
            >
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
            className="w-full bg-[#ecefe6]/30 border border-[#0b3d2c] rounded-2xl px-4 py-3 text-center tracking-widest text-xl font-bold text-[#111111]"
            maxLength={8}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0b3d2c] hover:bg-[#15543e] text-white py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Verifikasi & Aktifkan Akun</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
