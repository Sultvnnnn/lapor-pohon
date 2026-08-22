"use client";

import Link from "next/link";
import { House, Leaf, GearSix, Tree, Users, SignIn } from "@phosphor-icons/react";

interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
  isActive?: boolean;
}

export const Navbar = () => {
  const navLinks: NavLinkItem[] = [
    { name: "Beranda", href: "#beranda", icon: House, isActive: true },
    { name: "Fitur AI", href: "#fitur", icon: Leaf },
    { name: "Alur Sirkular", href: "#alur", icon: GearSix },
    { name: "Ekosistem", href: "#ekosistem", icon: Leaf },
    { name: "Tim ITTS", href: "#tim", icon: Users },
  ];

  return (
    <nav className="w-full bg-white pt-6 pb-2 relative border-none">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">

        {/* Left: LaporPohon Brand Logo with White Tree Icon */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-[#19382B] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Tree size={20} weight="fill" />
          </div>
          <span className="font-semibold text-[#111111] text-[18px] tracking-tight">
            LaporPohon
          </span>
        </Link>

        {/* Center: Pill Navigation */}
        <div className="hidden lg:flex items-center gap-3">
          {navLinks.map((link: NavLinkItem) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-medium transition-transform hover:scale-105 ${
                  link.isActive
                    ? "bg-[#ecefe6] text-[#111111]"
                    : "bg-white border border-black/5 text-[#111111] hover:bg-[#ecefe6]/50"
                }`}
              >
                {link.name} <Icon size={16} weight="regular" />
              </a>
            );
          })}
        </div>

        {/* Right: Dark Forest CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:text-[#19382B] px-3 py-2"
          >
            <SignIn size={16} weight="bold" />
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-[#19382B] hover:bg-[#234A39] text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-[13px] sm:text-[14px] font-medium transition-colors shadow-sm flex items-center gap-1.5"
          >
            Daftar
          </Link>
        </div>

      </div>
    </nav>
  );
};