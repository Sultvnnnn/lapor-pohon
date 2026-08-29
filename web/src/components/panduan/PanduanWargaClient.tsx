"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle,
  XCircle,
  ArrowRight,
  Lightning,
  Check,
  X,
} from "@phosphor-icons/react";

export function PanduanWargaClient() {
  return (
    <div
      className="max-w-[1000px] w-full mx-auto space-y-10 sm:space-y-14 pb-16 pt-2 sm:pt-6 px-4 sm:px-6 font-sans text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── 1. Header Minimalis ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
          Panduan <span className="font-serif italic font-medium text-[#19382B]">LaporPohon</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed max-w-lg font-medium pr-2 sm:pr-0">
          Ikuti panduan ringkas ini agar foto pohon rawan yang kamu kirim dapat dianalisis dengan cepat dan akurat.
        </p>
      </motion.div>

      {/* ── 2. Alur Pelaporan (Grid Card Putih Bersih) ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <Lightning size={20} weight="fill" className="text-[#19382B]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
            Alur pelaporan warga
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Langkah 1 */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              1
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111111] mb-1.5">
                Potret pohon
              </h3>
              <p className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                Buka menu kamera, izinkan akses lokasi GPS, lalu ambil foto kondisi pohon rawan secara langsung.
              </p>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              2
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111111] mb-1.5">
                Analisis instan
              </h3>
              <p className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                Sistem akan menganalisis tingkat kemiringan, kanopi, dan bahaya pohon secara otomatis dalam hitungan detik.
              </p>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              3
            </span>
            <div>
              <h3 className="font-bold text-base text-[#111111] mb-1.5">
                Pantau status petugas
              </h3>
              <p className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                Cek status penanganan petugas dinas kota dan penyaluran kayu daur ulang ke UMKM secara transparan.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 3. Tips Mengambil Foto (Clean White Cards) ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <Camera size={20} weight="fill" className="text-[#19382B]" />
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
            Tips pengambilan foto pohon
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Card: Do's */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-black/5">
              <div className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center shrink-0">
                <Check size={18} weight="bold" />
              </div>
              <h3 className="font-bold text-base text-[#111111]">
                Yang benar
              </h3>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-[#111111]/70 font-medium">
              <li className="flex items-start gap-3">
                <CheckCircle size={18} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>Foto utuh seluruh bagian pohon dari pangkal hingga atas.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>Pastikan pencahayaan terang (tidak membelakangi matahari).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>Kamera fokus agar hasil foto tajam dan jelas.</span>
              </li>
            </ul>
          </div>

          {/* Card: Don'ts */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-black/5">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                <X size={18} weight="bold" />
              </div>
              <h3 className="font-bold text-base text-[#111111]">
                Yang dihindari
              </h3>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-[#111111]/70 font-medium">
              <li className="flex items-start gap-3">
                <XCircle size={18} weight="fill" className="text-gray-500 shrink-0 mt-0.5" />
                <span>Terlalu dekat (hanya terlihat sebagian kecil batang).</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle size={18} weight="fill" className="text-gray-500 shrink-0 mt-0.5" />
                <span>Kondisi gelap gulita tanpa cahaya yang memadai.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle size={18} weight="fill" className="text-gray-500 shrink-0 mt-0.5" />
                <span>Objek menghalangi (mobil, tiang, dll) terlalu banyak.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* ── 4. CTA Box (Mulai Buat Laporan) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#19382B] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm mt-4"
      >
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="font-bold text-lg sm:text-xl text-white">
            Sudah paham caranya?
          </h3>
          <p className="text-xs sm:text-sm text-white/70 font-medium">
            Langsung buat laporan pohon rawan pertamamu.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-white hover:bg-gray-100 text-[#19382B] px-6 py-3 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 active:scale-95"
        >
          <span>Mulai pemindaian</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </motion.div>
    </div>
  );
}
