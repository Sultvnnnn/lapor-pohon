"use client";

import Link from "next/link";
import { Tree, ArrowUpRight, GithubLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react";

export const Footer = () => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -85;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white font-sans text-[#111111] pt-12 pb-8 border-t border-black/5 overflow-hidden relative">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">


        {/* FLOATING HERO CTA BANNER */}

        <div className="relative bg-[#f8f9f5] text-[#0b3d2c] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-sm border border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden group">

          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/40 rounded-full blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-150" />

          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white text-[#0b3d2c] inline-block shadow-sm">
              Mari Bersama Jaga Kota
            </span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#0b3d2c] leading-[1.1]">
              Temukan pohon berisiko <br className="hidden sm:block" />
              <span className="italic font-serif text-[#0b3d2c]/60">di sekitarmu?</span>
            </h3>
            <p className="text-sm sm:text-base text-[#0b3d2c]/70 leading-relaxed max-w-md pt-2">
              Laporkan sekarang. Bantu ciptakan lingkungan Kota Semarang yang lebih aman dan terlindungi.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            <Link
              href="/lapor"
              className="w-full sm:w-auto text-center bg-[#0b3d2c] text-white hover:bg-[#07291d] font-bold px-8 py-4 rounded-full text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Laporkan Pohon <ArrowUpRight size={18} weight="bold" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-white text-[#0b3d2c] hover:bg-gray-50 border border-black/5 font-bold px-8 py-4 rounded-full text-sm transition-all shadow-sm"
            >
              Daftar Akun UMKM
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. NAVIGATION & WATERMARK AREA */}
        {/* ========================================= */}
        <div className="relative py-6 sm:py-10">

          {/* GIANT WATERMARK (Posisi di belakang / ditimpa oleh teks menu) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
            <span className="text-[11vw] sm:text-[14vw] lg:text-[10vw] font-black tracking-tighter text-[#111111]/[0.04] leading-none">
              LAPORPOHON
            </span>
          </div>

          {/* MAIN FOOTER NAVIGATION (Posisi di depan / z-10) */}
          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">

            {/* Brand Info */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:pr-10">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0b3d2c] flex items-center justify-center text-[#e3f4d7] shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Tree size={18} weight="fill" />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#111111]">
                  LaporPohon.
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed max-w-sm">
                Platform kecerdasan buatan (AI YOLOv8) untuk pencegahan dini pohon rawan tumbang dan sistem distribusi sirkular limbah kayu untuk UMKM lokal Semarang.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <GithubLogo size={15} weight="bold" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <InstagramLogo size={15} weight="bold" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <LinkedinLogo size={15} weight="bold" />
                </a>
              </div>
            </div>

            {/* 3 GRID NAVIGATION COLUMNS (3 Kolom di Mobile & Desktop) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 lg:col-span-7 pt-2 md:pt-0">

              {/* Col 1: Platform */}
              <div className="space-y-3 sm:space-y-5">
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40">
                  Platform
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-[11px] sm:text-[13px] font-medium text-[#111111]/70">
                  <li><a href="#beranda" onClick={(e) => scrollToSection(e, "beranda")} className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Beranda</a></li>
                  <li><a href="#fitur" onClick={(e) => scrollToSection(e, "fitur")} className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Fitur AI</a></li>
                  <li><a href="#alur" onClick={(e) => scrollToSection(e, "alur")} className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Cara Kerja</a></li>
                  <li><a href="#ekosistem" onClick={(e) => scrollToSection(e, "ekosistem")} className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Stakeholder</a></li>
                </ul>
              </div>

              {/* Col 2: Layanan */}
              <div className="space-y-3 sm:space-y-5">
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40">
                  Layanan
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-[11px] sm:text-[13px] font-medium text-[#111111]/70">
                  <li><Link href="/lapor" className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Buat Lapor</Link></li>
                  <li><Link href="/login" className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Portal Dinas</Link></li>
                  <li><Link href="/register" className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Katalog UMKM</Link></li>
                  <li><a href="#fitur" onClick={(e) => scrollToSection(e, "fitur")} className="hover:text-[#0b3d2c] hover:font-bold transition-all block">Audit Replant</a></li>
                </ul>
              </div>

              {/* Col 3: Tim Pengembang */}
              <div className="space-y-3 sm:space-y-5">
                <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40">
                  Tim Kami
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-[11px] sm:text-[13px] font-medium text-[#111111]/70">
                  <li className="text-[#111111] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#88d937] shrink-0" /> DSDC 2026
                  </li>
                  <li>Mayang P.M.</li>
                  <li>Sultan A.F.</li>
                  <li>Sahrul S.</li>
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* 3. BOTTOM LEGAL BAR */}
        {/* ========================================= */}
        <div className="border-t border-black/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-[#111111]/40 uppercase tracking-widest relative z-10">
          <p>© 2026 LaporPohon MVP</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#111111] transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-[#111111] transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>

      </div>
    </footer>
  );
};