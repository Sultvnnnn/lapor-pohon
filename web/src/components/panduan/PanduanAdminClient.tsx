"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Calendar,
  Tree,
  Handshake,
  CheckCircle,
  BookOpen,
  ArrowRight,
} from "@phosphor-icons/react";
import Link from "next/link";

const ADMIN_STEPS = [
  {
    step: 1,
    title: "Pantau Laporan Warga",
    icon: ShieldCheck,
    tag: "Tahap 1: Verifikasi Aduan",
    badgeColor: "bg-[#f8f9f5] text-[#19382B] border-black/10",
    description:
      "Admin bertugas memeriksa laporan baru yang masuk, termasuk melihat seberapa bahaya kondisi pohon dan lokasi tepatnya.",
    highlights: [
      "Cek foto dan detail laporan pohon dari warga.",
      "Pastikan titik lokasi pohon sudah sesuai di peta.",
      "Ubah status laporan menjadi 'Terverifikasi'.",
    ],
  },
  {
    step: 2,
    title: "Atur Jadwal Penanganan",
    icon: Calendar,
    tag: "Tahap 2: Penjadwalan",
    badgeColor: "bg-[#f8f9f5] text-[#19382B] border-black/10",
    description:
      "Tentukan waktu yang tepat untuk mengirim tim ke lokasi, baik untuk memangkas maupun menebang pohon.",
    highlights: [
      "Pilih status 'Jadwalkan Penanganan'.",
      "Tentukan tanggal dan waktu pelaksanaan tugas di lapangan.",
      "Sistem akan otomatis mengirimkan jadwal ini kepada pelapor.",
    ],
  },
  {
    step: 3,
    title: "Catat Data Kayu",
    icon: Tree,
    tag: "Tahap 3: Penyelesaian",
    badgeColor: "bg-[#f8f9f5] text-[#19382B] border-black/10",
    description:
      "Setelah tim selesai bekerja di lokasi, segera unggah foto bukti pengerjaan dan catat data kayu hasil tebangan.",
    highlights: [
      "Ubah status menjadi 'Selesai Penanganan' dan unggah foto buktinya.",
      "Masukkan detail kayu (contoh: jenis pohon, panjang, dan diameter).",
      "Data kayu ini akan langsung tampil di katalog UMKM.",
    ],
  },
  {
    step: 4,
    title: "Verifikasi Tiket UMKM",
    icon: Handshake,
    tag: "Tahap 4: Persiapan Penjemputan",
    badgeColor: "bg-[#f8f9f5] text-[#19382B] border-black/10",
    description:
      "Pastikan perwakilan UMKM yang datang mengambil kayu membawa tiket digital yang cocok dengan data di sistem.",
    highlights: [
      "Buka menu 'Serah Terima Kayu'.",
      "Cocokkan kode tiket dan nama usaha UMKM.",
      "Pastikan lokasi pengambilan dan identitas penerima sudah benar.",
    ],
  },
  {
    step: 5,
    title: "Serah Terima & Selesai",
    icon: CheckCircle,
    tag: "Tahap 5: Finalisasi",
    badgeColor: "bg-[#f8f9f5] text-[#19382B] border-black/10",
    description:
      "Selesaikan seluruh rangkaian proses dengan menyerahkan kayu kepada UMKM dan mencatat buktinya.",
    highlights: [
      "Klik tombol 'Verifikasi & Serahkan' pada tabel.",
      "Tambahkan catatan sebagai bukti penyerahan kayu di lokasi.",
      "Status laporan akan langsung diperbarui menjadi 'Selesai' secara permanen.",
    ],
  },
];

export function PanduanAdminClient() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = ADMIN_STEPS[activeStepIndex];
  const IconComponent = currentStep.icon;

  return (
    <div
      className="min-h-screen bg-[#f8f9f5] p-4 sm:p-6 lg:p-8 font-sans space-y-6 sm:space-y-8"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Header Banner */}
      <div className="max-w-5xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
          Panduan Operasional Admin
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/70 font-medium max-w-2xl leading-relaxed">
          Panduan lengkap mulai dari memantau laporan warga, mengatur jadwal penanganan, hingga proses serah terima kayu ke UMKM.
        </p>
      </div>

      {/* Main Step Walkthrough Container */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Step Selector Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-black/8 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-[#19382B] px-3 pt-2 block">
            Alur operasional admin (5 langkah)
          </span>

          <div className="space-y-1.5">
            {ADMIN_STEPS.map((item, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 border ${
                    isActive
                      ? "bg-[#19382B] text-white border-[#19382B] shadow-sm"
                      : "bg-[#f8f9f5] hover:bg-gray-100 text-[#111111] border-black/5"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? "bg-white text-[#19382B]"
                        : "bg-[#f8f9f5] text-[#19382B] border border-black/10"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="overflow-hidden min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-[#111111]"}`}>
                      {item.title}
                    </p>
                    <span
                      className={`text-[10px] font-medium block ${
                        isActive ? "text-gray-200" : "text-gray-500"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Detail Content Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-black/8 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold shrink-0">
                <IconComponent size={20} weight="fill" />
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block mb-1 ${currentStep.badgeColor}`}
                >
                  {currentStep.tag}
                </span>
                <h3 className="text-base font-bold text-[#111111] leading-snug">
                  Langkah {currentStep.step}: {currentStep.title}
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#111111]/80 font-medium leading-relaxed bg-[#f8f9f5] p-4 rounded-xl border border-black/5">
            {currentStep.description}
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#19382B]">
              Panduan langkah kerja petugas:
            </h4>
            <div className="space-y-2">
              {currentStep.highlights.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8f9f5] border border-black/8 text-xs font-medium text-[#111111]"
                >
                  <CheckCircle size={16} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
            <button
              type="button"
              disabled={activeStepIndex === 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(prev - 1, 0))}
              className="px-4 py-2 rounded-full border border-black/10 text-xs font-bold text-[#111111] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              ← Langkah sebelumnya
            </button>

            {activeStepIndex < ADMIN_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveStepIndex((prev) => Math.min(prev + 1, ADMIN_STEPS.length - 1))}
                className="px-5 py-2.5 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Langkah selanjutnya</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            ) : (
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-full bg-[#19382B] text-white hover:bg-[#234A39] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <ShieldCheck size={16} weight="bold" />
                <span>Buka panel admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
