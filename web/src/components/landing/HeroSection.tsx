"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowsLeftRight,
  InstagramLogo,
  TwitterLogo,
  FacebookLogo,
  Sparkle,
  Tree,
  X,
  Recycle
} from "@phosphor-icons/react";

export const HeroSection = () => {
  return (
    <section id="beranda" className="py-8 sm:py-12 bg-white overflow-hidden font-sans flex items-center min-h-[90vh]">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* ==================================================== */}
        {/* LAYOUT UTAMA: KIRI (Judul + Grid) & KANAN (Kartu Tinggi) */}
        {/* ==================================================== */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 items-stretch">

          {/* AREA KIRI: Mengambil porsi ~70% layar */}
          <div className="flex-1 flex flex-col gap-5 sm:gap-6">

            {/* 1. HEADLINE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-1 lg:pr-8"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#1a1a1a] leading-[1.1]">
                Satu foto: laporkan pohon,
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#1a1a1a] leading-[1.1]">
                {/* Pill Image Inline */}
                <span className="inline-block w-20 h-10 sm:w-28 sm:h-[2.75rem] lg:w-36 lg:h-[3.25rem] rounded-full overflow-hidden shadow-inner border border-black/5 relative -top-1">
                  <img
                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=400&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt="Pohon Hijau"
                  />
                </span>
                <span>cegah bahaya,</span>

              </div>

              <div className="flex flex-col-reverse lg:flex-row lg:items-end justify-between gap-4 pt-2">
                <p className="text-[12px] sm:text-[13px] text-[#1a1a1a]/60 leading-relaxed max-w-[280px] pb-1 sm:pb-2">
                  Aplikasi cerdas pelaporan pohon rawan tumbang dengan AI deteksi risiko &amp; daur ulang kayu untuk UMKM lokal.
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#0b3d2c] leading-[1.1] italic font-serif">
                  kota aman.
                </h1>
              </div>
            </motion.div>

            {/* 2. BENTO GRID KIRI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 flex-1 items-stretch">

              {/* Kolom Kiri Bawah: Green Container dengan Cards Kasus Utama */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="relative w-full rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm border border-black/5 flex flex-col justify-end p-3 h-full min-h-[320px]"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0 rounded-[2.5rem] bg-black/10" />

                {/* Kartu White Kasus Utama Melekat di Bawah Kontainer */}
                <div className="relative z-10 bg-white rounded-[1.75rem] p-4 sm:p-5 shadow-md border border-black/5 space-y-3">
                  <h4 className="text-[15px] font-bold text-[#1a1a1a]">Manfaat Utama Platform</h4>
                  <div className="space-y-1">
                    <a href="#alur" className="flex items-center justify-between py-2 border-b border-black/5 group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="Thumb" />
                        </div>
                        <span className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">CEGAH BAHAYA POHON TUMBANG</span>
                      </div>
                      <ArrowRight size={14} className="text-[#1a1a1a]/40 group-hover:text-[#1a1a1a] transition-colors" />
                    </a>
                    <a href="#fitur" className="flex items-center justify-between py-2 group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                          <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" alt="Thumb" />
                        </div>
                        <span className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">KAYU TEBANGAN UNTUK UMKM CRAFT</span>
                      </div>
                      <ArrowRight size={14} className="text-[#1a1a1a]/40 group-hover:text-[#1a1a1a] transition-colors" />
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Kolom Kanan Bawah: 01 Card & Stacked Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col gap-4 sm:gap-5 h-full justify-between"
              >
                <div className="bg-[#f4f5f0] rounded-[1.75rem] p-5 flex flex-col justify-between h-36 sm:h-40 border border-black/5 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-medium text-[#1a1a1a]">01</span>
                    <div className="flex items-center gap-1.5">
                      <button className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-sm border border-black/5 hover:bg-gray-50">
                        <ArrowsLeftRight size={12} weight="bold" />
                      </button>
                      <Link href="/dashboard" className="w-7 h-7 rounded-full bg-[#0b3d2c] flex items-center justify-center text-white hover:bg-[#07291d] transition-all">
                        <ArrowRight size={12} weight="bold" />
                      </Link>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-widest block mb-1">Cara Mudah</span>
                    <h3 className="text-base font-bold text-[#1a1a1a]">Foto &amp; Laporkan Sekarang</h3>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4 flex-1">
                  {/* Vertical Image Card */}
                  <div className="flex-[1.2] bg-gray-100 rounded-[1.5rem] p-4 flex flex-col justify-between relative overflow-hidden border border-black/5">
                    <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=300&auto=format&fit=crop')` }} />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        <span className="bg-white/90 text-[#1a1a1a] text-[8px] font-bold px-2 py-1 rounded-full shadow-sm">#Sirkular</span>
                      </div>
                    </div>
                    <h4 className="relative z-10 text-[13px] font-bold text-[#1a1a1a]">Limbah Kayu ke UMKM</h4>
                  </div>

                  {/* 2 Small Square Cards */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex-1 bg-white border border-black/5 rounded-2xl p-3.5 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#111111]">Lacak Laporan</span>
                        <Sparkle size={12} className="text-[#88d937]" weight="fill" />
                      </div>
                      <p className="text-[9px] text-[#111111]/50 leading-snug">Pantau respon petugas</p>
                    </div>
                    <div className="flex-1 bg-white border border-black/5 rounded-2xl p-3.5 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#111111]">Manfaat UMKM</span>
                        <Recycle size={12} className="text-[#88d937]" weight="fill" />
                      </div>
                      <p className="text-[9px] text-[#111111]/50 leading-snug">Kayu untuk perajin lokal</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* AREA KANAN: Kartu Vertikal Tinggi */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:w-[320px] xl:w-[340px] shrink-0 h-[500px] lg:h-auto"
          >
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative shadow-md border border-black/5 bg-gray-100">

              <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="relative z-10 h-full p-6 lg:p-8 flex flex-col justify-end">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">Wujudkan<br />Kota Aman &amp; Hijau</h3>
                <p className="text-[12px] text-white/80 leading-relaxed max-w-[200px] mb-8">
                  Bersama menjaga lingkungan Kota Semarang dari bahaya pohon tumbang.
                </p>

                {/* Social Icons */}
                <div className="flex items-center gap-2">
                  <a href="#" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors shadow-sm">
                    <TwitterLogo size={14} weight="fill" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors shadow-sm">
                    <FacebookLogo size={14} weight="fill" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors shadow-sm">
                    <InstagramLogo size={14} weight="bold" />
                  </a>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};