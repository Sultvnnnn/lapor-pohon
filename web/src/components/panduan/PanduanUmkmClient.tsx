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
          Panduan Klaim Kayu
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/70 leading-relaxed max-w-2xl font-medium">
          Ikuti 5 langkah mudah di bawah ini untuk mengambil pasokan kayu bagi usaha Anda.
        </p>
      </motion.div>

      {/* ── 2. Alur 5 Langkah Interaktif Pengambilan Kayu ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
            5 Langkah Mudah Klaim Kayu
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
                <span className="text-[10px] font-bold text-[#111111] bg-[#f8f9f5] px-2.5 py-0.5 rounded-full border border-black/10">
                  Katalog
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                1. Pilih Kayu di Katalog
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Buka menu Katalog untuk melihat stok kayu yang tersedia. Anda bisa mengecek jenis dan ukuran kayu di sana.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Package size={14} weight="bold" />
              <span>Cek stok &amp; ukuran kayu</span>
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
                <span className="text-[10px] font-bold text-[#111111] bg-[#f8f9f5] px-2.5 py-0.5 rounded-full border border-black/10">
                  Profil usaha
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                2. Lengkapi Profil Usaha
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Klik ikon profil untuk melengkapi nama usaha dan nomor WhatsApp agar petugas mudah menghubungi Anda.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Storefront size={14} weight="bold" />
              <span>Profil usaha lengkap</span>
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
                <span className="text-[10px] font-bold text-[#111111] bg-[#f8f9f5] px-2.5 py-0.5 rounded-full border border-black/10">
                  Klaim
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                3. Klaim Kayu
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Tekan tombol Klaim. Pastikan Anda sudah mengecek ukuran kayu dan lokasi pengambilannya.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <CheckCircle size={14} weight="bold" />
              <span>Klaim langsung</span>
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
                <span className="text-[10px] font-bold text-[#111111] bg-[#f8f9f5] px-2.5 py-0.5 rounded-full border border-black/10">
                  Tiket digital
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                4. Dapatkan Tiket Digital
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Setelah berhasil diklaim, tiket digital dan surat jalan akan otomatis muncul di menu Klaim Saya.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <Ticket size={14} weight="bold" />
              <span>Tiket digital terbit</span>
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
                <span className="text-[10px] font-bold text-[#111111] bg-[#f8f9f5] px-2.5 py-0.5 rounded-full border border-black/10">
                  Penjemputan
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#111111] leading-snug">
                5. Ambil Kayu di Lokasi
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Datang ke lokasi tebangan menggunakan panduan peta di aplikasi. Tunjukkan tiket digital Anda kepada petugas di sana.
              </p>
            </div>
            <div className="pt-2 border-t border-black/5 flex items-center gap-1.5 text-[11px] font-bold text-[#19382B]">
              <NavigationArrow size={14} weight="bold" />
              <span>Panduan peta lokasi</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── 3. Panduan Lengkap Pengisian Profil & Detail Usaha UMKM ── */}
      <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#19382B] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Storefront size={20} weight="fill" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#111111] leading-snug">
              Cara Melengkapi Detail &amp; Profil Usaha UMKM
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Lengkapi data profil usaha Anda agar nama usaha tercetak otomatis pada Tiket Digital dan Surat Jalan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white border border-black/5 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#19382B] block">
              1. Akses Ikon Profil
            </span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Klik tombol avatar / ikon profil lingkaran pengguna pada navigasi aplikasi di sebelah kiri atau atas.
            </p>
          </div>

          <div className="bg-white border border-black/5 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#19382B] block">
              2. Isi Formulir Profil Usaha
            </span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Isikan <strong>Nama Usaha</strong>, <strong>Jenis Olahan Kayu</strong> (seperti mebel atau kerajinan), dan <strong>Nomor WhatsApp</strong> aktif.
            </p>
          </div>

          <div className="bg-white border border-black/5 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#19382B] block">
              3. Simpan Profil Usaha
            </span>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Tekan tombol <strong>Simpan Profil</strong>. Nama usaha Anda akan otomatis langsung muncul di Dashboard dan Tiket Klaim.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Call to Action ── */}
      <div className="bg-[#19382B] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Siap mencari bahan baku?
          </h3>
          <p className="text-xs text-gray-300 max-w-md font-medium">
            Cek katalog sekarang dan dapatkan kayu tebangan secara gratis untuk usaha Anda.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="bg-white hover:bg-gray-100 text-[#19382B] font-bold px-6 py-3 rounded-full text-xs transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <span>Lihat Katalog Kayu</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
