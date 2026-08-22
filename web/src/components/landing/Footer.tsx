"use client";

import Link from "next/link";
import { Tree, ArrowUpRight, GithubLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <footer className="bg-white font-sans text-[#111111] pt-12 pb-8 border-t border-black/5 overflow-hidden relative">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 relative z-10">

        {/* ========================================= */}
        {/* 1. FLOATING HERO CTA BANNER */}
        {/* ========================================= */}
        {/* Pewarnaan diubah jadi hijau pastel yang segar dengan teks hijau pekat */}
        <div className="relative bg-[#f8f9f5] text-[#0b3d2c] rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-sm border border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden group">

          {/* Efek aksen warna saat di-hover */}
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
        <div className="relative py-10">

          {/* GIANT WATERMARK (Posisi di belakang / ditimpa oleh teks menu) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
            <span className="text-[16vw] lg:text-[10vw] font-black tracking-tighter text-[#111111]/[0.05] leading-none">
              LAPORPOHON
            </span>
          </div>

          {/* MAIN FOOTER NAVIGATION (Posisi di depan / z-10) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 relative z-10">

            {/* Col 1 & 2: Brand Info */}
            <div className="lg:col-span-5 space-y-6 lg:pr-10">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-[#0b3d2c] flex items-center justify-center text-[#e3f4d7] shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <Tree size={20} weight="fill" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#111111]">
                  LaporPohon.
                </span>
              </Link>
              <p className="text-[13px] sm:text-sm text-[#111111]/60 leading-relaxed max-w-sm">
                Platform kecerdasan buatan (AI YOLOv8) untuk pencegahan dini pohon rawan tumbang dan sistem distribusi sirkular limbah kayu untuk UMKM lokal Semarang.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <GithubLogo size={16} weight="bold" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <InstagramLogo size={16} weight="bold" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#f4f6f0] flex items-center justify-center text-[#111111] hover:bg-[#0b3d2c] hover:text-white transition-colors border border-black/5">
                  <LinkedinLogo size={16} weight="bold" />
                </a>
              </div>
            </div>

            {/* Col 3: Navigasi Platform */}
            <div className="lg:col-span-2 space-y-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111]/40">
                Platform
              </h4>
              <ul className="space-y-3 text-[13px] font-medium text-[#111111]/70">
                <li><a href="#beranda" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Beranda Utama</a></li>
                <li><a href="#fitur" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Fitur AI Deteksi</a></li>
                <li><a href="#alur" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Cara Kerja Sistem</a></li>
                <li><a href="#ekosistem" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Stakeholder</a></li>
              </ul>
            </div>

            {/* Col 4: Layanan Sirkular */}
            <div className="lg:col-span-2 space-y-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111]/40">
                Layanan
              </h4>
              <ul className="space-y-3 text-[13px] font-medium text-[#111111]/70">
                <li><Link href="/lapor" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Buat Laporan</Link></li>
                <li><Link href="/login" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Portal Dinas</Link></li>
                <li><Link href="/register" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Katalog UMKM</Link></li>
                <li><a href="#fitur" className="hover:text-[#0b3d2c] hover:font-bold transition-all">Audit Replant</a></li>
              </ul>
            </div>

            {/* Col 5: Pengembang */}
            <div className="lg:col-span-3 space-y-5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#111111]/40">
                Tim Pengembang
              </h4>
              <ul className="space-y-3 text-[13px] font-medium text-[#111111]/70">
                <li className="text-[#111111] font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88d937]" /> DSDC ANFORCOM 2026
                </li>
                <li>ITTS Tangerang Selatan</li>
                <li>Mayang Putri Mutiara</li>
                <li>Sultan Abdul Fatah</li>
                <li>Sahrul Solihin</li>
              </ul>
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