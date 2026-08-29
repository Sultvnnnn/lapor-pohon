"use client";

import { ReportItem } from "./SemarangRiskMap";
import { Tree, CheckCircle, MapPin, Storefront, HandPalm, Info, Package, ShieldCheck } from "@phosphor-icons/react";

export type BiomassCatalogItem = {
  id: string;
  report_id: string;
  wood_type: string;
  volume_kg: number;
  status: "available" | "claimed" | "sold_out" | string;
  claimed_by?: string | null;
  claimed_by_name?: string | null;
  created_at: string;
  updated_at: string;
  reports?: ReportItem | null;
};

interface WoodCatalogCardProps {
  item: BiomassCatalogItem;
  onClaim: (item: BiomassCatalogItem) => void;
  onViewDetail: (report: ReportItem) => void;
  isClaiming?: boolean;
}

export const WoodCatalogCard = ({
  item,
  onClaim,
  onViewDetail,
  isClaiming = false,
}: WoodCatalogCardProps) => {
  const report = item.reports;
  const isSoldOut = item.status === "claimed" || item.status === "sold_out" || !!item.claimed_by_name;
  const imageDisplay = report?.proof_image_url || report?.image_url;

  return (
    <div className="bg-white border border-black/8 hover:border-[#19382B]/40 rounded-2xl sm:rounded-[2rem] p-2.5 sm:p-5 shadow-xs space-y-2.5 sm:space-y-4 transition-all duration-300 font-sans relative overflow-hidden group hover:shadow-md flex flex-col justify-between">
      <div className="space-y-2 sm:space-y-3.5">
        {/* Gambar Kayu Hasil Penebangan Pemkot */}
        <div className="relative w-full h-28 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden bg-[#f8f9f5] border border-black/5">
          {imageDisplay ? (
            <img
              src={imageDisplay}
              alt="Bukti Penebangan Kayu DLH"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] sm:text-xs font-semibold text-[#111111]/40 gap-1 p-2 text-center">
              <Package size={20} className="text-[#19382B]/30 sm:w-7 sm:h-7" />
              <span className="line-clamp-2">Belum ada foto</span>
            </div>
          )}

          {/* Badge Status Sold Out / Siap Klaim */}
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
            {isSoldOut ? (
              <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-600 text-white shadow-sm border border-red-500 inline-flex items-center gap-1">
                <CheckCircle size={10} weight="fill" className="sm:w-3 sm:h-3" />
                <span>TERKLAIM</span>
              </span>
            ) : (
              <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#88d937] text-[#111111] shadow-sm border border-black/10 inline-flex items-center gap-1">
                <ShieldCheck size={10} weight="fill" className="sm:w-3 sm:h-3" />
                <span>SIAP KLAIM</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-[#19382B]/80 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-white text-[8px] sm:text-[10px] font-bold hidden sm:flex items-center gap-1 border border-white/10 shadow-xs">
            <MapPin weight="bold" className="w-3 h-3 text-[#88d937]" />
            <span>Terverifikasi</span>
          </div>
        </div>

        {/* Informasi Detail Kayu Pohon */}
        <div className="space-y-1 sm:space-y-2">
          <div>
            <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#19382B] bg-[#ecefe6] px-2 sm:px-2.5 py-0.5 rounded-full inline-block border border-black/5 truncate max-w-full">
              {item.wood_type || report?.tree_type || "Pohon Kayu Olahan"}
            </span>
            <h4 className="text-xs sm:text-base font-extrabold text-[#111111] tracking-tight mt-1 line-clamp-1 group-hover:text-[#19382B] transition-colors">
              {report?.admin_note || report?.description || "Katalog Kayu Penebangan DLH"}
            </h4>
          </div>

          {/* Info Ukuran Kayu & Biomassa (volume_kg) */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs pt-0.5">
            <div className="bg-[#f8f9f5] border border-black/5 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 block">
                Biomassa
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#19382B]">
                {item.volume_kg ? item.volume_kg.toFixed(1) : "100.0"} kg
              </span>
            </div>

            <div className="bg-[#f8f9f5] border border-black/5 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl">
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 block">
                Kanopi
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-[#19382B]">
                {report?.canopy_volume ? report.canopy_volume.toFixed(1) : "0.0"} m³
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Status Klaim / Tombol Aksi */}
      <div className="pt-2 sm:pt-3 border-t border-gray-100 mt-1">
        {isSoldOut ? (
          <div className="bg-[#ecefe6] border border-black/5 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 text-center space-y-0.5">
            <span className="text-[8px] sm:text-[10px] font-bold text-[#19382B] flex items-center justify-center gap-1 uppercase tracking-wider">
              <Storefront weight="duotone" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#19382B]" />
              Terklaim:
            </span>
            <p className="text-[10px] sm:text-xs font-black text-[#111111] truncate">
              {item.claimed_by_name || "UMKM Terdaftar"}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onClaim(item)}
              disabled={isClaiming}
              className="flex-1 bg-[#88d937] hover:bg-[#78c92a] text-[#111111] font-extrabold py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-full text-[10px] sm:text-xs transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 uppercase tracking-wider cursor-pointer border border-black/10"
            >
              <HandPalm weight="bold" className="w-3.5 h-3.5 shrink-0" />
              <span>{isClaiming ? "..." : "KLAIM"}</span>
            </button>

            {report && (
              <button
                type="button"
                onClick={() => onViewDetail(report)}
                className="bg-[#19382B] hover:bg-[#234A39] text-[#88d937] font-bold p-1.5 sm:p-2.5 rounded-full text-xs transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
                title="Lihat Detail Lengkap Laporan"
              >
                <Info weight="bold" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
