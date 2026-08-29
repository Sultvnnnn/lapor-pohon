"use client";

import { useState, useEffect } from "react";
import { ReportItem } from "./SemarangRiskMap";
import { TreeImageWithBoundingBox } from "@/components/TreeImageWithBoundingBox";
import {
  X,
  MapPin,
  Warning,
  Clock,
  CheckCircle,
  Tree,
  CalendarCheck,
  ShieldWarning,
  Info,
  HandPalm,
  Storefront,
} from "@phosphor-icons/react";

interface ReportDetailModalProps {
  report: ReportItem | null;
  onClose: () => void;
  onClaim?: (report: ReportItem) => void;
  isClaiming?: boolean;
}

export const ReportDetailModal = ({
  report,
  onClose,
  onClaim,
  isClaiming = false,
}: ReportDetailModalProps) => {
  const [addressName, setAddressName] = useState<string | null>(null);

  useEffect(() => {
    if (!report) {
      setAddressName(null);
      return;
    }

    const lat = typeof report.latitude === "number" ? report.latitude : parseFloat(String(report.latitude));
    const lng = typeof report.longitude === "number" ? report.longitude : parseFloat(String(report.longitude));

    if (isNaN(lat) || isNaN(lng)) return;

    let isMounted = true;

    const reverseGeocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const addr = data.address || {};
        const suburb = addr.suburb || addr.village || addr.neighbourhood || addr.quarter || addr.district || "";
        const city = addr.city || addr.town || addr.city_district || addr.county || addr.regency || "";
        const state = addr.state || "";

        const parts = [suburb, city, state].filter(Boolean);
        if (isMounted) {
          setAddressName(parts.length > 0 ? parts.join(", ") : data.display_name);
        }
      } catch {
        if (isMounted) setAddressName(null);
      }
    };

    reverseGeocode();

    return () => {
      isMounted = false;
    };
  }, [report]);

  if (!report) return null;

  const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
  const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

  let riskBg = "bg-[#19382B] text-white";
  let riskLabel = "Risiko Rendah / Aman";

  if (risk >= 60) {
    riskBg = "bg-red-600 text-white";
    riskLabel = "Kritis (Risiko Tinggi)";
  } else if (risk >= 30) {
    riskBg = "bg-amber-500 text-[#111111]";
    riskLabel = "Risiko Sedang";
  }

  const isCompleted = report.status === "completed" || report.status === "resolved";
  const isScheduled = report.status === "scheduled" || report.status === "in_progress" || !!report.scheduled_at;
  const isSoldOut = !!report.claimed_by_name;

  const displayImage = report.proof_image_url || report.image_url;
  const rawBoxes = report.bounding_box || report.bounding_boxes;
  const hasBoxes = Array.isArray(rawBoxes) && rawBoxes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-[2.25rem] p-6 sm:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Tree weight="fill" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Detail Pohon & Katalog Kayu
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ecefe6] text-[#19382B] inline-block mt-0.5">
                MONITORING RADAR LOKASI
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Gambar Laporan / Bukti Penebangan dengan Bounding Box AI */}
        {displayImage ? (
          <div className="relative w-full rounded-2xl overflow-hidden border border-black/10 shadow-xs bg-[#f8f9f5]">
            {hasBoxes && !report.proof_image_url ? (
              <TreeImageWithBoundingBox
                imageUrl={displayImage}
                boundingBoxes={rawBoxes}
                riskScore={risk}
                alt="Deteksi AI Bounding Box Pohon"
              />
            ) : (
              <img
                src={displayImage}
                alt="Foto Laporan Pohon / Bukti Penebangan"
                className="w-full h-52 sm:h-60 object-cover"
              />
            )}
            <div className="absolute top-3 left-3 z-10">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${riskBg}`}>
                {riskLabel} ({risk}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-36 bg-[#f8f9f5] border border-black/5 rounded-2xl flex items-center justify-center text-xs font-semibold text-[#111111]/40">
            Tidak ada foto lampiran
          </div>
        )}

        {/* Status Penindakan Petugas & Katalog Klaim */}
        <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]/50">
              Status Penindakan Petugas
            </span>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                isSoldOut
                  ? "bg-red-600 text-white"
                  : isCompleted
                  ? "bg-[#88d937] text-[#111111]"
                  : isScheduled
                  ? "bg-amber-500 text-[#111111]"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isSoldOut
                ? "TERKLAIM / SOLD OUT"
                : isCompleted
                ? "✓ Selesai Dipangkas (Siap Klaim)"
                : isScheduled
                ? "📅 Terjadwal Petugas"
                : "⚠️ Menunggu Penindakan"}
            </span>
          </div>

          {report.tree_type && (
            <div className="text-xs font-bold text-[#19382B] bg-[#ecefe6] p-2.5 rounded-xl">
              Jenis Pohon Kayu: <span className="font-extrabold text-[#111111]">{report.tree_type}</span>
            </div>
          )}

          {report.scheduled_at && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#19382B] bg-[#ecefe6] p-2.5 rounded-xl">
              <CalendarCheck weight="bold" className="w-4 h-4 text-[#19382B] shrink-0" />
              <span>
                Jadwal Eksekusi:{" "}
                {new Date(report.scheduled_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {report.admin_note && (
            <div className="text-xs text-[#111111]/80 font-medium italic bg-white p-3 rounded-xl border border-black/5">
              📝 Catatan Petugas Dinas: "{report.admin_note}"
            </div>
          )}
        </div>

        {/* Metrik Analisis AI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/50 block mb-1">
              Volume Kayu
            </span>
            <span className="text-xl font-extrabold text-[#19382B]">
              {report.canopy_volume ? report.canopy_volume.toFixed(2) : "0.00"} m³
            </span>
          </div>

          <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/50 block mb-1">
              Estimasi Biomassa
            </span>
            <span className="text-xl font-extrabold text-[#19382B]">
              {report.biomass_estimate ? report.biomass_estimate.toFixed(2) : "0.00"} kg
            </span>
          </div>
        </div>

        {/* Deskripsi & Lokasi Real (Nama Tempat Readability) */}
        <div className="space-y-3 text-xs text-[#111111]">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#111111]/50 flex items-center gap-1.5">
              <Info weight="bold" className="w-3.5 h-3.5 text-[#19382B]" />
              Deskripsi Laporan Warga
            </span>
            <p className="bg-[#f8f9f5] border border-black/5 p-3 rounded-xl leading-relaxed text-[#111111]/80 font-normal">
              {report.description || "Tidak ada deskripsi detail tambahan."}
            </p>
          </div>

          <div className="flex items-center justify-between bg-[#ecefe6] p-3 rounded-xl text-xs font-bold text-[#19382B]">
            <span className="flex items-center gap-1.5 shrink-0">
              <MapPin weight="bold" className="w-4 h-4 text-[#19382B]" />
              Lokasi Usaha / Area Pohon
            </span>
            <span className="font-semibold text-right text-[11px] text-[#111111]">
              {addressName || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
            </span>
          </div>
        </div>

        {/* Status Klaim / Tombol Klaim Kayu */}
        {isSoldOut ? (
          <div className="bg-[#ecefe6] border border-black/5 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-[#19382B] flex items-center justify-center gap-1.5">
              <Storefront weight="duotone" className="w-4 h-4 text-[#19382B]" />
              Kayu Telah Di-klaim oleh UMKM:
            </span>
            <p className="text-sm font-black text-[#111111]">
              {report.claimed_by_name}
            </p>
          </div>
        ) : isCompleted && onClaim ? (
          <button
            onClick={() => onClaim(report)}
            disabled={isClaiming}
            className="w-full bg-[#88d937] hover:bg-[#78c92a] text-[#111111] font-bold py-3.5 px-4 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            <HandPalm weight="bold" className="w-4 h-4" />
            <span>{isClaiming ? "Memproses Klaim..." : "KLAIM KAYU INI SEKARANG"}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
