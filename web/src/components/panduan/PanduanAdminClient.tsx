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
    title: "Monitoring aduan pohon rawan warga",
    icon: ShieldCheck,
    tag: "Tahap 1 — Verifikasi aduan",
    badgeColor: "bg-[#ecefe6] text-[#19382B] border-black/5",
    description:
      "Admin dinas memantau aduan pohon kritis warga dari seluruh wilayah kota yang mendeteksi tingkat risiko bahaya, tingkat kerawanan, dan koordinat lokasi.",
    highlights: [
      "Periksa foto aduan warga dan analisis tingkat kerawanan.",
      "Verifikasi lokasi titik koordinat GPS pohon di peta interaktif.",
      "Ubah status laporan menjadi 'Terverifikasi dinas'.",
    ],
  },
  {
    step: 2,
    title: "Penjadwalan pemangkasan pohon dinas",
    icon: Calendar,
    tag: "Tahap 2 — Penjadwalan",
    badgeColor: "bg-white text-[#111111] border-black/10",
    description:
      "Petugas dinas menentukan tanggal dan jam penanganan eksekusi pemangkasan atau penebangan pohon di lapangan oleh regu operasional.",
    highlights: [
      "Pilih status 'Penjadwalan pemangkasan' di modal laporan.",
      "Tentukan tanggal & jam eksekusi lapangan pada kalender.",
      "Sistem secara otomatis mengabarkan jadwal penanganan ke warga.",
    ],
  },
  {
    step: 3,
    title: "Input spesifikasi biomassa kayu tebangan",
    icon: Tree,
    tag: "Tahap 3 — Penyelesaian & biomassa",
    badgeColor: "bg-[#ecefe6] text-[#19382B] border-black/5",
    description:
      "Setelah eksekusi tebangan selesai, admin mengunggah foto bukti penanganan dari galeri dan mencatat spesifikasi kayu tebangan.",
    highlights: [
      "Pilih status 'Selesai penanganan' dan unggah foto bukti lapangan.",
      "Isikan jenis kayu (misal: Jati/Mahoni), panjang (m), dan diameter (cm).",
      "Spesifikasi kayu otomatis dipublikasikan ke katalog UMKM kota.",
    ],
  },
  {
    step: 4,
    title: "Verifikasi tiket klaim & surat jalan digital UMKM",
    icon: Handshake,
    tag: "Tahap 4 — Verifikasi penjemputan",
    badgeColor: "bg-white text-[#111111] border-black/10",
    description:
      "Pelaku UMKM yang mengklaim kayu tebangan akan mendatangi titik tebangan membawa tiket klaim digital & surat jalan resmi dinas.",
    highlights: [
      "Buka menu navbar 'Serah terima kayu' (/admin/serah-terima).",
      "Cocokkan kode tiket klaim dan nama usaha UMKM.",
      "Periksa lokasi tebangan di peta dan identitas penerima.",
    ],
  },
  {
    step: 5,
    title: "Serah terima kayu & penutupan laporan resmi",
    icon: CheckCircle,
    tag: "Tahap 5 — Finalisasi & penutupan",
    badgeColor: "bg-[#ecefe6] text-[#19382B] border-black/5",
    description:
      "Petugas menekan tombol 'Verifikasi & serahkan', mengisikan catatan serah terima, dan laporan ditutup secara resmi.",
    highlights: [
      "Tekan tombol 'Verifikasi & serahkan' pada tabel serah terima.",
      "Masukkan catatan penyerahan kayu di lokasi tebangan.",
      "Status klaim diperbarui menjadi 'Sudah diserahkan' secara final.",
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
          Panduan operasional admin dinas
        </h1>
        <p className="text-xs sm:text-sm text-[#111111]/70 font-medium max-w-2xl leading-relaxed">
          Tata cara pengelolaan aduan pohon rawan, eksekusi lapangan, pencatatan biomassa kayu tebangan, dan verifikasi serah terima kayu UMKM.
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
                      : "bg-[#f8f9f5] hover:bg-[#ecefe6] text-[#111111] border-black/5"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? "bg-white text-[#19382B]"
                        : "bg-[#ecefe6] text-[#19382B]"
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
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ecefe6] border border-black/5 text-xs font-medium text-[#111111]"
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
