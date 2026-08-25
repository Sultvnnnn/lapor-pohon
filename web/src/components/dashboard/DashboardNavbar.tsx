"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Tree,
  SignOut,
  Layout,
  Leaf,
  MapTrifold,
  House,
  BookOpen,
  List,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavbarProps {
  userEmail?: string;
  userRole?: string;
}

/* ── 1. Desktop Sidebar Component (Fixed Floating Capsule + Floating Bubble Tooltips) ── */
export const DashboardSidebar = ({
  userEmail,
  userRole,
}: DashboardNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseClient = createClient();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col justify-between h-[calc(100vh-2rem)] sticky top-4 left-4 w-16 bg-white border border-black/5 shadow-xs rounded-[2rem] py-5 px-2.5 shrink-0 z-50 font-sans items-center overflow-visible">
      {/* ── Top: Brand Logo & Title ── */}
      <div className="flex flex-col gap-6 w-full items-center">
        {/* Brand Logo Link */}
        <div
          className="relative flex items-center justify-center"
          onMouseEnter={() => setHoveredItem("brand")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/?from=dashboard"
            className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center shadow-xs hover:scale-105 hover:bg-[#234A39] transition-all"
            title="Beranda Utama"
          >
            <Tree size={20} weight="fill" />
          </Link>

          {/* Floating Bubble Tooltip */}
          <AnimatePresence>
            {hoveredItem === "brand" && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10 flex flex-col gap-0.5"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                <span className="text-xs font-extrabold text-white tracking-tight">LaporPohon</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation Links ── */}
        <nav className="flex flex-col gap-3 w-full items-center">
          {/* Beranda Utama */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("beranda")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href="/?from=dashboard"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
              }`}
            >
              <House size={19} weight={pathname === "/" ? "fill" : "regular"} />
            </Link>

            <AnimatePresence>
              {hoveredItem === "beranda" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Beranda Utama</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Laporan AI */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("laporan")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href="/dashboard"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/dashboard"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
              }`}
            >
              <Layout size={19} weight={pathname === "/dashboard" ? "fill" : "regular"} />
            </Link>

            <AnimatePresence>
              {hoveredItem === "laporan" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Laporan AI</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panduan */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("panduan")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href="/panduan"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/panduan"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
              }`}
            >
              <BookOpen size={19} weight={pathname === "/panduan" ? "fill" : "regular"} />
            </Link>

            <AnimatePresence>
              {hoveredItem === "panduan" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Panduan</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Peta Sebaran */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("peta")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="w-10 h-10 rounded-full text-gray-400 opacity-60 flex items-center justify-center cursor-not-allowed">
              <MapTrifold size={19} weight="regular" />
            </div>

            <AnimatePresence>
              {hoveredItem === "peta" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10 flex items-center gap-2"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Peta Sebaran</span>
                  <span className="text-[9px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded-full">SEGERA</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Katalog Kayu */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("katalog")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="w-10 h-10 rounded-full text-gray-400 opacity-60 flex items-center justify-center cursor-not-allowed">
              <Leaf size={19} weight="regular" />
            </div>

            <AnimatePresence>
              {hoveredItem === "katalog" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10 flex items-center gap-2"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Katalog Kayu</span>
                  <span className="text-[9px] font-extrabold bg-white/20 px-1.5 py-0.5 rounded-full">SEGERA</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      {/* ── Bottom: User Profile & Sign Out ── */}
      <div className="flex flex-col gap-3 w-full items-center">
        {/* User Profile */}
        <div
          className="relative flex items-center justify-center"
          onMouseEnter={() => setHoveredItem("user")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="w-10 h-10 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center text-xs font-bold uppercase shadow-xs cursor-pointer hover:scale-105 transition-all">
            {userEmail ? userEmail[0] : "U"}
          </div>

          <AnimatePresence>
            {hoveredItem === "user" && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10 flex flex-col gap-0.5"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                <span className="text-xs font-extrabold text-white truncate max-w-[150px]">
                  {userEmail || "Pengguna"}
                </span>
                <span className="text-[9px] font-medium text-white/70 capitalize">
                  Peran: {userRole || "Warga"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign Out */}
        <div
          className="relative flex items-center justify-center"
          onMouseEnter={() => setHoveredItem("signout")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center hover:scale-105 transition-all"
            title="Keluar dari Akun"
          >
            <SignOut size={19} weight="bold" />
          </button>

          <AnimatePresence>
            {hoveredItem === "signout" && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-red-600 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap z-50 pointer-events-none border border-white/10"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-red-600" />
                <span>Keluar dari Akun</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

/* ── 2. Mobile Top Header Component ── */
export const DashboardNavbar = ({
  userEmail,
  userRole,
}: DashboardNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseClient = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-7 sm:top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none font-sans md:hidden">
      <nav className="pointer-events-auto w-full max-w-[1100px] bg-white/95 backdrop-blur-md border border-black/10 text-[#111111] rounded-full p-1.5 sm:p-2 pl-3 sm:pl-4 pr-2 sm:pr-2.5 flex items-center justify-between gap-2 transition-all shadow-sm">
        <Link
          href="/?from=dashboard"
          className="flex items-center gap-2.5 group shrink-0"
          title="Kembali ke Beranda"
        >
          <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Tree size={18} weight="fill" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-[#111111] text-xs sm:text-sm tracking-tight font-sans">
              LaporPohon
            </span>
          </div>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-all shadow-xs"
        >
          {isMobileMenuOpen ? (
            <X size={18} weight="bold" />
          ) : (
            <List size={18} weight="bold" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto mt-2 w-full max-w-[960px] bg-white/95 backdrop-blur-xl border border-black/10 text-[#111111] rounded-3xl p-4 flex flex-col gap-2.5 shadow-xl"
          >
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

            <div className="flex flex-col gap-1 pt-1">
              <Link
                href="/?from=dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  pathname === "/"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <House size={16} weight="bold" />
                <span>Beranda Utama</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  pathname === "/dashboard"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layout size={16} weight="bold" />
                  <span>Laporan AI</span>
                </div>
              </Link>
              <Link
                href="/panduan"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  pathname === "/panduan"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} weight="bold" />
                  <span>Panduan</span>
                </div>
              </Link>
            </div>

            <div className="h-px w-full bg-black/10 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-2xl border border-red-200/60"
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
