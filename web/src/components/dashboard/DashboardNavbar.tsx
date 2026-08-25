"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tree,
  SignOut,
  Layout,
  Leaf,
  MapTrifold,
  House,
  List,
  X,
  Sparkle,
  ShieldCheck,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavbarProps {
  userEmail?: string;
  userRole?: string;
}

/* ── 1. Desktop Sidebar Component (Mewah & Interaktif ala DESIGN.md) ── */
export const DashboardSidebar = ({
  userEmail,
  userRole,
}: DashboardNavbarProps) => {
  const router = useRouter();
  const supabaseClient = createClient();

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 bg-white border-r border-black/5 p-5 shrink-0 z-40 font-sans shadow-xs relative overflow-hidden"
    >
      {/* Texture Background Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #19382B 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* ── Sidebar Header ── */}
      <div className="space-y-6 relative z-10">
        <Link
          href="/?from=dashboard"
          className="flex items-center gap-3 group px-1"
          title="Kembali ke Beranda Utama"
        >
          <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#234A39] transition-all">
            <Tree size={22} weight="fill" />
          </div>
          <div>
            <span className="font-bold text-[#111111] text-base tracking-tight block leading-tight group-hover:text-[#19382B] transition-colors">
              LaporPohon
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#19382B] bg-[#88d937]/30 px-2 py-0.5 rounded-full inline-block">
                Dashboard AI
              </span>
            </div>
          </div>
        </Link>

        {/* Live System Status Pill */}
        <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-2.5 flex items-center gap-2 text-[11px] font-medium text-[#111111]/70">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <span className="truncate">Sistem AI YOLOv8 Siap</span>
          <Sparkle size={12} weight="fill" className="text-[#88d937] shrink-0 ml-auto" />
        </div>

        {/* ── Sidebar Navigation Group ── */}
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/40 px-3 pb-1">
            Menu Utama
          </p>

          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <Link
              href="/?from=dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] transition-all group"
            >
              <House size={18} weight="bold" className="group-hover:scale-110 transition-transform" />
              <span>Beranda Utama</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }} className="relative">
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#19382B] text-white shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <Layout size={18} weight="bold" />
                <span>Laporan AI</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#88d937] animate-pulse" />
            </Link>
          </motion.div>

          {userRole === "admin" && (
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Link
                href="/admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#88d937] text-[#19382B] shadow-sm transition-all hover:bg-[#97e644]"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} weight="fill" />
                  <span>Panel Admin DLH</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#19382B] text-white px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </Link>
            </motion.div>
          )}

          <div className="opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-gray-400 bg-gray-50/50">
              <MapTrifold size={18} />
              <span>Peta Sebaran (Segera)</span>
            </div>
          </div>

          <div className="opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-gray-400 bg-gray-50/50">
              <Leaf size={18} />
              <span>Katalog Kayu (Segera)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar Footer / User Profile & Sign Out ── */}
      <div className="space-y-3 pt-4 border-t border-black/5 relative z-10">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#ecefe6]/60 border border-black/5 shadow-xs hover:bg-[#ecefe6] transition-colors">
          <div className="w-9 h-9 rounded-full bg-[#19382B] text-[#e3f4d7] flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-xs">
            {userEmail ? userEmail[0] : "U"}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="font-semibold text-xs text-[#111111] truncate leading-tight">
              {userEmail || "Pengguna"}
            </p>
            <p className="text-[10px] text-[#111111]/60 capitalize mt-0.5 font-medium">
              Peran: {userRole || "Warga"}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-2xl transition-all border border-red-200/60 shadow-xs"
        >
          <SignOut size={16} weight="bold" />
          <span>Keluar dari Akun</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

