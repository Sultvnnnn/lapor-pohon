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
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavbarProps {
  userEmail?: string;
  userRole?: string;
}

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
    <header className="w-full bg-white border-b border-black/5 sticky top-0 z-50">
      <div className="max-w-325 mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        {/* Brand Logo - Links back to Landing Page (/) */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group"
          title="Kembali ke Beranda Utama"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0b3d2c] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Tree size={18} weight="fill" className="sm:hidden" />
            <Tree size={20} weight="fill" className="hidden sm:block" />
          </div>
          <div>
            <span className="font-bold text-[#111111] text-base sm:text-lg tracking-tight">
              LaporPohon
            </span>
            <span className="ml-1.5 sm:ml-2 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#0b3d2c] bg-[#88d937]/30 px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full">
              Dashboard
            </span>
          </div>
        </Link>

        {/* Desktop Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#ecefe6] hover:bg-[#e2e7d8] text-[#111111] transition-colors"
          >
            <House size={16} weight="bold" />
            Beranda Utama
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#0b3d2c] text-white transition-colors"
          >
            <Layout size={16} weight="bold" />
            Laporan AI
          </Link>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            <MapTrifold size={16} />
            Peta Sebaran (Segera)
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
          >
            <Leaf size={16} />
            Katalog Kayu (Segera)
          </button>
        </nav>

        {/* User Info & Sign Out (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecefe6] text-xs font-medium text-[#111111]">
            <div className="w-6 h-6 rounded-full bg-[#0b3d2c] text-[#e3f4d7] flex items-center justify-center text-[10px] font-bold uppercase">
              {userEmail ? userEmail[0] : "U"}
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs leading-tight truncate max-w-30">
                {userEmail || "Pengguna"}
              </p>
              <p className="text-[10px] text-[#111111]/60 capitalize">
                Role: {userRole || "Warga"}
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-full transition-colors border border-red-200"
          >
            <SignOut size={16} weight="bold" />
            Keluar
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 text-[#111111] hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <X size={22} weight="bold" />
          ) : (
            <List size={22} weight="bold" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#ecefe6]/50">
            <div className="w-8 h-8 rounded-full bg-[#0b3d2c] text-[#e3f4d7] flex items-center justify-center text-xs font-bold uppercase">
              {userEmail ? userEmail[0] : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-xs text-[#111111] truncate">
                {userEmail || "Pengguna"}
              </p>
              <p className="text-[10px] text-[#111111]/60 capitalize">
                Peran: {userRole || "Warga"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#ecefe6] text-[#111111]"
            >
              <House size={18} weight="bold" />
              Beranda Utama
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0b3d2c] text-white"
            >
              <Layout size={18} weight="bold" />
              Laporan AI
            </Link>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 bg-gray-50 cursor-not-allowed text-left"
            >
              <MapTrifold size={18} />
              Peta Sebaran (Segera)
            </button>
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-400 bg-gray-50 cursor-not-allowed text-left"
            >
              <Leaf size={18} />
              Katalog Kayu (Segera)
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition-colors border border-red-100"
            >
              <SignOut size={16} weight="bold" />
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
