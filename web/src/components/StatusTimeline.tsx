"use client";

import React from "react";
import {
  Clock,
  Calendar,
  CheckCircle,
  Eye,
  PaperPlaneTilt,
  ShieldCheck,
  HardHat,
  XCircle,
} from "@phosphor-icons/react";

export type ReportStatusItem = {
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_note?: string;
  proof_image_url?: string;
  scheduled_at?: string;
};

export const parseWibDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  try {
    let normalized = dateStr.trim();
    if (normalized.includes(" ") && !normalized.includes("T")) {
      normalized = normalized.replace(" ", "T");
    }
    if (!normalized.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(normalized)) {
      normalized += "Z";
    }
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const d = parseWibDate(dateStr);
    if (!d) return dateStr;
    return d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateStr;
  }
};

export const StatusTimeline: React.FC<{
  report: ReportStatusItem;
  onPreviewProof?: (url: string) => void;
}> = ({ report, onPreviewProof }) => {
  const s = (report.status || "").toLowerCase().trim();
  const createdAtFormatted = formatDate(report.created_at);
  const updatedAtFormatted = formatDate(report.updated_at);
  const scheduledAtFormatted = formatDate(report.scheduled_at);

  const isRejected = s.includes("ditolak") || s.includes("rejected") || s.includes("batal");
  const isCompleted = s.includes("selesai") || s.includes("resolved") || s.includes("completed");
  const isInProgress = s.includes("ditangani") || s.includes("progress");
  const isScheduled = s.includes("jadwal") || s.includes("penjadwalan") || s.includes("scheduled");
  const isVerified = s.includes("terverifikasi") || s.includes("verified");
  const isPending = s === "pending" || s.includes("menunggu") || s === "";

  let activeStep = 0;
  if (isCompleted) {
    activeStep = 3;
  } else if (isInProgress || isScheduled) {
    activeStep = 2;
  } else if (isVerified) {
    activeStep = 1;
  } else if (isPending) {
    activeStep = 0;
  }

  // Calculate distinct accurate timestamp for each step
  const hasDistinctUpdate = report.updated_at && report.created_at && report.updated_at !== report.created_at;

  const step0Time = createdAtFormatted;
  const step1Time = isRejected || activeStep >= 1 ? (hasDistinctUpdate ? updatedAtFormatted : createdAtFormatted) : null;
  const step2Time = isScheduled || isInProgress || activeStep >= 2 ? (scheduledAtFormatted || (hasDistinctUpdate ? updatedAtFormatted : null)) : null;
  const step3Time = isCompleted ? (hasDistinctUpdate ? updatedAtFormatted : createdAtFormatted) : null;

  const allSteps = [
    {
      id: 0,
      title: "Laporan Diterima Sistem",
      time: step0Time,
      desc: "Laporan pohon rawan telah berhasil dikirim oleh Warga dan masuk ke sistem DLH.",
      isUnlocked: true,
    },
    {
      id: 1,
      title: isRejected ? "Laporan Ditolak / Tidak Valid" : "Verifikasi & Penilaian Risiko DLH",
      time: step1Time,
      desc: isRejected
        ? report.admin_note || "Laporan tidak memenuhi kriteria verifikasi petugas DLH."
        : activeStep >= 1
        ? "Laporan telah terverifikasi oleh Dinas Lingkungan Hidup."
        : "",
      isUnlocked: isRejected || activeStep >= 1,
    },
    {
      id: 2,
      title: "Penjadwalan & Penanganan Lapangan",
      time: step2Time,
      desc: isInProgress
        ? "Tim lapangan DLH sedang berada di lokasi untuk tindakan pemangkasan/penebangan."
        : activeStep > 2
        ? "Penanganan teknis lapangan telah dilakukan."
        : "Petugas DLH telah mengonfirmasi jadwal penanganan lapangan.",
      scheduledAt: report.scheduled_at,
      isUnlocked: !isRejected && activeStep >= 2,
    },
    {
      id: 3,
      title: "Selesai Penanganan",
      time: step3Time,
      desc: isCompleted
        ? "Penanganan pohon rawan telah selesai dilaksanakan secara penuh oleh tim DLH."
        : "",
      proofUrl: isCompleted ? report.proof_image_url : undefined,
      isUnlocked: !isRejected && isCompleted,
    },
  ];

  // Reverse order so the LATEST updated status is displayed at the VERY TOP
  const visibleSteps = allSteps.filter((st) => st.isUnlocked).slice().reverse();

  return (
    <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4 sm:p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
          <Clock size={15} weight="bold" className="text-[#19382B]" />
          <span>Flow Pemantauan Status Aduan (Terbaru di Atas)</span>
        </h4>
        {report.updated_at && (
          <span className="text-[10px] font-semibold text-gray-500 bg-white border border-black/10 px-2.5 py-0.5 rounded-full shadow-2xs">
            Diperbarui: {updatedAtFormatted} WIB
          </span>
        )}
      </div>

      <div
        className={`relative pl-8 space-y-6 pt-1 ${
          visibleSteps.length > 1
            ? "before:absolute before:left-[11px] before:top-3.5 before:bottom-3.5 before:w-[2px] before:bg-gray-200"
            : ""
        }`}
      >
        {visibleSteps.map((step, idx) => {
          const isLatest = idx === 0;

          let iconElement = null;
          let nodeBg = "bg-gray-100 text-gray-400 border-gray-300";

          if (isRejected && step.id === 1) {
            nodeBg = "bg-red-500 text-white border-red-600 ring-4 ring-red-100";
            iconElement = <XCircle size={13} weight="bold" />;
          } else if (step.id === 0) {
            nodeBg = isLatest
              ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100"
              : "bg-[#19382B] text-white border-[#19382B]";
            iconElement = <PaperPlaneTilt size={12} weight="bold" />;
          } else if (step.id === 1) {
            nodeBg = isLatest
              ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100"
              : "bg-[#19382B] text-white border-[#19382B]";
            iconElement = <ShieldCheck size={13} weight="bold" />;
          } else if (step.id === 2) {
            nodeBg = isLatest
              ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100"
              : "bg-[#19382B] text-white border-[#19382B]";
            iconElement = <HardHat size={13} weight="bold" />;
          } else if (step.id === 3) {
            nodeBg = isLatest
              ? "bg-emerald-600 text-white border-emerald-600 ring-4 ring-emerald-100"
              : "bg-[#19382B] text-white border-[#19382B]";
            iconElement = <CheckCircle size={13} weight="fill" />;
          }

          return (
            <div key={step.id} className="relative group">
              {/* Step Icon Node — Perfectly centered on left-[11px] line */}
              <div
                className={`absolute -left-[32px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${nodeBg}`}
              >
                {iconElement}
              </div>

              {/* Step Content */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h5
                    className={`text-xs font-bold ${
                      isRejected && step.id === 1
                        ? "text-red-600 font-extrabold"
                        : isLatest
                        ? "text-[#19382B] font-extrabold text-sm"
                        : "text-[#111111]"
                    }`}
                  >
                    {step.title}
                  </h5>
                  {step.time && (
                    <span className="text-[10px] font-semibold text-gray-400 font-mono">
                      {step.time} WIB
                    </span>
                  )}
                </div>

                <p className="text-[11px] leading-relaxed text-gray-600 font-medium">
                  {step.desc}
                </p>

                {/* Scheduled Date attachment under Stage 2 */}
                {step.scheduledAt && (
                  <div className="mt-2 bg-amber-50/90 border border-amber-300 p-3 rounded-xl space-y-0.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Calendar size={14} weight="bold" className="text-amber-700" />
                      Jadwal Penanganan Pemangkasan DLH:
                    </p>
                    <p className="text-xs font-extrabold text-amber-950">
                      {(() => {
                        const d = parseWibDate(step.scheduledAt);
                        return d
                          ? d.toLocaleString("id-ID", {
                              timeZone: "Asia/Jakarta",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : step.scheduledAt;
                      })()}
                    </p>
                  </div>
                )}

                {/* Proof Image attachment under Stage 3 (Selesai Penanganan) */}
                {step.proofUrl && (
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} weight="fill" className="text-emerald-600" />
                        Foto Bukti Penanganan Lapangan (DLH)
                      </span>
                      {onPreviewProof && (
                        <span
                          onClick={() => onPreviewProof(step.proofUrl!)}
                          className="text-emerald-800 text-[9px] font-extrabold cursor-pointer"
                        >
                          🔍 Klik Perbesar
                        </span>
                      )}
                    </div>
                    <div
                      onClick={() => onPreviewProof && onPreviewProof(step.proofUrl!)}
                      className="rounded-xl overflow-hidden border-2 border-emerald-500/30 shadow-xs cursor-pointer group relative max-w-xs"
                      title="Klik untuk memperbesar foto bukti"
                    >
                      <img
                        src={step.proofUrl}
                        alt="Foto Bukti Penanganan"
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 pointer-events-none">
                        <Eye size={16} weight="bold" />
                        <span>Klik Perbesar</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
