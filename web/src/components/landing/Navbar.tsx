"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tree, SignIn, Layout, List, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface NavLinkItem {
  name: string;
  href: string;
  id: string;
}

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabaseClient = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Section list matching exact order in page.tsx
  const navLinks: NavLinkItem[] = [
    { name: "Beranda", href: "#beranda", id: "beranda" },
    { name: "Ekosistem", href: "#ekosistem", id: "ekosistem" },
    { name: "Alur Kerja", href: "#alur", id: "alur" },
    { name: "Solusi AI", href: "#fitur", id: "fitur" },
    { name: "Tim Kami", href: "#tim", id: "tim" },
  ];

  // ScrollSpy: Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      const sectionElements = navLinks
        .map((link) => document.getElementById(link.id))
        .filter(Boolean) as HTMLElement[];

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler with header offset calculation
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    setIsMobileMenuOpen(false);

    const element = document.getElementById(id);
    if (element) {
      const yOffset = -85;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none font-sans">
      <nav className="pointer-events-auto w-full max-w-[960px] bg-[#ecefe6]/90 backdrop-blur-md border border-black/10 text-[#111111] rounded-full p-1.5 sm:p-2 pl-2.5 sm:pl-3.5 pr-2 sm:pr-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all">

        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#19382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Tree size={18} weight="fill" />
          </div>
          <span className="font-bold text-[#111111] text-xs sm:text-sm tracking-tight pr-1 font-sans">
            LaporPohon
          </span>
        </Link>

        {/* Center: Desktop Pill Navigation Items with Smooth Active Sliding Highlight */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5 relative">
          {navLinks.map((link: NavLinkItem) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${isActive ? "text-white font-semibold" : "text-[#111111]/70 hover:text-[#111111]"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill-highlight"
                    className="absolute inset-0 bg-[#19382B] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </a>
            );
          })}
        </div>

        {/* Right Desktop: Pill CTA Buttons */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5"
            >
              <Layout size={15} weight="bold" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#111111]/80 hover:text-[#19382B] px-3 py-1.5 transition-colors"
              >
                <SignIn size={14} weight="bold" />
                <span>Masuk</span>
              </Link>
              <Link
                href="/register"
                className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Right Mobile: 3-Line Hamburger Button (replaces Daftar on mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-all"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
        </button>

      </nav>

      {/* Mobile Drawer Dropdown Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto mt-2 w-full max-w-[960px] bg-[#ecefe6]/95 backdrop-blur-xl border border-black/10 text-[#111111] rounded-3xl p-4 flex flex-col gap-2 shadow-2xl md:hidden"
          >
            {/* Section links list */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link: NavLinkItem) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-colors ${isActive
                        ? "bg-[#19382B] text-white"
                        : "text-[#111111]/80 hover:bg-black/5 hover:text-[#111111]"
                      }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#88d937]" />}
                  </a>
                );
              })}
            </div>

            <div className="h-px w-full bg-black/10 my-1" />

            {/* Mobile CTA buttons */}
            <div className="flex items-center gap-2 pt-1">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-[#19382B] text-white text-center py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Layout size={16} weight="bold" />
                  <span>Dashboard Saya</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 bg-white text-[#111111] border border-black/10 text-center py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <SignIn size={16} weight="bold" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 bg-[#19382B] text-white text-center py-2.5 rounded-2xl text-xs font-bold"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
