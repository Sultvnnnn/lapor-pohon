"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Storefront,
  Package,
  Ticket,
  NavigationArrow,
  CheckCircle,
  ArrowRight,
} from "@phosphor-icons/react";

export function PanduanUmkmClient() {
  return (
    <div
      className="max-w-[1050px] w-full mx-auto space-y-10 sm:space-y-14 pb-16 pt-2 sm:pt-6 px-4 sm:px-6 font-sans text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── 1. Header Minimalis ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-3 border-b border-black/5 pb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
          Panduan &amp; tutorial <span className="font-serif italic font-medium text-[#19382B]">UMKM kayu daur ulang</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/70 leading-relaxed max-w-2xl font-medium">
          Pelajari alur lengkap pemanfaatan biomassa kayu hasil pemeliharaan pohon oleh dinas lingkungan hidup untuk kebutuhan usaha dan kerajinan UMKM lokal.
        </p>
      </motion.div>

      {/* ── 2. Alur 5 Langkah Interaktif Pengambilan Kayu ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
            5 langkah alur klaim kayu tebangan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  1
                </span>
                <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                  Katalog
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                Jelajahi katalog kayu
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Buka menu <strong className="text-[#19382B]">Katalog kayu</strong> di dashboard untuk melihat stok pasokan kayu tebangan dari pohon tumbang atau pemangkasan dinas.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Package size={14} weight="bold" />
              <span>Cek spesifikasi &amp; berat kayu</span>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  2
                </span>
                <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                  Profil usaha
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                Pastikan identitas usaha UMKM terisi
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Klik ikon profil Anda untuk mengisi atau memperbarui nama usaha (*contoh: Kerajinan Kayu Mutiara Jati*) dan nomor WhatsApp usaha.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Storefront size={14} weight="bold" />
              <span>Profil usaha tampil di admin</span>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  3
                </span>
                <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                  Konfirmasi
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                Klik klaim &amp; konfirmasi
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Tekan tombol <strong className="text-[#19382B]">Klaim kayu ini</strong>. Pop-up konfirmasi akan menampilkan spesifikasi kayu, lokasi tebangan, dan identitas penerima.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <CheckCircle size={14} weight="bold" />
              <span>Konfirmasi klaim aman</span>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  4
                </span>
                <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                  Tiket digital
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                Terbit tiket digital &amp; surat jalan
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Setelah diklaim, Anda akan diarahkan ke halaman <strong className="text-[#19382B]">Klaim saya (/klaim)</strong>. Tiket klaim digital &amp; surat jalan terbit otomatis.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Ticket size={14} weight="bold" />
              <span>Kode tiket klaim</span>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border border-black/8 rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden flex flex-col justify-between md:col-span-2 lg:col-span-2"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#19382B] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  5
                </span>
                <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                  Penjemputan
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                Ambil kayu di titik tebangan
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Gunakan tombol <strong className="text-[#19382B]">Navigasi peta ke lokasi tebangan</strong> pada kartu klaim Anda untuk menuju ke lokasi persis penebangan pohon. Tunjukkan tiket digital saat pengambilan.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <NavigationArrow size={14} weight="bold" />
              <span>Navigasi langsung ke titik lokasi</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 3. Call to Action ── */}
      <div className="bg-[#19382B] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Siap mengambil kayu tebangan untuk usaha Anda?
          </h3>
          <p className="text-xs text-gray-300 max-w-md font-medium">
            Jelajahi stok pasokan kayu berkualitas hasil pemeliharaan pohon kota secara gratis.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-white hover:bg-gray-100 text-[#19382B] font-bold px-6 py-3 rounded-full text-xs transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <span>Buka katalog kayu</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
