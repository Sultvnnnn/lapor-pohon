"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldWarning,
  CheckCircle,
  Clock,
  FileText,
  MagnifyingGlass,
  Funnel,
  MapPin,
  Trash,
  X,
  Check,
  CircleNotch,
  MapTrifold,
  Rows,
  Eye,
  NotePencil,
  Sparkle,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { AdminMapView } from "./AdminMapView";
import { getRiskLevel, riskLevelConfig } from "@/lib/riskLevel";

export type AdminReportItem = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  image_url: string;
  risk_score: number;
  canopy_volume: number;
  biomass_estimate: number;
  bounding_boxes: any;
  status: string;
  description?: string;
  admin_note?: string;
  created_at: string;
};

interface AdminDashboardClientProps {
  initialReports: AdminReportItem[];
  adminDisplayName: string;
  adminEmail: string;
}

export const AdminDashboardClient = ({
  initialReports,
  adminDisplayName,
  adminEmail,
}: AdminDashboardClientProps) => {
  const supabaseClient = createClient();

  const [reports, setReports] = useState<AdminReportItem[]>(initialReports);
  const [activeViewTab, setActiveViewTab] = useState<"table" | "map">("table");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Status Change Modal State
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNoteInput, setAdminNoteInput] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmReport, setDeleteConfirmReport] = useState<AdminReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // KPI Computations
  const totalReports = reports.length;
  const highRiskReports = reports.filter((r) => {
    const rawRisk = typeof r.risk_score === "number" ? r.risk_score : 0;
    const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
    return risk > 60;
  }).length;
  const pendingReports = reports.filter((r) =>
    (r.status || "").toLowerCase().includes("pending")
  ).length;
  const completedReports = reports.filter((r) => {
    const st = (r.status || "").toLowerCase();
    return st.includes("completed") || st.includes("selesai") || st.includes("sirkular");
  }).length;

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const st = (r.status || "").toLowerCase();
    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "pending"
        ? st.includes("pending")
        : statusFilter === "in_progress"
        ? st.includes("proses") || st.includes("progress")
        : statusFilter === "completed"
        ? st.includes("selesai") || st.includes("completed")
        : statusFilter === "rejected"
        ? st.includes("ditolak") || st.includes("rejected")
        : true;

    const rawRisk = typeof r.risk_score === "number" ? r.risk_score : 0;
    const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
    const riskMatch =
      riskFilter === "all"
        ? true
        : riskFilter === "high"
        ? risk > 60
        : riskFilter === "medium"
        ? risk >= 30 && risk <= 60
        : riskFilter === "low"
        ? risk < 30
        : true;

    return matchesSearch && statusMatch && riskMatch;
  });

  // Handler Update Status & Admin Note
  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;

    setIsUpdating(true);
    try {
      const { error } = await supabaseClient
        .from("reports")
        .update({
          status: newStatus,
          admin_note: adminNoteInput,
        })
        .eq("id", selectedReport.id);

      if (error) {
        alert(`Gagal memperbarui status: ${error.message}`);
      } else {
        // Update local state instantly
        setReports((prev) =>
          prev.map((item) =>
            item.id === selectedReport.id
              ? { ...item, status: newStatus, admin_note: adminNoteInput }
              : item
          )
        );
        setSelectedReport(null);
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler Delete Report
  const handleDeleteReport = async () => {
    if (!deleteConfirmReport) return;

    setIsDeleting(true);
    try {
      const { error } = await supabaseClient
        .from("reports")
        .delete()
        .eq("id", deleteConfirmReport.id);

      if (error) {
        alert(`Gagal menghapus laporan: ${error.message}`);
      } else {
        setReports((prev) => prev.filter((item) => item.id !== deleteConfirmReport.id));
        setDeleteConfirmReport(null);
      }
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans pb-12">
      {/* ── 1. Header Banner Panel Admin DLH ── */}
      <div className="bg-[#19382B] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-3">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #88d937 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#88d937] text-[#19382B] flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck size={28} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Panel Kontrol Eksekutif DLH
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#19382B] bg-[#88d937] px-2.5 py-0.5 rounded-full">
                  Admin Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                Verifikasi aduan pohon rawan, instruksi petugas lapangan, dan tata kelola biomassa kayu sirkular.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 px-4 flex items-center gap-3 text-xs self-start md:self-auto">
            <div className="w-8 h-8 rounded-full bg-[#88d937] text-[#19382B] font-bold flex items-center justify-center text-xs uppercase">
              {adminEmail ? adminEmail[0] : "A"}
            </div>
            <div>
              <p className="font-bold text-white leading-tight">{adminDisplayName || "Admin DLH"}</p>
              <p className="text-[10px] text-white/70">{adminEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Executive KPI Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText size={24} weight="fill" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/50">Total Laporan</p>
            <h3 className="text-2xl font-extrabold text-[#111111]">{totalReports}</h3>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldWarning size={24} weight="fill" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/50">Risiko Tinggi (&gt;60)</p>
            <h3 className="text-2xl font-extrabold text-red-600">{highRiskReports}</h3>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={24} weight="fill" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/50">Menunggu Verifikasi</p>
            <h3 className="text-2xl font-extrabold text-amber-600">{pendingReports}</h3>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/50">Sirkular Selesai</p>
            <h3 className="text-2xl font-extrabold text-emerald-700">{completedReports}</h3>
          </div>
        </div>
      </div>

      {/* ── 3. Controls & View Switcher Bar ── */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tab View Switcher (Table vs Map) */}
          <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveViewTab("table")}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeViewTab === "table"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/60 hover:text-[#111111]"
              }`}
            >
              <Rows size={16} weight="bold" />
              <span>Tabel Laporan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveViewTab("map")}
              className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeViewTab === "map"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/60 hover:text-[#111111]"
              }`}
            >
              <MapTrifold size={16} weight="bold" />
              <span>Peta Sebaran Pohon Rawan Kota</span>
            </button>
          </div>

          {/* Search Query Input */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari ID / catatan pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8f9f5] border border-black/8 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-gray-100 text-xs">
          <span className="font-bold text-[#111111]/60 flex items-center gap-1">
            <Funnel size={14} weight="bold" />
            Filter Data:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f8f9f5] border border-black/8 rounded-full px-3.5 py-1.5 font-medium text-[#111111] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Verifikasi (Pending)</option>
            <option value="in_progress">Proses Pemangkasan</option>
            <option value="completed">Sirkular Selesai</option>
            <option value="rejected">Ditolak / Pembatalan</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#f8f9f5] border border-black/8 rounded-full px-3.5 py-1.5 font-medium text-[#111111] focus:outline-none"
          >
            <option value="all">Semua Tingkat Risiko</option>
            <option value="high">🔴 Risiko Tinggi (&gt;60)</option>
            <option value="medium">🟡 Risiko Sedang (30-60)</option>
            <option value="low">🟢 Risiko Rendah (&lt;30)</option>
          </select>
        </div>
      </div>

      {/* ── 4. Main View Display: Table or Map ── */}
      {activeViewTab === "map" ? (
        <AdminMapView reports={filteredReports} />
      ) : (
        /* Data Table View */
        <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#ecefe6]/60 border-b border-black/5 text-[#111111]/70 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Foto &amp; ID</th>
                  <th className="py-3.5 px-4">Risiko AI YOLOv8</th>
                  <th className="py-3.5 px-4">Volume &amp; Biomassa</th>
                  <th className="py-3.5 px-4">Koordinat GPS</th>
                  <th className="py-3.5 px-4">Status &amp; Tanggal</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                      Tidak ada laporan aduan yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
                    const riskLevel = getRiskLevel(rawRisk);
                    const riskConfig = riskLevelConfig[riskLevel];
                    const displayRisk =
                      rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                    const safeLat =
                      typeof report.latitude === "number" ? report.latitude.toFixed(4) : "-";
                    const safeLng =
                      typeof report.longitude === "number" ? report.longitude.toFixed(4) : "-";

                    return (
                      <tr key={report.id} className="hover:bg-[#f8f9f5]/80 transition-colors">
                        {/* Foto & ID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={report.image_url}
                              alt="Kondisi Pohon"
                              className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0"
                            />
                            <div>
                              <p className="font-mono font-bold text-[#111111] text-[11px]">
                                ID: #{report.id ? report.id.slice(0, 8) : "N/A"}
                              </p>
                              {report.description && (
                                <p className="text-[10px] text-[#111111]/60 line-clamp-1 max-w-[140px]">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Risiko AI */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${riskConfig.bgColor} ${riskConfig.textColor}`}
                          >
                            <ShieldWarning size={14} weight="fill" />
                            <span>{riskConfig.label} ({displayRisk}/100)</span>
                          </span>
                        </td>

                        {/* Volume & Biomassa */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#111111]">{report.canopy_volume || 0} m³</p>
                          <p className="text-[10px] text-[#111111]/60">{report.biomass_estimate || 0} kg biomassa</p>
                        </td>

                        {/* GPS */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-[#111111]/80">
                            <MapPin size={14} weight="fill" className="text-[#19382B]" />
                            <span>{safeLat}, {safeLng}</span>
                          </div>
                        </td>

                        {/* Status & Tanggal */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[11px] text-[#19382B] block">
                            {report.status || "Pending"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {report.created_at
                              ? new Date(report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReport(report);
                                setNewStatus(report.status);
                                setAdminNoteInput(report.admin_note || "");
                              }}
                              className="bg-[#19382B] text-white hover:bg-[#234A39] px-3 py-1.5 rounded-full font-bold text-[11px] flex items-center gap-1 shadow-xs transition-all"
                            >
                              <NotePencil size={14} weight="bold" />
                              <span>Verifikasi / Respon</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmReport(report)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-full border border-red-200 transition-all"
                              title="Hapus Laporan Ini"
                            >
                              <Trash size={14} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. Modal Update Status & Catatan Dinas DLH ── */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-black/10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#19382B] text-[#88d937] flex items-center justify-center">
                    <NotePencil size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#111111]">Verifikasi Laporan DLH</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: #{selectedReport.id}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                  Ubah Status Tindakan DLH <span className="text-red-500">*</span>
                </label>

                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#f8f9f5] border border-black/10 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-[#19382B]"
                >
                  <option value="Pending / Menunggu Verifikasi">Pending / Menunggu Verifikasi</option>
                  <option value="Proses Pemangkasan Lapangan">Proses Pemangkasan Lapangan</option>
                  <option value="Selesai Sirkular Biomassa">Selesai Sirkular Biomassa</option>
                  <option value="Ditolak / Laporan Tidak Valid">Ditolak / Laporan Tidak Valid</option>
                </select>
              </div>

              {/* Admin Note Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                  Catatan Resmi Dinas LH / Instruksi Petugas
                </label>

                <textarea
                  rows={3}
                  placeholder="Contoh: Tim regu 2 DLH dijadwalkan ke lokasi pukul 09:00 WIB untuk pemangkasan tajuk..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="w-full bg-[#f8f9f5] border border-black/10 rounded-2xl p-3 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#19382B] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/10 bg-white hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="flex-[2] py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <CircleNotch size={16} className="animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} weight="bold" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 6. Modal Konfirmasi Hapus Laporan ── */}
      <AnimatePresence>
        {deleteConfirmReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4 text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash size={24} weight="bold" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#111111]">Hapus Laporan Ini?</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Laporan ID #{deleteConfirmReport.id.slice(0, 8)} akan dihapus secara permanen dari sistem database.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmReport(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-[#111111]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReport}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <CircleNotch size={16} className="animate-spin text-white" />
                  ) : (
                    <span>Ya, Hapus</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
