"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tree, ArrowLeft } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname?.includes("login");

  return (
    <div className="min-h-screen bg-[#ecefe6] text-[#111111] font-sans flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden selection:bg-[#88d937] selection:text-[#111111]">

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #19382B 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#19382B]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#88d937]/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] mb-4 relative z-10 px-1"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-black/8 flex items-center justify-center text-[#19382B] transition-all hover:scale-105 active:scale-95"
            aria-label="Kembali ke Beranda"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-[#19382B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Tree size={14} weight="fill" className="text-[#88d937]" />
            </div>
            <span className="font-bold text-[#19382B] text-sm tracking-tight">
              LaporPohon
            </span>
          </Link>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-[#19382B] tracking-tight leading-tight">
            {isLogin ? "Selamat datang kembali!" : "Bergabung dengan LaporPohon"}
          </h1>
          <p className="text-xs text-[#19382B]/55 leading-relaxed mt-1 max-w-xs">
            {isLogin
              ? "Masuk untuk pantau laporan pohon & peta AI kamu."
              : "Buat akun baru dan mulai jaga kota Semarang bersama."}
          </p>
        </div>
      </motion.div>

      {/* ── CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        className="w-full max-w-[400px] bg-white rounded-[2rem] border border-black/6 p-5 sm:p-6 relative z-20"
        style={{ boxShadow: "0 8px 40px rgba(25,56,43,0.10), 0 1px 4px rgba(0,0,0,0.04)" }}
      >
        {children}

        {/* Footer dalam card */}
        <div className="pt-3 mt-4 border-t border-black/5 text-center text-[10px] text-[#111111]/35 font-medium">
          © {new Date().getFullYear()} LaporPohon · Selaras & Berkelanjutan.
        </div>
      </motion.div>

    </div>
  );
}
