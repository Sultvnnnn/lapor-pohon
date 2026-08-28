"use client";

import { ReportItem } from "./SemarangRiskMap";
import { Tree, CheckCircle, MapPin, Storefront, HandPalm, Info, CalendarCheck } from "@phosphor-icons/react";

interface WoodCatalogCardProps {
  report: ReportItem;
  onClaim: (report: ReportItem) => void;
  onViewDetail: (report: ReportItem) => void;
  isClaiming?: boolean;
}

export const WoodCatalogCard = ({
  report,
  onClaim,
  onViewDetail,
  isClaiming = false,
}: WoodCatalogCardProps) => {
  const isSoldOut = !!report.claimed_by_name;
  const imageDisplay = report.proof_image_url || report.image_url;

  return (
    <div className="bg-white border border-black/5 hover:border-[#19382B]/30 rounded-[2rem] p-5 shadow-xs space-y-4 transition-all font-sans relative overflow-hidden group">
      {/* Gambar Kayu Hasil Penebangan Pemkot */}
      <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-[#f8f9f5] border border-black/5">
        {imageDisplay ? (
          <img
            src={imageDisplay}
            alt="Bukti Penebangan Kayu DLH"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-[#111111]/40">
            Bukti foto belum diunggah Admin
          </div>
        )}

        {/* Badge Status Sold Out / Siap Klaim */}
        <div className="absolute top-3 left-3">
          {isSoldOut ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-red-600 text-white shadow-sm border border-red-500">
              SOLD OUT / TERKLAIM
            </span>
          ) : (
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#88d937] text-[#111111] shadow-sm">
              SIAP DI-KLAIM UMKM
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[10px] font-bold flex items-center gap-1">
          <MapPin weight="bold" className="w-3 h-3 text-[#88d937]" />
          <span>Semarang</span>
        </div>
      </div>

      {/* Informasi Detail Kayu Pohon */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full inline-block">
              {report.tree_type || "Pohon Kayu Olahan"}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight mt-1 line-clamp-1">
              {report.admin_note || report.description || "Hasil Penebangan & Pemangkasan DLH Semarang"}
            </h4>
          </div>
        </div>

        {/* Info Ukuran Kayu & Biomassa */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-[#f8f9f5] border border-black/5 p-2.5 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/50 block">
              Volume Kayu
            </span>
            <span className="text-sm font-extrabold text-[#19382B]">
              {report.canopy_volume ? report.canopy_volume.toFixed(2) : "0.00"} m³
            </span>
          </div>

          <div className="bg-[#f8f9f5] border border-black/5 p-2.5 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]/50 block">
              Estimasi Biomassa
            </span>
            <span className="text-sm font-extrabold text-[#19382B]">
              {report.biomass_estimate ? report.biomass_estimate.toFixed(2) : "0.00"} kg
            </span>
          </div>
        </div>
      </div>

      {/* Baris Status Klaim / Tombol Aksi */}
      {isSoldOut ? (
        <div className="bg-[#ecefe6] border border-black/5 rounded-2xl p-3 text-center space-y-1">
          <span className="text-[11px] font-bold text-[#19382B] flex items-center justify-center gap-1.5">
            <Storefront weight="duotone" className="w-4 h-4" />
            Telah Di-klaim oleh:
          </span>
          <p className="text-xs font-black text-[#111111]">
            {report.claimed_by_name}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onClaim(report)}
            disabled={isClaiming}
            className="flex-1 bg-[#88d937] hover:bg-[#78c92a] text-[#111111] font-bold py-3 px-4 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 uppercase tracking-wider"
          >
            <HandPalm weight="bold" className="w-4 h-4" />
            <span>{isClaiming ? "Memproses Klaim..." : "KLAIM KAYU INI"}</span>
          </button>

          <button
            onClick={() => onViewDetail(report)}
            className="bg-[#ecefe6] hover:bg-gray-200 text-[#111111] font-bold p-3 rounded-full text-xs transition-all shadow-xs"
            title="Lihat Detail Lengkap"
          >
            <Info weight="bold" className="w-4 h-4 text-[#19382B]" />
          </button>
        </div>
      )}
    </div>
  );
};
