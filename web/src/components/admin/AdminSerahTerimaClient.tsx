"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  MagnifyingGlass,
  CheckCircle,
  Clock,
  NavigationArrow,
  X,
  CircleNotch,
  Storefront,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { parseCoordinates } from "./AdminDashboardClient";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AdminSerahTerimaClientProps {
  initialCatalogs: any[];
  adminEmail: string;
}

// Helper functions for localStorage fallback persistence
export const getCompletedTickets = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("laporpohon_completed_tickets");
    if (raw) {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {}
  return new Set();
};

export const markTicketCompletedInStorage = (ticketCodeOrId: string) => {
  if (typeof window === "undefined" || !ticketCodeOrId) return;
  try {
    const existing = getCompletedTickets();
    existing.add(ticketCodeOrId);
    localStorage.setItem("laporpohon_completed_tickets", JSON.stringify(Array.from(existing)));
  } catch {}
};

export function AdminSerahTerimaClient({
  initialCatalogs = [],
  adminEmail,
}: AdminSerahTerimaClientProps) {
  const supabase = createClient();
  const [catalogs, setCatalogs] = useState<any[]>(initialCatalogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHandoverItem, setSelectedHandoverItem] = useState<any | null>(null);
  const [handoverNoteInput, setHandoverNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refresh catalogs data from Supabase
  const refreshCatalogs = async () => {
    try {
      const completedSet = getCompletedTickets();

      const { data: catData } = await supabase
        .from("biomass_catalogs")
        .select(`
          *,
          reports (*),
          profiles:claimed_by (full_name)
        `)
        .order("created_at", { ascending: false });

      const { data: repData } = await supabase
        .from("reports")
        .select("*")
        .or("claimed_by_name.neq.null,status.eq.completed")
        .order("created_at", { ascending: false });

      if (catData || repData) {
        const catMap = new Map<string, any>();
        (catData || []).forEach((c) => {
          if (c.report_id) catMap.set(c.report_id, c);
          if (c.id) catMap.set(c.id, c);
        });

        const merged: any[] = [];

        (catData || []).forEach((c) => {
          const code = c.claim_ticket_code || `KLM-2026-TRM-${(c.report_id || c.id).slice(0, 4).toUpperCase()}`;
          const isDone =
            c.handover_status === "COMPLETED" ||
            c.status === "sold_out" ||
            c.reports?.status === "completed" ||
            completedSet.has(c.id) ||
            (c.report_id && completedSet.has(c.report_id)) ||
            completedSet.has(code);

          merged.push({
            ...c,
            handover_status: isDone ? "COMPLETED" : (c.handover_status || "WAITING_PICKUP"),
            status: isDone ? "sold_out" : (c.status || "claimed"),
          });
        });

        (repData || []).forEach((r) => {
          if (!catMap.has(r.id)) {
            const code = `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`;
            const isDone =
              r.status === "completed" ||
              r.handover_status === "COMPLETED" ||
              completedSet.has(r.id) ||
              completedSet.has(code);

            merged.push({
              id: r.id,
              report_id: r.id,
              wood_type: r.tree_type || "Pohon kayu olahan dinas",
              volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : 120.0,
              status: isDone ? "sold_out" : "claimed",
              claimed_by_name: r.claimed_by_name || "UMKM terdaftar",
              created_at: r.created_at,
              updated_at: r.created_at,
              reports: r,
              claim_ticket_code: code,
              handover_status: isDone ? "COMPLETED" : "WAITING_PICKUP",
            });
          }
        });

        setCatalogs(merged);
      }
    } catch {
      console.log("Error refreshing catalogs");
    }
  };

  useEffect(() => {
    refreshCatalogs();
  }, []);

  const handleExecuteHandover = async () => {
    if (!selectedHandoverItem) return;
    setIsSubmitting(true);

    try {
      const targetReportId = selectedHandoverItem.report_id || selectedHandoverItem.id;
      const targetCatalogId = selectedHandoverItem.id;
      const ticketCode = selectedHandoverItem.claim_ticket_code || `KLM-2026-TRM-${targetReportId.slice(0, 4).toUpperCase()}`;
      const handoverTime = new Date().toISOString();
      const notes = handoverNoteInput || "Kayu resmi diserahkan oleh petugas dinas kota.";

      // Mark completed in localStorage for instant persistent state
      markTicketCompletedInStorage(selectedHandoverItem.id);
      if (targetReportId) markTicketCompletedInStorage(targetReportId);
      if (ticketCode) markTicketCompletedInStorage(ticketCode);

      const handoverPayload = {
        handover_status: "COMPLETED",
        status: "sold_out",
        handover_at: handoverTime,
        handover_notes: notes,
        updated_at: handoverTime,
      };

      // 1. Try to update existing biomass_catalogs row strictly by id OR report_id
      let updatedData: any[] | null = null;
      if (targetCatalogId) {
        const { data, error } = await supabase
          .from("biomass_catalogs")
          .update(handoverPayload)
          .eq("id", targetCatalogId)
          .select();
        if (error) console.log("Catalog update error by id", error);
        updatedData = data;
      }

      if ((!updatedData || updatedData.length === 0) && targetReportId) {
        const { data, error } = await supabase
          .from("biomass_catalogs")
          .update(handoverPayload)
          .eq("report_id", targetReportId)
          .select();
        if (error) console.log("Catalog update error by report_id", error);
        updatedData = data;
      }

      // 2. If no existing row was updated, insert a completed row into biomass_catalogs for THIS item only
      if (!updatedData || updatedData.length === 0) {
        const { error: insertErr } = await supabase
          .from("biomass_catalogs")
          .insert({
            report_id: targetReportId,
            wood_type: selectedHandoverItem.wood_type || "Pohon kayu olahan dinas",
            volume_kg: selectedHandoverItem.volume_kg || 100.0,
            claimed_by: selectedHandoverItem.claimed_by || null,
            claimed_by_name: selectedHandoverItem.claimed_by_name || "Pengguna UMKM",
            claimed_by_business_name: selectedHandoverItem.claimed_by_business_name || "Kerajinan Kayu",
            claimed_by_phone: selectedHandoverItem.claimed_by_phone || null,
            claim_ticket_code: ticketCode,
            created_at: handoverTime,
            ...handoverPayload,
          });
        if (insertErr) console.log("Catalog insert error", insertErr);
      }

      // 3. Update reports table ONLY with valid columns (status & admin_note)
      if (targetReportId) {
        const { error: repErr } = await supabase
          .from("reports")
          .update({
            status: "completed",
            admin_note: notes,
          })
          .eq("id", targetReportId);
        if (repErr) console.log("Report update error", repErr);
      }

      // 4. Update local state strictly for target item
      setCatalogs((prev) =>
        prev.map((item) =>
          item.id === selectedHandoverItem.id || (item.report_id && item.report_id === targetReportId) || item.claim_ticket_code === ticketCode
            ? {
              ...item,
              handover_status: "COMPLETED",
              status: "sold_out",
              handover_at: handoverTime,
              handover_notes: notes,
            }
            : item
        )
      );

      await refreshCatalogs();
    } catch (e) {
      console.log("Error handover", e);
    } finally {
      setIsSubmitting(false);
      setSelectedHandoverItem(null);
      setHandoverNoteInput("");
    }
  };

  const filteredCatalogs = catalogs.filter((item) => {
    const r = item.reports;
    const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
    const searchTarget = `${ticketCode} ${item.wood_type} ${item.claimed_by_name} ${item.claimed_by_business_name} ${r?.description} ${r?.admin_note}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    const isDone = item.handover_status === "COMPLETED";
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "WAITING_PICKUP"
          ? !isDone
          : isDone;

    return matchesSearch && matchesStatus;
  });

  const waitingCount = catalogs.filter((c) => c.handover_status !== "COMPLETED").length;
  const completedCount = catalogs.filter((c) => c.handover_status === "COMPLETED").length;

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans pb-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="space-y-1.5 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Serah Terima Kayu UMKM
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 font-medium leading-relaxed">
            Kelola jadwal penjemputan dan proses serah terima kayu tebangan dengan pelaku UMKM.
          </p>
        </div>

        {/* Standardized Stat Cards */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white border border-black/8 rounded-2xl p-4 min-w-[140px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 block mb-1">
              Menunggu penjemputan
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{waitingCount}</span>
          </div>
          <div className="bg-white border border-black/8 rounded-2xl p-4 min-w-[140px] shadow-2xs">
            <span className="text-[11px] font-medium text-[#111111]/60 block mb-1">
              Sudah diserahkan
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{completedCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm p-5 sm:p-6 space-y-5">
        {/* Controls Bar with Custom Select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode tiket, nama usaha, atau jenis kayu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-full pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
            />
          </div>

          <div className="shrink-0 min-w-[200px]">
            <CustomSelect
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "Semua status klaim" },
                { value: "WAITING_PICKUP", label: "Menunggu penjemputan" },
                { value: "COMPLETED", label: "Sudah diserahkan" },
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* ── MOBILE CARD LIST (Khusus Mobile < md agar pas 1 layar tanpa overflow) ── */}
        <div className="block md:hidden space-y-3 font-sans">
          {filteredCatalogs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 font-semibold text-xs">
              Tidak ada data klaim serah terima kayu yang sesuai filter.
            </div>
          ) : (
            filteredCatalogs.map((item) => {
              const r = item.reports;
              const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
              const isHandoverDone = item.handover_status === "COMPLETED";

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
                  {/* Top Header: Ticket & Status */}
                  <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                    <span className="bg-[#ecefe6] text-[#19382B] px-3 py-1 rounded-full font-bold text-xs border border-black/5">
                      {ticketCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${isHandoverDone
                        ? "bg-[#ecefe6] text-[#19382B] border-black/5"
                        : "bg-white text-[#111111] border-black/10"
                        }`}
                    >
                      {isHandoverDone ? (
                        <>
                          <CheckCircle size={12} weight="fill" className="text-[#19382B]" />
                          <span>Sudah diserahkan</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} weight="fill" className="text-gray-500" />
                          <span>Menunggu penjemputan</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Business & Wood Spec */}
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[#19382B] flex items-center gap-1.5">
                      <Storefront size={14} className="shrink-0 text-[#19382B]" />
                      <span>{item.claimed_by_business_name || "Kerajinan Kayu Mutiara Jati"}</span>
                    </div>
                    <div className="text-[11px] text-[#111111]/70">
                      Pemilik: {item.claimed_by_name || "Pengguna UMKM"} • WA: {item.claimed_by_phone || "0812-3456-7890"}
                    </div>
                    <div className="text-[11px] font-medium text-[#111111]/70 pt-0.5">
                      Kayu: <strong>{item.wood_type}</strong> ({item.volume_kg || 100} kg • Ø {item.diameter_cm || 45} cm)
                    </div>
                  </div>

                  {/* Single Row Action Bar: Peta Lokasi & Verifikasi Button (Verifikasi dibuat lebih besar) */}
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-[#f8f9f5] hover:bg-gray-100 text-[#19382B] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-black/10 transition-all"
                    >
                      <NavigationArrow size={14} weight="bold" className="text-[#19382B]" />
                      <span className="truncate">Peta Lokasi</span>
                    </a>

                    {!isHandoverDone ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHandoverItem(item);
                          setHandoverNoteInput("");
                        }}
                        className="flex-1 bg-[#19382B] hover:bg-[#234A39] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Handshake size={18} weight="bold" className="text-[#88d937]" />
                        <span>Verifikasi</span>
                      </button>
                    ) : (
                      <span className="flex-1 text-[11px] font-bold text-gray-400 italic text-center py-2.5 bg-gray-50 rounded-xl border border-black/5">
                        Sudah diserahkan
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── DESKTOP TABLE VIEW (Redesign Sesuai Screenshot 2) ── */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-black/5">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#19382B] text-white text-[11px] font-bold uppercase tracking-wider text-center">
                <th className="py-3.5 px-4 rounded-tl-xl">INFO UMKM</th>
                <th className="py-3.5 px-4">DETAIL KAYU</th>
                <th className="py-3.5 px-4">LOKASI PENGAMBILAN</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 rounded-tr-xl">AKSI PETUGAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredCatalogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">
                    Tidak ada data klaim serah terima kayu yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredCatalogs.map((item) => {
                  const r = item.reports;
                  const ticketCode = item.claim_ticket_code || `KLM-2026-TRM-${item.id.slice(0, 4).toUpperCase()}`;
                  const isHandoverDone = item.handover_status === "COMPLETED";

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
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${isHandoverDone
                            ? "bg-[#ecefe6] text-[#19382B] border-black/5"
                            : "bg-white text-[#111111] border-black/10"
                            }`}
                        >
                          {isHandoverDone ? (
                            <>
                              <CheckCircle size={12} weight="fill" className="text-[#19382B]" />
                              <span>Sudah diserahkan</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} weight="fill" className="text-gray-500" />
                              <span>Menunggu penjemputan</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Col 5: Aksi Petugas */}
                      <td className="py-3.5 px-4 text-right">
                        {!isHandoverDone ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHandoverItem(item);
                              setHandoverNoteInput("");
                            }}
                            className="bg-[#19382B] hover:bg-[#234A39] text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer active:scale-95 border border-black/10"
                          >
                            <Handshake size={15} weight="bold" />
                            <span>Verifikasi &amp; serahkan</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 italic">
                            Sudah diserahkan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konfirmasi Serah Terima Petugas */}
      <AnimatePresence>
        {selectedHandoverItem && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-black/10 shadow-sm rounded-2xl p-6 w-full max-w-md space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold">
                    <Handshake size={18} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">
                      Konfirmasi serah terima kayu
                    </h4>
                    <span className="text-[10px] text-[#19382B] font-bold">
                      Verifikasi petugas dinas kota
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHandoverItem(null)}
                  className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#f8f9f5] border border-black/5 rounded-xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#111111]/50 block">Kode tiket &amp; kayu:</span>
                  <strong className="text-[#19382B] font-bold text-xs">
                    {selectedHandoverItem.claim_ticket_code || `KLM-2026-TRM-${selectedHandoverItem.id.slice(0, 4).toUpperCase()}`} — {selectedHandoverItem.wood_type}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#111111]/50 block">Penerima UMKM:</span>
                  <strong className="text-[#111111] font-bold text-xs block">
                    {selectedHandoverItem.claimed_by_business_name || "Kerajinan Kayu Mutiara Jati"}
                  </strong>
                  <span className="text-[11px] text-[#111111]/70 font-medium block">
                    Pemilik: {selectedHandoverItem.claimed_by_name || "Pengguna UMKM"} • WA: {selectedHandoverItem.claimed_by_phone || "0812-3456-7890"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111]">
                  Catatan serah terima petugas:
                </label>
                <textarea
                  rows={2}
                  value={handoverNoteInput}
                  onChange={(e) => setHandoverNoteInput(e.target.value)}
                  placeholder="Contoh: Kayu 150 kg telah dimuat ke truk UMKM di lokasi tebangan."
                  className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHandoverItem(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteHandover}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <CircleNotch size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle size={16} weight="bold" className="text-white" />
                      <span>Konfirmasi</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