/* ── 2. Mobile Top Header Component (Dipertahankan 100% tanpa perubahan) ── */
export const DashboardNavbar = ({
  userEmail,
  userRole,
}: DashboardNavbarProps) => {
  const router = useRouter();
  const supabaseClient = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-7 sm:top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none font-sans">
      <nav className="pointer-events-auto w-full max-w-[1100px] bg-[#ecefe6]/90 backdrop-blur-md border border-black/10 text-[#111111] rounded-full p-1.5 sm:p-2 pl-3 sm:pl-4 pr-2 sm:pr-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all shadow-xs">
        {/* Left: Brand Logo & Title */}
        <Link
          href="/?from=dashboard"
          className="flex items-center gap-2.5 group shrink-0"
          title="Kembali ke Beranda Utama"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#19382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Tree size={18} weight="fill" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-[#111111] text-xs sm:text-sm tracking-tight font-sans">
              LaporPohon
            </span>
            <span className="ml-1.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#19382B] bg-[#88d937]/30 px-2 py-0.5 rounded-full">
              Dashboard
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
          <Link
            href="/?from=dashboard"
            className="px-3.5 py-1.5 rounded-full text-[12px] font-medium text-[#111111]/70 hover:text-[#19382B] hover:bg-white/50 transition-colors flex items-center gap-1.5"
          >
            <House size={15} weight="bold" />
            <span>Beranda Utama</span>
          </Link>
          <Link
            href="/dashboard"
            className="bg-[#19382B] text-white px-4 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Layout size={15} weight="bold" />
            <span>Laporan AI</span>
          </Link>
          <button
            disabled
            className="px-3 py-1.5 rounded-full text-[12px] font-medium text-[#111111]/40 flex items-center gap-1.5 cursor-not-allowed"
          >
            <MapTrifold size={15} />
            <span>Peta Sebaran</span>
          </button>
          <button
            disabled
            className="px-3 py-1.5 rounded-full text-[12px] font-medium text-[#111111]/40 flex items-center gap-1.5 cursor-not-allowed"
          >
            <Leaf size={15} />
            <span>Katalog Kayu</span>
          </button>
        </div>

        {/* Right Desktop: User Info & Sign Out */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-black/5 text-xs font-medium text-[#111111]">
            <div className="w-6 h-6 rounded-full bg-[#19382B] text-[#e3f4d7] flex items-center justify-center text-[10px] font-bold uppercase">
              {userEmail ? userEmail[0] : "U"}
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs leading-tight truncate max-w-[120px]">
                {userEmail || "Pengguna"}
              </p>
              <p className="text-[10px] text-[#111111]/60 capitalize leading-none">
                Role: {userRole || "Warga"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 sm:py-2 rounded-full transition-colors border border-red-200/60"
          >
            <SignOut size={15} weight="bold" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Right Mobile: Circular Dark Green Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-all shadow-xs"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <X size={18} weight="bold" />
          ) : (
            <List size={18} weight="bold" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Drawer Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto mt-2 w-full max-w-[960px] bg-[#ecefe6]/95 backdrop-blur-xl border border-black/10 text-[#111111] rounded-3xl p-4 flex flex-col gap-2.5 shadow-2xl md:hidden"
          >
            {/* User Profile Card inside Mobile Drawer */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-black/5">
              <div className="w-9 h-9 rounded-full bg-[#19382B] text-[#e3f4d7] flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {userEmail ? userEmail[0] : "U"}
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-semibold text-xs text-[#111111] truncate">
                  {userEmail || "Pengguna"}
                </p>
                <p className="text-[10px] text-[#111111]/60 capitalize">
                  Peran: {userRole || "Warga"}
                </p>
              </div>
            </div>

            {/* Navigation links list */}
            <div className="flex flex-col gap-1 pt-1">
              <Link
                href="/?from=dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#111111]/80 hover:bg-black/5 hover:text-[#111111] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <House size={16} weight="bold" />
                  <span>Beranda Utama</span>
                </div>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-[#19382B] text-white flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layout size={16} weight="bold" />
                  <span>Laporan AI</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#88d937]" />
              </Link>

              {userRole === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#88d937] text-[#19382B] flex items-center justify-between transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} weight="fill" />
                    <span>Panel Admin DLH</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#19382B] text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </Link>
              )}

              <button
                disabled
                className="px-4 py-2.5 rounded-2xl text-xs font-medium text-gray-400 bg-black/5 cursor-not-allowed text-left flex items-center gap-2 opacity-60"
              >
                <MapTrifold size={16} />
                <span>Peta Sebaran (Segera)</span>
              </button>

              <button
                disabled
                className="px-4 py-2.5 rounded-2xl text-xs font-medium text-gray-400 bg-black/5 cursor-not-allowed text-left flex items-center gap-2 opacity-60"
              >
                <Leaf size={16} />
                <span>Katalog Kayu (Segera)</span>
              </button>
            </div>

            <div className="h-px w-full bg-black/10 my-1" />

            {/* Sign Out Action Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-2xl transition-colors border border-red-200/60"
            >
              <SignOut size={16} weight="bold" />
              <span>Keluar dari Akun</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
