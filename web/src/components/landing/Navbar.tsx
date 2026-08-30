"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tree, SignIn, Layout, List, X, Plant } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface NavLinkItem {
  name: string;
  href: string;
  id: string;
  isPage?: boolean;
}

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabaseClient = createClient();

  const dashboardHref = userRole === "admin" ? "/admin" : "/dashboard";

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      setIsLoggedIn(!!user);

      if (user) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        setUserRole(profile?.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Section list matching exact order with Tanam Pohon page link
  const navLinks: NavLinkItem[] = [
    { name: "Beranda", href: "/#beranda", id: "beranda" },
    { name: "Ekosistem", href: "/#ekosistem", id: "ekosistem" },
    { name: "Cara Kerja", href: "/#alur", id: "alur" },
    { name: "Solusi AI", href: "/#fitur", id: "fitur" },
    { name: "Tim Kami", href: "/#tim", id: "tim" },
    { name: "Tanam Pohon", href: "/penanaman", id: "penanaman", isPage: true },
  ];

  // Sync active section based on route & scroll
  useEffect(() => {
    if (pathname === "/penanaman") {
      setActiveSection("penanaman");
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      const sectionElements = navLinks
        .filter((link) => !link.isPage)
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

    if (pathname === "/") {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [pathname]);

  // Smooth scroll / navigation handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLinkItem) => {
    setIsMobileMenuOpen(false);

    if (link.isPage) {
      if (pathname === link.href) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (pathname !== "/") {
      return; // Let standard href /#id handle route transition
    }

    e.preventDefault();
    setActiveSection(link.id);

    const element = document.getElementById(link.id);
    if (element) {
      const yOffset = -85;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-7 sm:top-4 z-50 w-full px-4 sm:px-6 flex flex-col items-center pointer-events-none font-sans relative">
      <nav className="pointer-events-auto w-full max-w-[960px] bg-[#ecefe6]/90 backdrop-blur-md border border-black/10 text-[#111111] rounded-full p-1.5 sm:p-2 pl-2.5 sm:pl-3.5 pr-2 sm:pr-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all shadow-xs">
        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#19382B] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Tree size={18} weight="fill" />
          </div>
          <span className="font-bold text-[#111111] text-xs sm:text-sm tracking-tight pr-1 font-sans">
            LaporPohon
          </span>
        </Link>

        {/* Center: Desktop Pill Navigation Items */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5 relative">
          {navLinks.map((link: NavLinkItem) => {
            const isActive = activeSection === link.id || (link.isPage && pathname === link.href);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link)}
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
              href={dashboardHref}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5"
            >
              <Layout size={15} weight="bold" />
              <span>{userRole === "admin" ? "Dashboard Admin" : "Dashboard"}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-white/80 hover:bg-white text-[#111111] border border-black/10 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full text-[12px] font-bold transition-all flex items-center gap-1.5"
              >
                <SignIn size={15} weight="bold" />
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

        {/* Right Mobile: Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] transition-colors shrink-0"
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
            className="pointer-events-auto absolute top-full left-4 right-4 mt-2 max-w-[960px] mx-auto bg-[#ecefe6]/95 backdrop-blur-xl border border-black/10 text-[#111111] rounded-3xl p-4 flex flex-col gap-2 shadow-2xl md:hidden z-50"
          >
            {/* Section links list */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link: NavLinkItem) => {
                const isActive = activeSection === link.id || (link.isPage && pathname === link.href);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
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
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-[#19382B] text-white text-center py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Layout size={16} weight="bold" />
                  <span>{userRole === "admin" ? "Dashboard Admin Saya" : "Dashboard Saya"}</span>
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
