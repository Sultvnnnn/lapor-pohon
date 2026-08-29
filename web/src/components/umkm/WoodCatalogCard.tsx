"use client";

import { ReportItem } from "./SemarangRiskMap";
import { CheckCircle, MapPin, Storefront, HandPalm, Info, Package, ShieldCheck } from "@phosphor-icons/react";

export type BiomassCatalogItem = {
  id: string;
  report_id: string;
  wood_type: string;
  volume_kg: number;
  status: "available" | "claimed" | "sold_out" | string;
  claimed_by?: string | null;
  claimed_by_name?: string | null;
  claimed_by_business_name?: string | null;
  claimed_by_business_type?: string | null;
  claimed_by_phone?: string | null;
  created_at: string;
  updated_at: string;
  reports?: ReportItem | null;

  // Additional rich dimensions & pickup fields
  diameter_cm?: number;
  length_m?: number;
  estimated_planks?: string;
  pickup_location_name?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  claim_ticket_code?: string;
  handover_status?: "WAITING_PICKUP" | "COMPLETED" | string;
  handover_at?: string | null;
  handover_notes?: string | null;
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

  // Derived dimensions if not present
  const diameter = item.diameter_cm || (item.volume_kg > 200 ? 55 : item.volume_kg > 100 ? 42 : 28);
  const length = item.length_m || (item.volume_kg > 200 ? 4.5 : item.volume_kg > 100 ? 3.2 : 2.0);
  const locationText = item.pickup_location_name || report?.admin_note || report?.description || "Lokasi penebangan pohon dinas";

  return (
    <div className="bg-white border border-black/8 hover:border-[#19382B]/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4 transition-all duration-300 font-sans relative overflow-hidden group flex flex-col justify-between">
      <div className="space-y-2.5 sm:space-y-3.5">
        {/* Gambar Kayu Hasil Penebangan */}
        <div className="relative w-full h-36 sm:h-48 rounded-xl overflow-hidden bg-[#f8f9f5] border border-black/5">
          {imageDisplay ? (
            <img
              src={imageDisplay}
              alt="Foto penebangan kayu"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-xs font-medium text-[#111111]/40 gap-1 p-2 text-center">
              <Package size={24} className="text-[#19382B]/30" />
              <span className="line-clamp-2">Foto hasil penebangan</span>
            </div>
          )}

          {/* Badge Status Sold Out / Siap Klaim */}
          <div className="absolute top-2.5 left-2.5">
            {isSoldOut ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 shadow-sm border border-black/5 inline-flex items-center gap-1">
                <CheckCircle size={12} weight="fill" />
                <span>Terklaim</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#19382B] text-white shadow-sm inline-flex items-center gap-1">
                <ShieldCheck size={12} weight="fill" className="text-white" />
                <span>Siap klaim</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-[#19382B]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1 border border-white/10 shadow-sm">
            <MapPin weight="fill" className="w-3 h-3 text-white" />
            <span>Lokasi peta</span>
          </div>
        </div>

        {/* Informasi Detail Kayu Pohon & Dimensi */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-start justify-between gap-1">
            <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full inline-block truncate max-w-full">
              {item.wood_type || report?.tree_type || "Pohon kayu olahan"}
            </span>
            <span className="text-[10px] font-bold text-[#111111]/50 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
              Ø {diameter} cm
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight mt-0.5 line-clamp-1 group-hover:text-[#19382B] transition-colors">
            {locationText}
          </h4>

          {/* Badge Dimensi Tambahan: Panjang & Biomassa */}
          <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
            <div className="bg-[#f8f9f5] border border-black/5 p-1.5 rounded-xl text-center">
              <span className="text-[9px] font-medium text-[#111111]/50 block">Berat</span>
              <span className="font-bold text-[#19382B]">
                {item.volume_kg ? item.volume_kg.toFixed(0) : "100"} kg
              </span>
            </div>

            <div className="bg-[#f8f9f5] border border-black/5 p-1.5 rounded-xl text-center">
              <span className="text-[9px] font-medium text-[#111111]/50 block">Panjang</span>
              <span className="font-bold text-[#19382B]">{length} m</span>
            </div>

            <div className="bg-[#f8f9f5] border border-black/5 p-1.5 rounded-xl text-center">
              <span className="text-[9px] font-medium text-[#111111]/50 block">Diameter</span>
              <span className="font-bold text-[#19382B]">{diameter} cm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Baris Status Klaim / Tombol Aksi */}
      <div className="pt-2 sm:pt-3 border-t border-gray-100 mt-1">
        {isSoldOut ? (
          <div className="bg-[#ecefe6] border border-black/5 rounded-xl p-2 text-center space-y-0.5">
            <span className="text-[10px] font-bold text-[#19382B] flex items-center justify-center gap-1">
              <Storefront weight="duotone" className="w-3.5 h-3.5 text-[#19382B]" />
              Terklaim oleh:
            </span>
            <p className="text-xs font-bold text-[#111111] truncate">
              {item.claimed_by_name || "UMKM terdaftar"}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClaim(item)}
              disabled={isClaiming}
              className="flex-1 bg-[#19382B] hover:bg-[#234A39] text-white font-bold py-2.5 px-3 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <HandPalm weight="bold" className="w-3.5 h-3.5 shrink-0" />
              <span>{isClaiming ? "..." : "Klaim kayu ini"}</span>
            </button>

            {report && (
              <button
                type="button"
                onClick={() => onViewDetail(report)}
                className="bg-[#ecefe6] hover:bg-[#dce8d0] text-[#19382B] font-bold p-2.5 rounded-full text-xs transition-all cursor-pointer active:scale-95 shrink-0 border border-black/5"
                title="Lihat detail laporan &amp; lokasi"
              >
                <Info weight="bold" className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
