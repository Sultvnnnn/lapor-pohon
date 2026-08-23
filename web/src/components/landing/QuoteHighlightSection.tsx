"use client";

import { motion } from "framer-motion";
import { ArrowRight, User, Buildings, Storefront } from "@phosphor-icons/react";

export const QuoteHighlightSection = () => {
  return (
    <section className="py-20 sm:py-32 bg-[#f4f6f0] font-sans selection:bg-[#0b3d2c] selection:text-white">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

          {/* ========================================= */}
          {/* LEFT: MANIFESTO & SUMMARY (STICKY) */}
          {/* ========================================= */}
          <div className="lg:sticky lg:top-32 lg:w-5/12 space-y-6 lg:pb-20">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block">
              Mengapa LaporPohon?
            </span>

            {/* SECTION HEADER */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.3] sm:leading-[1.25]">
              Solusi Pintar <br />
              <span className="inline-block bg-[#ecefe6] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[#19382B] font-medium align-middle relative -top-0.5">Kota Aman &amp; Hijau.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed">
              LaporPohon tidak hanya mencegah kecelakaan akibat pohon tumbang, tetapi juga menciptakan manfaat nyata bagi warga dan mendukung perekonomian perajin lokal secara berkelanjutan.
            </p>

            <div className="pt-4">
              <a href="#fitur" className="group inline-flex items-center gap-3 text-[13px] font-bold text-[#111111] uppercase tracking-widest hover:text-[#0b3d2c] transition-colors">
                Jelajahi Solusi Kami
                <span className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center group-hover:bg-[#0b3d2c] group-hover:border-[#0b3d2c] group-hover:text-white transition-all">
                  <ArrowRight size={16} weight="bold" />
                </span>
              </a>
            </div>
          </div>

          {/* ========================================= */}
          {/* RIGHT: CASCADING STAKEHOLDER LIST */}
          {/* ========================================= */}
          <div className="lg:w-7/12 flex flex-col gap-6 w-full">

            {/* Stakeholder 01: Warga */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="group relative bg-white rounded-[2rem] p-8 sm:p-10 border border-black/5 flex flex-col sm:flex-row gap-8 items-start sm:items-center overflow-hidden hover:border-black/20 transition-colors"
            >
              {/* Giant Background Number */}
              <div className="absolute -right-6 -bottom-10 text-[10rem] font-black text-gray-50 leading-none select-none z-0 transition-transform duration-700 group-hover:scale-110">
                1
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-[#f4f6f0] flex items-center justify-center shrink-0 border border-black/5">
                <User size={28} className="text-[#111111]" weight="duotone" />
              </div>

              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl font-bold text-[#111111] tracking-tight">Warga Bebas Dari Rasa Khawatir</h3>
                <p className="text-sm text-[#111111]/70 leading-relaxed max-w-sm">
                  Jalanan dan lingkungan tempat tinggal lebih aman dari bahaya pohon tumbang saat hujan deras dan angin kencang.
                </p>
              </div>
            </motion.div>

            {/* Stakeholder 02: Dinas */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative bg-[#0b3d2c] rounded-[2rem] p-8 sm:p-10 border border-white/10 flex flex-col sm:flex-row gap-8 items-start sm:items-center overflow-hidden"
            >
              {/* Giant Background Number */}
              <div className="absolute -right-6 -bottom-10 text-[10rem] font-black text-white/5 leading-none select-none z-0 transition-transform duration-700 group-hover:scale-110">
                2
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-white backdrop-blur-md">
                <Buildings size={28} weight="duotone" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Penanganan Dinas Lebih Cepat</h3>
                  <span className="bg-[#88d937] text-[#111111] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Efisiensi AI</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed max-w-sm">
                  Petugas pertamanan mendapatkan urutan lokasi pohon paling rawan yang perlu segera dipangkas berdasarkan rekomendasi akurat AI.
                </p>
              </div>
            </motion.div>

            {/* Stakeholder 03: UMKM */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative bg-[#e3eed8] rounded-[2rem] p-8 sm:p-10 border border-[#0b3d2c]/10 flex flex-col sm:flex-row gap-8 items-start sm:items-center overflow-hidden hover:bg-[#dce8d0] transition-colors"
            >
              {/* Giant Background Number */}
              <div className="absolute -right-6 -bottom-10 text-[10rem] font-black text-white/40 leading-none select-none z-0 transition-transform duration-700 group-hover:scale-110">
                3
              </div>

              <div className="relative z-10 w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 border border-black/5 shadow-sm">
                <Storefront size={28} className="text-[#0b3d2c]" weight="duotone" />
              </div>

              <div className="relative z-10 space-y-3">
                <h3 className="text-2xl font-bold text-[#111111] tracking-tight">UMKM Perajin Kayu Berdaya</h3>
                <p className="text-sm text-[#111111]/70 leading-relaxed max-w-sm">
                  Mendapatkan pasokan kayu berkualitas sisa tebangan secara konsisten untuk diolah menjadi produk kerajinan bernilai ekonomi.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};