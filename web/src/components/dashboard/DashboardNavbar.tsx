"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Tree,
  SignOut,
  Layout,
  House,
  BookOpen,
  List,
  X,
  ShieldCheck,
  Storefront,
  Ticket,
  Handshake,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { UmkmProfileModal } from "@/components/umkm/UmkmProfileModal";

interface DashboardNavbarProps {
  userEmail?: string;
  userRole?: string;
}

/* ── 1. Desktop Sidebar Component ── */
export const DashboardSidebar = ({
  userEmail,
  userRole,
}: DashboardNavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseClient = createClient();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const normalizedRole = userRole ? String(userRole).toLowerCase().trim() : "";
  const isAdmin = normalizedRole === "admin";
  const isUmkm = normalizedRole === "umkm" || normalizedRole.includes("umkm");

  return (
    <aside className="hidden md:flex flex-col justify-between h-[calc(100vh-2rem)] sticky top-4 left-4 w-16 bg-white border border-black/5 shadow-sm rounded-2xl py-5 px-2.5 shrink-0 z-50 font-sans items-center overflow-visible">
      {/* ── Top: Brand Logo & Navigation Links ── */}
      <div className="flex flex-col gap-6 w-full items-center">
        {/* Brand Logo Link */}
        <div
          className="relative flex items-center justify-center"
          onMouseEnter={() => setHoveredItem("brand")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href={isUmkm ? "/dashboard" : isAdmin ? "/admin" : "/?from=dashboard"}
            className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center shadow-sm hover:scale-105 hover:bg-[#234A39] transition-all"
            title={isUmkm ? "Dashboard UMKM" : isAdmin ? "Dashboard Admin" : "Beranda utama"}
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
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10 flex flex-col gap-0.5"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                <span className="text-xs font-bold text-white tracking-tight">LaporPohon</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation Links ── */}
        <nav className="flex flex-col gap-3 w-full items-center">
          {/* Landing Page (Semua Role) */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("landing")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href="/?from=dashboard"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/"
                  ? "bg-[#19382B] text-white shadow-sm"
                  : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
              }`}
            >
              <House size={19} weight={pathname === "/" ? "fill" : "regular"} />
            </Link>

            <AnimatePresence>
              {hoveredItem === "landing" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>Beranda</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dashboard / Katalog (Khusus Warga & UMKM, Admin menggunakan /admin) */}
          {!isAdmin && (
            <div
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredItem("dashboard")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href="/dashboard"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  pathname === "/dashboard"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
                }`}
              >
                {isUmkm ? (
                  <Storefront size={19} weight={pathname === "/dashboard" ? "fill" : "regular"} />
                ) : (
                  <Layout size={19} weight={pathname === "/dashboard" ? "fill" : "regular"} />
                )}
              </Link>

              <AnimatePresence>
                {hoveredItem === "dashboard" && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.92 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
                  >
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                    <span>{isUmkm ? "Katalog kayu UMKM" : "Dashboard aduan"}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Klaim Saya (UMKM) */}
          {isUmkm && (
            <div
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredItem("klaim-umkm")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href="/klaim"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  pathname === "/klaim"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
                }`}
              >
                <Ticket size={19} weight={pathname === "/klaim" ? "fill" : "regular"} />
              </Link>

              <AnimatePresence>
                {hoveredItem === "klaim-umkm" && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.92 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
                  >
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                    <span>Klaim saya &amp; tiket digital</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Admin Panel & Serah Terima */}
          {isAdmin && (
            <>
              <div
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredItem("admin")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href="/admin"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    pathname === "/admin"
                      ? "bg-[#19382B] text-white shadow-sm"
                      : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
                  }`}
                >
                  <ShieldCheck size={19} weight={pathname === "/admin" ? "fill" : "regular"} />
                </Link>

                <AnimatePresence>
                  {hoveredItem === "admin" && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.92 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10 flex items-center gap-1.5"
                    >
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                      <span>Panel admin dinas</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredItem("serah-terima")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href="/admin/serah-terima"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    pathname === "/admin/serah-terima"
                      ? "bg-[#19382B] text-white shadow-sm"
                      : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
                  }`}
                >
                  <Handshake size={19} weight={pathname === "/admin/serah-terima" ? "fill" : "regular"} />
                </Link>

                <AnimatePresence>
                  {hoveredItem === "serah-terima" && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.92 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.92 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
                    >
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                      <span>Serah terima kayu</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Panduan Link */}
          <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setHoveredItem("panduan")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              href={isUmkm ? "/panduan-umkm" : isAdmin ? "/panduan-admin" : "/panduan"}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                pathname === "/panduan" || pathname === "/panduan-umkm" || pathname === "/panduan-admin"
                  ? "bg-[#19382B] text-white shadow-sm"
                  : "text-[#111111]/70 hover:bg-[#ecefe6] hover:text-[#19382B] hover:scale-105"
              }`}
            >
              <BookOpen size={19} weight={pathname === "/panduan" || pathname === "/panduan-umkm" || pathname === "/panduan-admin" ? "fill" : "regular"} />
            </Link>

            <AnimatePresence>
              {hoveredItem === "panduan" && (
                <motion.div
                  initial={{ opacity: 0, x: -8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.92 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
                >
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                  <span>{isUmkm ? "Panduan UMKM" : isAdmin ? "Panduan admin" : "Panduan penggunaan"}</span>
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
          <button
            type="button"
            onClick={() => {
              if (isUmkm) setIsProfileModalOpen(true);
            }}
            className={`w-10 h-10 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center text-xs font-bold uppercase shadow-sm transition-all border border-black/10 ${
              isUmkm ? "cursor-pointer hover:scale-110 hover:bg-[#19382B] hover:text-white active:scale-95" : "cursor-default"
            }`}
            title={isUmkm ? "Klik untuk kelola profil usaha UMKM" : (userEmail || "Pengguna")}
          >
            {userEmail ? userEmail[0] : "U"}
          </button>

          <AnimatePresence>
            {hoveredItem === "user" && (
              <motion.div
                initial={{ opacity: 0, x: -8, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.92 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10 flex flex-col gap-0.5"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                <span className="text-xs font-bold text-white truncate max-w-[170px]">
                  {userEmail || "Pengguna"}
                </span>
                <span className="text-[10px] font-medium text-[#88d937] block pt-0.5">
                  {isUmkm ? "Klik kelola profil usaha" : `Peran: ${normalizedRole || "Warga"}`}
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
            className="w-10 h-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 flex items-center justify-center hover:scale-105 transition-all"
            title="Keluar akun"
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
                className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#19382B] text-white px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold whitespace-nowrap z-[9999] pointer-events-none border border-white/10"
              >
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-[#19382B]" />
                <span>Keluar akun</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <UmkmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
      />
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const normalizedRole = userRole ? String(userRole).toLowerCase().trim() : "";
  const isAdmin = normalizedRole === "admin";
  const isUmkm = normalizedRole === "umkm" || normalizedRole.includes("umkm");

  return (
    <header className="sticky top-4 z-30 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none font-sans md:hidden relative">
      <nav className="pointer-events-auto w-full max-w-[1100px] bg-white/95 backdrop-blur-md border border-black/10 text-[#111111] rounded-full p-1.5 pl-3 pr-2 flex items-center justify-between gap-2 transition-all shadow-sm">
        <Link
          href={isUmkm ? "/dashboard" : isAdmin ? "/admin" : "/?from=dashboard"}
          className="flex items-center gap-2.5 group shrink-0"
          title="Kembali ke beranda"
        >
          <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
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
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-all shadow-sm cursor-pointer"
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
            className="pointer-events-auto absolute top-full left-4 right-4 mt-2 max-w-[960px] mx-auto bg-white/95 backdrop-blur-xl border border-black/10 text-[#111111] rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm z-50"
          >
            <div
              onClick={() => {
                if (isUmkm) {
                  setIsProfileModalOpen(true);
                  setIsMobileMenuOpen(false);
                }
              }}
              className={`flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-black/5 transition-all ${
                isUmkm ? "hover:bg-[#19382B]/5 cursor-pointer" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {userEmail ? userEmail[0] : "U"}
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="font-semibold text-xs text-[#111111] truncate">
                  {userEmail || "Pengguna"}
                </p>
                <p className="text-[10px] text-[#19382B] font-medium">
                  {isUmkm ? "Kelola profil usaha UMKM" : `Peran: ${normalizedRole || "Warga"}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              {/* Landing Page (Semua Role) */}
              <Link
                href="/?from=dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                  pathname === "/"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <House size={16} weight="bold" />
                <span>Beranda</span>
              </Link>
              {!isAdmin && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[#19382B] text-white shadow-sm"
                      : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isUmkm ? <Storefront size={16} weight="bold" /> : <Layout size={16} weight="bold" />}
                    <span>{isUmkm ? "Katalog kayu UMKM" : "Dashboard aduan"}</span>
                  </div>
                </Link>
              )}
              {isUmkm && (
                <Link
                  href="/klaim"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    pathname === "/klaim"
                      ? "bg-[#19382B] text-white shadow-sm"
                      : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Ticket size={16} weight="bold" />
                    <span>Klaim saya &amp; tiket digital</span>
                  </div>
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      pathname === "/admin"
                        ? "bg-[#19382B] text-white shadow-sm"
                        : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} weight="bold" />
                      <span>Panel admin dinas</span>
                    </div>
                  </Link>
                  <Link
                    href="/admin/serah-terima"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      pathname === "/admin/serah-terima"
                        ? "bg-[#19382B] text-white shadow-sm"
                        : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Handshake size={16} weight="bold" />
                      <span>Serah terima kayu</span>
                    </div>
                  </Link>
                </>
              )}
              <Link
                href={isUmkm ? "/panduan-umkm" : isAdmin ? "/panduan-admin" : "/panduan"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  pathname === "/panduan" || pathname === "/panduan-umkm" || pathname === "/panduan-admin"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} weight="bold" />
                  <span>{isUmkm ? "Panduan UMKM" : isAdmin ? "Panduan admin" : "Panduan penggunaan"}</span>
                </div>
              </Link>
            </div>

            <div className="h-px w-full bg-black/10 my-1" />

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl border border-black/5"
            >
              <SignOut size={16} weight="bold" />
              <span>Keluar akun</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <UmkmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
      />
    </header>
  );
};
