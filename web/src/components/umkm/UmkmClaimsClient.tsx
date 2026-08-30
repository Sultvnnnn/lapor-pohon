"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  NavigationArrow,
  Printer,
  X,
  Storefront,
  Package,
  ArrowLeft,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { parseCoordinates } from "../admin/AdminDashboardClient";
import { BiomassCatalogItem } from "./WoodCatalogCard";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getCompletedTickets } from "../admin/AdminSerahTerimaClient";

interface UmkmClaimsClientProps {
  initialDisplayName: string;
  userId: string;
}

export function UmkmClaimsClient({
  initialDisplayName,
  userId,
}: UmkmClaimsClientProps) {
  const supabase = createClient();
  const [displayName] = useState(initialDisplayName);
  const [catalogs, setCatalogs] = useState<BiomassCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected item for Digital Ticket Modal
  const [selectedTicketItem, setSelectedTicketItem] = useState<BiomassCatalogItem | null>(null);

  const fetchUserClaims = async () => {
    setIsLoading(true);
    try {
      const completedSet = getCompletedTickets();

      const { data: catData } = await supabase
        .from("biomass_catalogs")
        .select(`
          *,
          reports (*)
        `)
        .or(`claimed_by.eq.${userId},claimed_by_name.ilike.%${displayName}%`)
        .order("created_at", { ascending: false });

      if (catData && catData.length > 0) {
        const formatted: BiomassCatalogItem[] = catData.map((c: any) => {
          const code = c.claim_ticket_code || `KLM-2026-TRM-${(c.report_id || c.id).slice(0, 4).toUpperCase()}`;
          const isDone =
            c.handover_status === "COMPLETED" ||
            c.status === "sold_out" ||
            c.reports?.status === "completed" ||
            completedSet.has(c.id) ||
            (c.report_id && completedSet.has(c.report_id)) ||
            completedSet.has(code);

          return {
            id: c.id,
            report_id: c.report_id,
            wood_type: c.wood_type || "Pohon kayu olahan dinas",
            volume_kg: c.volume_kg || 120.0,
            status: isDone ? "sold_out" : (c.status || "claimed"),
            claimed_by: c.claimed_by,
            claimed_by_name: c.claimed_by_name || c.profiles?.full_name || displayName,
            claimed_by_business_name: c.claimed_by_business_name,
            claimed_by_business_type: c.claimed_by_business_type,
            claimed_by_phone: c.claimed_by_phone,
            created_at: c.created_at,
            updated_at: c.updated_at,
            reports: c.reports,
            claim_ticket_code: code,
            handover_status: isDone ? "COMPLETED" : (c.handover_status || "WAITING_PICKUP"),
            handover_notes: c.handover_notes,
            diameter_cm: c.diameter_cm || 45,
            length_m: c.length_m || 3.5,
          };
        });
        setCatalogs(formatted);
      } else {
        const { data: repData } = await supabase
          .from("reports")
          .select("*")
          .or(`claimed_by_name.ilike.%${displayName}%`)
          .order("created_at", { ascending: false });

        if (repData && repData.length > 0) {
          const derived: BiomassCatalogItem[] = repData.map((r) => {
            const code = `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`;
            const isDone =
              r.status === "completed" ||
              r.handover_status === "COMPLETED" ||
              completedSet.has(r.id) ||
              completedSet.has(code);

            return {
              id: r.id,
              report_id: r.id,
              wood_type: r.tree_type || "Pohon kayu olahan dinas",
              volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : 150.0,
              status: isDone ? "sold_out" : "claimed",
              claimed_by_name: r.claimed_by_name || displayName,
              created_at: r.created_at,
              updated_at: r.created_at,
              reports: r,
              claim_ticket_code: code,
              handover_status: isDone ? "COMPLETED" : "WAITING_PICKUP",
              diameter_cm: 45,
              length_m: 3.5,
            };
          });
          setCatalogs(derived);
        } else {
          setCatalogs([]);
        }
      }
    } catch (err) {
      console.error("Error fetching user claims:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClaims();
  }, []);

  const waitingPickupCount = catalogs.filter((c) => c.handover_status !== "COMPLETED").length;
  const completedCount = catalogs.filter((c) => c.handover_status === "COMPLETED").length;

  const filteredCatalogs = catalogs.filter((item) => {
    const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
    const woodType = item.wood_type || "";
    const matchesSearch =
      !searchQuery ||
      ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      woodType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "WAITING_PICKUP" && item.handover_status !== "COMPLETED") ||
      (statusFilter === "COMPLETED" && item.handover_status === "COMPLETED");

    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className="w-full space-y-6 sm:space-y-8 font-sans pb-16"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Header Minimalis & Navigasi Kembali */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Tiket Pengambilan
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 font-medium">
            Cek status kayu yang Anda klaim dan tunjukkan tiket ini saat pengambilan di lokasi.
          </p>
        </div>

        {/* Standardized Equal Stat Cards */}
        <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[120px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 block mb-1">
              Menunggu penjemputan
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{waitingPickupCount}</span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[120px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 block mb-1">
              Sudah diambil
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{completedCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Unified Card Container for Controls & Content */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-4 sm:p-6 space-y-5">
        {/* Filter & Search Bar in 1 Single Row (Scaled & Fitted) */}
        <div className="flex flex-row items-center gap-2 border-b border-black/5 pb-4">
          <div className="relative flex-1 min-w-0">
            <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tiket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-full pl-8 pr-2.5 py-2 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111] truncate"
            />
          </div>

          <div className="shrink-0 w-36 sm:w-48">
            <CustomSelect
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "Semua status" },
                { value: "WAITING_PICKUP", label: "Menunggu" },
                { value: "COMPLETED", label: "Diambil" },
              ]}
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="py-16 text-center text-xs font-bold text-gray-400">
            Memuat data klaim &amp; tiket digital UMKM...
          </div>
        ) : filteredCatalogs.length === 0 ? (
          <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center mx-auto">
              <Ticket size={24} weight="bold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111111]">Belum ada klaim kayu</h3>
              <p className="text-xs text-[#111111]/60 font-medium max-w-sm mx-auto">
                Kamu belum mengklaim pasokan kayu. Pilih pasokan kayu yang tersedia di katalog untuk mendukung produksi usaha kamu.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#19382B] text-white hover:bg-[#234A39] px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Package size={16} weight="bold" className="text-white" />
              <span>Lihat katalog kayu</span>
            </Link>
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD LIST (Tampil Khusus Mobile < md agar pas 1 layar tanpa scroll horizontal) ── */}
            <div className="block md:hidden space-y-3 font-sans">
              {filteredCatalogs.map((item) => {
                const r = item.reports;
                const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
                const isCompleted = item.handover_status === "COMPLETED";

                const parsed = r ? parseCoordinates(r) : null;
                const displayLat = parsed?.lat ?? (r ? (typeof r.latitude === "number" ? r.latitude : parseFloat(String(r.latitude))) : null);
                const displayLng = parsed?.lng ?? (r ? (typeof r.longitude === "number" ? r.longitude : parseFloat(String(r.longitude))) : null);
                const hasCoords = displayLat !== null && displayLng !== null && !isNaN(displayLat) && !isNaN(displayLng) && displayLat !== 0;

                const mapsUrl = hasCoords
                  ? `https://www.google.com/maps/search/?api=1&query=${displayLat},${displayLng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Penebangan Pohon Dinas Kota")}`;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-black/10 rounded-2xl p-4 space-y-3 shadow-2xs"
                  >
                    {/* Header Card: Kode & Status */}
                    <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                      <span className="font-bold text-xs text-[#19382B] bg-[#ecefe6] px-3 py-1 rounded-full border border-black/5">
                        {ticketCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${isCompleted
                          ? "bg-[#ecefe6] text-[#19382B] border-black/5"
                          : "bg-white text-[#111111] border-black/10"
                          }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle size={12} weight="fill" className="text-[#19382B]" />
                            <span>Sudah diambil</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} weight="fill" className="text-gray-500" />
                            <span>Menunggu penjemputan</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Content: Usaha & Spesifikasi */}
                    <div className="space-y-1.5 text-xs">
                      <div className="font-bold text-[#19382B] flex items-center gap-1.5">
                        <Storefront size={14} className="shrink-0 text-[#19382B]" />
                        <span>{item.claimed_by_business_name || "Kerajinan Kayu Mutiara Jati"}</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#111111]/70">
                        Spesifikasi: <strong>{item.wood_type}</strong> ({item.volume_kg || 100} kg • Ø {item.diameter_cm || 45} cm)
                      </div>
                    </div>

                    {/* Action Bar (Fit Perfectly Inside Card Width) */}
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2 min-w-0 w-full">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 bg-[#f8f9f5] hover:bg-gray-100 text-[#19382B] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-black/10 transition-all"
                      >
                        <NavigationArrow size={13} weight="bold" className="text-[#19382B]" />
                        <span>Peta Lokasi</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedTicketItem(item)}
                        className="flex-1 min-w-0 bg-[#19382B] hover:bg-[#234A39] text-white font-extrabold py-2 px-3 rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <Ticket size={15} weight="bold" className="text-[#88d937] shrink-0" />
                        <span className="truncate">Buka Tiket</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── DESKTOP TABLE VIEW (Redesign Sesuai Tabel Verifikasi Usaha di Screenshot 2) ── */}
            <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-black/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#19382B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 rounded-tl-xl">Kode &amp; Usaha UMKM</th>
                    <th className="py-3.5 px-4">Spesifikasi Kayu</th>
                    <th className="py-3.5 px-4">Lokasi Tebangan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-tr-xl">Aksi Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {filteredCatalogs.map((item) => {
                    const r = item.reports;
                    const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
                    const isCompleted = item.handover_status === "COMPLETED";

                    const parsed = r ? parseCoordinates(r) : null;
                    const displayLat = parsed?.lat ?? (r ? (typeof r.latitude === "number" ? r.latitude : parseFloat(String(r.latitude))) : null);
                    const displayLng = parsed?.lng ?? (r ? (typeof r.longitude === "number" ? r.longitude : parseFloat(String(r.longitude))) : null);
                    const hasCoords = displayLat !== null && displayLng !== null && !isNaN(displayLat) && !isNaN(displayLng) && displayLat !== 0;

                    const mapsUrl = hasCoords
                      ? `https://www.google.com/maps/search/?api=1&query=${displayLat},${displayLng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Penebangan Pohon Dinas Kota")}`;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Col 1: Kode & Usaha UMKM */}
                        <td className="py-3.5 px-4">
                          <span className="bg-[#ecefe6] text-[#19382B] px-2 py-0.5 rounded font-bold text-[11px] inline-block mb-1">
                            {ticketCode}
                          </span>
                          <div className="font-bold text-[#19382B] text-xs flex items-center gap-1">
                            <Storefront size={13} className="text-[#19382B] shrink-0" />
                            <span>{item.claimed_by_business_name || "Kerajinan Kayu Mutiara Jati"}</span>
                          </div>
                          <div className="text-[11px] text-[#111111]/70 font-medium pt-0.5">
                            Pemilik: {item.claimed_by_name || "Pengguna UMKM"} • WA: {item.claimed_by_phone || "0812-3456-7890"}
                          </div>
                        </td>

                        {/* Col 2: Spesifikasi Kayu */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[#19382B]">{item.wood_type}</span>
                          <div className="text-[10px] text-[#111111]/60 font-medium gap-1.5 flex items-center pt-0.5">
                            <span>Berat: {item.volume_kg || 100} kg</span>
                            <span>•</span>
                            <span>Diameter {item.diameter_cm || 45} cm</span>
                          </div>
                        </td>

                        {/* Col 3: Lokasi Tebangan (Hanya Tombol Maps - Tanpa Deskripsi Teks Sesuai Revisi 5) */}
                        <td className="py-3.5 px-4">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#19382B] text-white hover:bg-[#234A39] px-3 py-1.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-all border border-black/5"
                          >
                            <NavigationArrow size={11} weight="bold" />
                            <span>Peta lokasi ({hasCoords ? `${displayLat?.toFixed(4)}, ${displayLng?.toFixed(4)}` : "Peta Penebangan"})</span>
                          </a>
                        </td>

                        {/* Col 4: Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${isCompleted
                              ? "bg-[#ecefe6] text-[#19382B] border-black/5"
                              : "bg-white text-[#111111] border-black/10"
                              }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle size={12} weight="fill" className="text-[#19382B]" />
                                <span>Sudah diambil</span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} weight="fill" className="text-gray-500" />
                                <span>Menunggu penjemputan</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Col 5: Aksi Petugas / Tiket */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketItem(item)}
                            className="bg-[#19382B] hover:bg-[#234A39] text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95 border border-black/10"
                          >
                            <Ticket size={14} weight="bold" />
                            <span>Buka tiket digital</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Surat Jalan Digital */}
      <AnimatePresence>
        {selectedTicketItem && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-black/10 shadow-sm rounded-2xl p-6 w-full max-w-lg space-y-4 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header Surat Jalan */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold">
                    <Storefront size={18} weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111] tracking-tight">
                      Surat jalan &amp; tiket penjemputan
                    </h4>
                    <span className="text-[10px] text-[#19382B] font-bold block">
                      Dinas Lingkungan Hidup
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicketItem(null)}
                  className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>

              {/* Barcode & Ticket Display */}
              <div className="bg-[#19382B] text-white p-4 rounded-xl text-center space-y-2 border border-white/10 shadow-sm">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block">
                  Kode tiket klaim
                </span>
                <span className="text-xl font-bold tracking-wider block">
                  {selectedTicketItem.claim_ticket_code || `KLM-2026-TRM-${selectedTicketItem.id.slice(0, 4).toUpperCase()}`}
                </span>
                {/* Visual Barcode */}
                <div className="bg-white p-2 rounded flex items-center justify-center gap-1 mx-auto max-w-[200px] h-9 opacity-90">
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-3 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-0.5 h-full bg-black"></div>
                  <div className="w-1.5 h-full bg-black"></div>
                </div>
              </div>

              {/* Data Detail Rincian */}
              <div className="bg-[#f8f9f5] border border-black/5 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-black/5">
                  <div>
                    <span className="text-[10px] font-bold text-[#111111]/50 block">Penerima klaim:</span>
                    <strong className="text-[#19382B] font-bold">{displayName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#111111]/50 block">Status penyerahan:</span>
                    <strong className={selectedTicketItem.handover_status === "COMPLETED" || selectedTicketItem.status === "sold_out" ? "text-[#19382B]" : "text-gray-700"}>
                      {selectedTicketItem.handover_status === "COMPLETED" || selectedTicketItem.status === "sold_out" ? "Sudah diserahkan • Tiket Ditutup" : "Menunggu penjemputan"}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#111111]/50 block">Spesifikasi biomassa:</span>
                  <p className="font-semibold text-[#111111]">
                    {selectedTicketItem.wood_type} ({selectedTicketItem.volume_kg} kg, Ø {selectedTicketItem.diameter_cm || 45} cm, {selectedTicketItem.length_m || 3.5} m)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-[#19382B] hover:bg-[#234A39] text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95"
                >
                  <Printer size={16} weight="bold" className="text-white" />
                  <span>Cetak / simpan PDF tiket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTicketItem(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
