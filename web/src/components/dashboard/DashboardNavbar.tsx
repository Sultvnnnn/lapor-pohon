"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tree, SignOut, User, Layout, Leaf, MapTrifold } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface DashboardNavbarProps {
  userEmail?: string;
  userRole?: string;
}

export const DashboardNavbar = ({ userEmail, userRole }: DashboardNavbarProps) => {
  const router = useRouter();
  const supabaseClient = createClient();

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full bg-white border-b border-black/5 sticky top-0 z-50">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-[#0b3d2c] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Tree size={20} weight="fill" />
          </div>
          <div>
            <span className="font-bold text-[#111111] text-lg tracking-tight">
              LaporPohon
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-[#0b3d2c] bg-[#88d937]/30 px-2 py-0.5 rounded-full">
              Dashboard
            </span>
          </div>
        </Link>

        {/* Quick Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
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

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecefe6] text-xs font-medium text-[#111111]">
            <div className="w-6 h-6 rounded-full bg-[#0b3d2c] text-[#e3f4d7] flex items-center justify-center text-[10px] font-bold uppercase">
              {userEmail ? userEmail[0] : "U"}
            </div>
            <div className="text-left">
              <p className="font-semibold text-xs leading-tight truncate max-w-[120px]">
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
      </div>
    </header>
  );
};
