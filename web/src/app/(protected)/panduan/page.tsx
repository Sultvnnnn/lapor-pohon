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

export default function PanduanPage() {
    return (
        <div
            className="max-w-[1000px] w-full mx-auto space-y-10 sm:space-y-14 pb-16 pt-2 sm:pt-6 px-4 sm:px-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* ── 1. Header Minimalis (Senada dengan Dashboard) ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
            >
                <h1 className="text-3xl sm:text-4xl lg:text-[2rem] font-bold tracking-tight text-[#111111] leading-tight">
                    Panduan <span className="font-serif italic font-medium text-[#19382B]">LaporPohon.</span>
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#111111]/60 leading-relaxed max-w-lg font-medium pr-2 sm:pr-0">
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
                        Alur Pelaporan
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Langkah 1 */}
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <span className="w-8 h-8 rounded-full bg-[#19382B] text-[#c8f78a] font-bold text-sm flex items-center justify-center shadow-xs">
                            1
                        </span>
                        <div>
                            <h3 className="font-bold text-base text-[#111111] mb-1.5">
                                Potret Pohon
                            </h3>
                            <p className="text-[13px] text-[#111111]/70 leading-relaxed font-medium">
                                Buka menu Kamera, izinkan akses lokasi, lalu ambil foto kondisi pohon secara langsung.
                            </p>
                        </div>
                    </div>

                    {/* Langkah 2 */}
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <span className="w-8 h-8 rounded-full bg-[#19382B] text-[#c8f78a] font-bold text-sm flex items-center justify-center shadow-xs">
                            2
                        </span>
                        <div>
                            <h3 className="font-bold text-base text-[#111111] mb-1.5">
                                Analisis Instan
                            </h3>
                            <p className="text-[13px] text-[#111111]/70 leading-relaxed font-medium">
                                Sistem akan menilai tingkat kemiringan & bahaya pohon secara otomatis dalam hitungan detik.
                            </p>
                        </div>
                    </div>

                    {/* Langkah 3 */}
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                        <span className="w-8 h-8 rounded-full bg-[#19382B] text-[#c8f78a] font-bold text-sm flex items-center justify-center shadow-xs">
                            3
                        </span>
                        <div>
                            <h3 className="font-bold text-base text-[#111111] mb-1.5">
                                Pantau Status
                            </h3>
                            <p className="text-[13px] text-[#111111]/70 leading-relaxed font-medium">
                                Cek tab "Laporan Saya" untuk memantau proses petugas dan penyaluran kayu daur ulang.
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
                        Tips Pengambilan Foto
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Card: Do's */}
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 sm:p-8 space-y-5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check size={18} weight="bold" />
                            </div>
                            <h3 className="font-bold text-base text-[#111111]">
                                Yang Benar
                            </h3>
                        </div>
                        <ul className="space-y-4 text-[13px] sm:text-sm text-[#111111]/70 font-medium">
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>Foto utuh seluruh bagian pohon dari pangkal hingga atas.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>Pastikan pencahayaan terang (tidak membelakangi matahari).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>Kamera fokus agar hasil foto tajam dan jelas.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Card: Don'ts */}
                    <div className="bg-white border border-black/5 rounded-[1.5rem] p-6 sm:p-8 space-y-5 shadow-xs">
                        <div className="flex items-center gap-3 pb-3 border-b border-black/5">
                            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <X size={18} weight="bold" />
                            </div>
                            <h3 className="font-bold text-base text-[#111111]">
                                Yang Dihindari
                            </h3>
                        </div>
                        <ul className="space-y-4 text-[13px] sm:text-sm text-[#111111]/70 font-medium">
                            <li className="flex items-start gap-3">
                                <XCircle size={18} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                                <span>Terlalu dekat (hanya terlihat sebagian kecil batang).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle size={18} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
                                <span>Kondisi gelap gulita tanpa cahaya yang memadai.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <XCircle size={18} weight="fill" className="text-red-500 shrink-0 mt-0.5" />
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
                className="bg-[#19382B] rounded-[1.5rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs mt-4"
            >
                <div className="space-y-1.5 text-center sm:text-left">
                    <h3 className="font-bold text-lg sm:text-xl text-white">
                        Sudah Paham Caranya?
                    </h3>
                    <p className="text-[13px] sm:text-sm text-white/70 font-medium">
                        Langsung buat laporan pohon rawan pertamamu.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="bg-[#c8f78a] hover:bg-[#d8f99d] text-[#19382B] px-6 py-3.5 rounded-full text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-2 shrink-0 active:scale-95"
                >
                    <span>Mulai Pemindaian</span>
                    <ArrowRight size={16} weight="bold" />
                </Link>
            </motion.div>
        </div>
    );
}