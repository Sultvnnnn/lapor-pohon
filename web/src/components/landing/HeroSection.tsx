"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
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
    <section id="beranda" className="py-12 sm:py-12 bg-white overflow-hidden font-sans flex items-center min-h-[90vh]">
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
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#1a1a1a] leading-[1.2] sm:leading-[1.1]">
                Satu foto: laporkan pohon,
              </h1>

              {/* Tampilan Desktop: Kapsul foto di KIRI cegah bahaya (Posisi Asli Desktop) */}
              <div className="hidden sm:flex flex-wrap items-center gap-3 sm:gap-4 text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#1a1a1a] leading-[1.1]">
                <span className="inline-block w-20 h-10 sm:w-28 sm:h-[2.75rem] lg:w-36 lg:h-[3.25rem] rounded-full overflow-hidden shadow-inner border border-black/5 relative -top-1 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=400&auto=format&fit=crop"
                    className="w-full h-full object-cover"
                    alt="Pohon Hijau"
                  />
                </span>
                <span>cegah bahaya,</span>
              </div>

              {/* Tampilan Mobile: Kapsul foto di KIRI kota aman */}
              <div className="flex sm:hidden flex-wrap items-center gap-2 text-3xl font-medium tracking-tight text-[#1a1a1a] leading-[1.2]">
                <span>cegah bahaya,</span>
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-16 h-8 rounded-full overflow-hidden shadow-inner border border-black/5 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=400&auto=format&fit=crop"
                      className="w-full h-full object-cover"
                      alt="Pohon Hijau"
                    />
                  </span>
                  <span className="text-[#0b3d2c] italic font-serif text-4xl">kota aman.</span>
                </span>
              </div>

              {/* Tampilan Desktop Baris 3 & Paragraf Subteks (Posisi Asli Desktop) */}
              <div className="flex flex-col-reverse lg:flex-row lg:items-end justify-between gap-4 pt-2">
                <p className="text-[12px] sm:text-[13px] text-[#1a1a1a]/60 leading-relaxed max-w-[340px] sm:max-w-[440px] pb-1 sm:pb-2">
                  Platform pelaporan pohon berisiko. Kami membantu mendeteksi bahaya lebih cepat
                  dan menyalurkan sisa tebangannya untuk menghidupkan UMKM lokal
                </p>
                <h1 className="hidden sm:block text-3xl sm:text-4xl lg:text-6xl font-medium tracking-tight text-[#0b3d2c] leading-[1.1] italic font-serif">
                  kota aman.
                </h1>
              </div>
            </motion.div>

            {/* 2. BENTO GRID KIRI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 flex-1 items-stretch">

              {/* Card 1 (Mobile Order 1, Desktop Right Top): 01 Card - Clickable to /dashboard */}
              <Link
                href="/dashboard"
                className="order-1 sm:order-2 sm:col-start-2 sm:row-start-1 block group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#f4f5f0] group-hover:bg-[#eaece2] rounded-[1.75rem] p-5 flex flex-col justify-between h-36 sm:h-40 border border-black/5 group-hover:border-black/15 group-hover:shadow-lg transition-all duration-300 shrink-0 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-medium text-[#1a1a1a] group-hover:text-[#0b3d2c] transition-colors">
                      01
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1a1a1a] shadow-xs border border-black/5 group-hover:scale-110 group-hover:bg-[#88d937] group-hover:text-[#0b3d2c] transition-all">
                        <Camera size={15} weight="bold" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#0b3d2c] flex items-center justify-center text-white group-hover:bg-[#19382B] group-hover:scale-110 group-hover:translate-x-0.5 transition-all">
                        <ArrowRight size={14} weight="bold" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#1a1a1a]/50 uppercase tracking-widest block mb-1 group-hover:text-[#0b3d2c]/70 transition-colors">
                      Cara Mudah
                    </span>
                    <h3 className="text-base font-bold text-[#1a1a1a] group-hover:text-[#0b3d2c] transition-colors">
                      Foto &amp; Laporkan!
                    </h3>
                  </div>
                </motion.div>
              </Link>

              {/* Card 2 (Mobile Order 2, Desktop Left Full Column): Manfaat Utama Platform */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="order-2 sm:order-1 sm:col-start-1 sm:row-span-2 relative w-full rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm border border-black/5 flex flex-col justify-end p-3 h-full min-h-[320px]"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 rounded-[2.5rem] overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop')` }}
                />
                <div className="absolute inset-0 rounded-[2.5rem] bg-black/10" />

                {/* Kartu White Kasus Utama Melekat di Bawah Kontainer */}
                <div className="relative z-10 bg-white rounded-[1.75rem] p-4 sm:p-5 shadow-md border border-black/5 space-y-3">
                  <h4 className="text-[15px] font-bold text-[#1a1a1a]">Cegah Bahaya, Dukung UMKM</h4>
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

              {/* Card 3 (Mobile Order 3, Desktop Right Bottom): Limbah Kayu & Small Cards */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="order-3 sm:order-3 sm:col-start-2 sm:row-start-2 flex gap-3 sm:gap-4 h-full min-h-[140px]"
              >
                {/* Vertical Image Card */}
                <div className="flex-[1.2] bg-gray-100 rounded-[1.5rem] p-4 flex flex-col justify-between relative overflow-hidden border border-black/5 min-h-[130px]">
                  <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=300&auto=format&fit=crop')` }} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      <span className="bg-white/90 text-[#1a1a1a] text-[8px] font-bold px-2 py-1 rounded-full shadow-sm">#Sirkular</span>
                    </div>
                  </div>
                  <h4 className="relative z-10 text-[13px] font-bold text-[#1a1a1a]">Limbah Kayu Jadi Karya</h4>
                </div>

                {/* 2 Small Square Cards */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex-1 bg-white border border-black/5 rounded-2xl p-3.5 flex flex-col justify-center min-h-[60px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#111111]">Lacak Laporan</span>
                      <Sparkle size={12} className="text-[#88d937]" weight="fill" />
                    </div>
                    <p className="text-[9px] text-[#111111]/50 leading-snug">Pantau Status Laporan</p>
                  </div>
                  <div className="flex-1 bg-white border border-black/5 rounded-2xl p-3.5 flex flex-col justify-center min-h-[60px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-[#111111]">Manfaat UMKM</span>
                      <Recycle size={12} className="text-[#88d937]" weight="fill" />
                    </div>
                    <p className="text-[9px] text-[#111111]/50 leading-snug">Bahan Baku Gratis UMKM</p>
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
                <p className="text-[12px] text-white/80 leading-relaxed max-w-[220px] mb-8">
                  Jaga kota kita dari bahaya pohon tumbang, mulai dari langkah kecil.
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