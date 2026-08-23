"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  IdentificationCard,
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  CircleNotch,
  WarningCircle,
  CheckCircle,
  UserPlus
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) {
      setErrorMessage("Gagal mendaftar dengan Google. Silakan coba lagi.");
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
      console.error(`[ERROR] Verifikasi OTP gagal: ${error.message}`);
      setErrorMessage("Kode OTP tidak valid atau sudah kadaluwarsa.");
      return;
    }

    console.log("[SUCCESS] Verifikasi OTP berhasil, mengalihkan ke dashboard...");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      className="w-full space-y-3"
    >
      
      {/* ── TAB SWITCHER (Login / Register) ── */}
      <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 mb-2.5">
        <Link
          href="/login"
          className="flex-1 text-center py-2.5 rounded-full font-semibold text-xs text-[#111111]/60 hover:text-[#111111] transition-all"
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="flex-1 text-center py-2.5 rounded-full font-bold text-xs bg-[#19382B] text-white shadow-xs transition-all"
        >
          Daftar
        </Link>
      </div>

      {/* Notifikasi Error */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3 py-2 flex items-start gap-2 shadow-xs mb-1.5"
        >
          <WarningCircle size={15} className="shrink-0 mt-0.5" weight="fill" />
          <span className="leading-relaxed text-[10.5px]">{errorMessage}</span>
        </motion.div>
      )}

      {step === "form" ? (
        <>
          <form onSubmit={handleRegister} className="space-y-2.5">
            
            {/* Username Input */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              <div className="relative bg-[#f8f9f5] border border-black/8 focus-within:border-[#19382B] focus-within:ring-2 focus-within:ring-[#19382B]/10 rounded-full px-4 py-2 flex items-center gap-3 transition-all">
                <User size={17} className="text-[#19382B]/60 shrink-0" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-[#111111]/35 leading-none mb-0.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="username_anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#111111]/20 placeholder:font-normal"
                  />
                </div>
              </div>
            </motion.div>

            {/* Nama Lengkap Input */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <div className="relative bg-[#f8f9f5] border border-black/8 focus-within:border-[#19382B] focus-within:ring-2 focus-within:ring-[#19382B]/10 rounded-full px-4 py-2 flex items-center gap-3 transition-all">
                <IdentificationCard size={17} className="text-[#19382B]/60 shrink-0" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-[#111111]/35 leading-none mb-0.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#111111]/20 placeholder:font-normal"
                  />
                </div>
              </div>
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              <div className="relative bg-[#f8f9f5] border border-black/8 focus-within:border-[#19382B] focus-within:ring-2 focus-within:ring-[#19382B]/10 rounded-full px-4 py-2 flex items-center gap-3 transition-all">
                <EnvelopeSimple size={17} className="text-[#19382B]/60 shrink-0" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-[#111111]/35 leading-none mb-0.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#111111]/20 placeholder:font-normal"
                  />
                </div>
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.25 }}
            >
              <div className="relative bg-[#f8f9f5] border border-black/8 focus-within:border-[#19382B] focus-within:ring-2 focus-within:ring-[#19382B]/10 rounded-full px-4 py-2 flex items-center gap-3 transition-all">
                <LockKey size={17} className="text-[#19382B]/60 shrink-0" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <label className="block text-[8px] font-bold uppercase tracking-widest text-[#111111]/35 leading-none mb-0.5">
                    Kata Sandi
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#111111]/25 placeholder:font-normal"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#111111]/30 hover:text-[#19382B] transition-colors p-0.5 shrink-0"
                  aria-label="Tampilkan sandi"
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Validation Requirements */}
              {password && (
                <div className="bg-[#ecefe6]/60 p-2 rounded-2xl space-y-1 text-[10px] mt-1 border border-black/5">
                  {passwordRequirements.map((req) => {
                    const passed = req.test(password);
                    return (
                      <div
                        key={req.id}
                        className={`flex items-center gap-1.5 font-medium ${
                          passed ? "text-[#19382B]" : "text-gray-400"
                        }`}
                      >
                        <CheckCircle
                          size={12}
                          weight={passed ? "fill" : "regular"}
                          className={passed ? "text-[#88d937]" : "text-gray-300"}
                        />
                        <span>{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.3 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#19382B] hover:bg-[#234A39] text-white py-3 px-5 rounded-full font-bold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} weight="bold" />
                  <span>Daftar Akun Baru</span>
                </>
              )}
            </motion.button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-black/8" />
            <span className="text-[10px] font-semibold text-[#111111]/35 uppercase tracking-widest">
              atau daftar dengan
            </span>
            <div className="flex-1 h-px bg-black/8" />
          </div>

          {/* ── Google Sign-Up ── */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="w-full bg-white border border-black/8 hover:bg-[#f8f9f5] py-3 rounded-full flex items-center justify-center gap-2.5 font-semibold text-sm text-[#111111] transition-all disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            <span>Daftar dengan Google</span>
          </button>
        </>
      ) : (
        /* OTP Step Form */
        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <div className="space-y-1">
            <div className="relative bg-[#f8f9f5] border border-black/8 focus-within:border-[#19382B] focus-within:ring-2 focus-within:ring-[#19382B]/10 rounded-full px-4 py-2.5 flex items-center gap-3">
              <LockKey size={17} className="text-[#19382B]/60 shrink-0" weight="duotone" />
              <div className="flex-1 min-w-0">
                <label className="block text-[8px] font-bold uppercase tracking-widest text-[#111111]/35 leading-none mb-0.5">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#111111] outline-none tracking-widest text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#19382B] hover:bg-[#234A39] text-white py-3 px-5 rounded-full font-bold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Verifikasi Kode OTP</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep("form")}
            className="w-full text-center text-xs font-semibold text-[#111111]/60 hover:text-[#19382B] transition-colors pt-0.5"
          >
            &larr; Kembali ke Form Pendaftaran
          </button>
        </form>
      )}

    </motion.div>
  );
}
