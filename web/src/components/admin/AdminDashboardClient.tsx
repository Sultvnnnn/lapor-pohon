"use client";

import { useState, useEffect, useRef } from "react";
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
  Camera,
  UploadSimple,
  WarningCircle,
  Calendar,
  ArrowCounterClockwise,
  User,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { uploadReportImage } from "@/lib/storageUtils";
import { TreeImageWithBoundingBox } from "@/components/TreeImageWithBoundingBox";
import { AdminMapView } from "./AdminMapView";
import { getRiskLevel, riskLevelConfig } from "@/lib/riskLevel";

export const parseCoordinates = (report: any): { lat: number; lng: number } | null => {
  if (!report) return null;

  // 1. Direct numeric latitude & longitude properties
  if (
    typeof report.latitude === "number" &&
    typeof report.longitude === "number" &&
    !isNaN(report.latitude) &&
    !isNaN(report.longitude)
  ) {
    return { lat: report.latitude, lng: report.longitude };
  }

  // 2. Direct string latitude & longitude
  if (report.latitude && report.longitude) {
    const lat = parseFloat(report.latitude);
    const lng = parseFloat(report.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // 3. PostGIS WKT string: "POINT(110.4203 -6.9932)" -> longitude, latitude
  if (typeof report.location === "string") {
    const match = report.location.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
    if (match) {
      const lng = parseFloat(match[1]);
      const lat = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }

    const parts = report.location.split(",");
    if (parts.length === 2) {
      const p1 = parseFloat(parts[0].trim());
      const p2 = parseFloat(parts[1].trim());
      if (!isNaN(p1) && !isNaN(p2)) {
        if (Math.abs(p1) <= 90 && Math.abs(p2) <= 180) {
          return { lat: p1, lng: p2 };
        }
        return { lat: p2, lng: p1 };
      }
    }
  }

  // 4. Object location format: { coordinates: [lng, lat] } or { x: lng, y: lat } or { latitude, longitude }
  if (typeof report.location === "object" && report.location !== null) {
    if (Array.isArray(report.location.coordinates) && report.location.coordinates.length >= 2) {
      const lng = parseFloat(report.location.coordinates[0]);
      const lat = parseFloat(report.location.coordinates[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    if (report.location.latitude !== undefined && report.location.longitude !== undefined) {
      const lat = parseFloat(report.location.latitude);
      const lng = parseFloat(report.location.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    if (report.location.y !== undefined && report.location.x !== undefined) {
      const lat = parseFloat(report.location.y);
      const lng = parseFloat(report.location.x);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
};

export type AdminReportItem = {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  location?: any;
  image_url: string;
  risk_score: number;
  canopy_volume: number;
  biomass_estimate: number;
  bounding_boxes?: any;
  bounding_box?: any;
  status: string;
  description?: string;
  admin_note?: string;
  proof_image_url?: string;
  scheduled_at?: string;
  tree_species?: string;
  tree_type?: string;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
};

interface AdminDashboardClientProps {
  initialReports: AdminReportItem[];
  adminDisplayName: string;
  adminEmail: string;
}

/* ── Mini Interactive Leaflet Map Component for Report Details ── */
const DetailMiniMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (!isMounted || !mapRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        const customIcon = L.divIcon({
          className: "custom-detail-pin",
          html: `<div style="background-color:#19382B; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.35); border:2px solid #88d937;">
            <svg width="18" height="18" viewBox="0 0 256 256" fill="#88d937"><path d="M201.17,59.62a80,80,0,0,0-146.34,0,76,76,0,0,0,61.17,139V232a12,12,0,0,0,24,0V198.64A76.26,76.26,0,0,0,168,204l1.92,0A76,76,0,0,0,201.17,59.62Z"/></svg>
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        L.marker([lat, lng], { icon: customIcon }).addTo(map);
        mapInstanceRef.current = map;
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-black/10 shadow-xs bg-gray-100">
      <div ref={mapRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 left-2 z-[20] bg-white/90 backdrop-blur-md border border-black/10 rounded-full px-3 py-1 text-[10px] font-bold text-[#19382B] flex items-center gap-1 shadow-xs">
        <MapPin size={12} weight="fill" />
        <span>GPS: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
      </div>
    </div>
  );
};

export const AdminDashboardClient = ({
  initialReports,
  adminDisplayName,
  adminEmail,
}: AdminDashboardClientProps) => {
  const supabaseClient = createClient();

  const [reports, setReports] = useState<AdminReportItem[]>(initialReports);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<"table" | "map">("table");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Comprehensive Report Detail & Workflow Action Modal State
  const [selectedReport, setSelectedReport] = useState<AdminReportItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNoteInput, setAdminNoteInput] = useState<string>("");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmReport, setDeleteConfirmReport] = useState<AdminReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Tarik Semua Data Report dari Semua Pengguna + Profile Mapping ──
  const fetchAllReportsAndProfiles = async () => {
    setIsLoadingReports(true);
    try {
      const { data: reportsData, error: reportsErr } = await supabaseClient
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (reportsErr) {
        console.error("Error fetching reports:", reportsErr);
        return;
      }

      // Fetch profiles to map user_id -> email & full_name
      const { data: profilesData } = await supabaseClient
        .from("profiles")
        .select("id, full_name, email");

      const profileMap: Record<string, { name: string; email: string }> = {};
      if (profilesData) {
        profilesData.forEach((p) => {
          profileMap[p.id] = {
            name: p.full_name || "Warga",
            email: p.email || "",
          };
        });
      }

      const merged = (reportsData || []).map((r: any) => {
        const coords = parseCoordinates(r);
        return {
          ...r,
          latitude: coords ? coords.lat : r.latitude,
          longitude: coords ? coords.lng : r.longitude,
          reporter_name: profileMap[r.user_id]?.name || "Warga",
          reporter_email: profileMap[r.user_id]?.email || (r.user_id ? `${r.user_id.slice(0, 8)}...` : "Pelapor Warga"),
        };
      });

      setReports(merged);
    } catch (err) {
      console.error("Error pulling all user reports:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchAllReportsAndProfiles();
  }, []);

  // KPI Computations
  const totalReports = reports.length;
  const highRiskReports = reports.filter((r) => {
    const rawRisk = typeof r.risk_score === "number" ? r.risk_score : 0;
    const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
    return risk > 60;
  }).length;
  const pendingReports = reports.filter((r) =>
    (r.status || "").toLowerCase().includes("pending") || (r.status || "").toLowerCase().includes("menunggu")
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
      (r.reporter_name && r.reporter_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.reporter_email && r.reporter_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const st = (r.status || "").toLowerCase();
    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "pending"
        ? st.includes("pending") || st.includes("menunggu")
        : statusFilter === "in_progress"
        ? st.includes("proses") || st.includes("progress") || st.includes("survei") || st.includes("ditangani") || st.includes("jadwal")
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

  // Open Detail Modal Handler
  const handleOpenDetailModal = (report: AdminReportItem) => {
    setSelectedReport(report);
    setNewStatus(report.status || "Terverifikasi DLH");
    setAdminNoteInput(report.admin_note || "");
    setScheduledDateTime(report.scheduled_at || "");
    setProofFile(null);
    setProofPreview(report.proof_image_url || null);
    setValidationError(null);
  };

  // Handler Save Status, Schedule Date & Proof Image
  const handleSaveReportStatus = async () => {
    if (!selectedReport || !newStatus) return;

    const isMarkingCompleted =
      newStatus.toLowerCase().includes("selesai") ||
      newStatus.toLowerCase().includes("completed") ||
      newStatus.toLowerCase().includes("sirkular");

    const isScheduling =
      newStatus.toLowerCase().includes("jadwal") ||
      newStatus.toLowerCase().includes("penjadwalan");

    // Mandatory Proof Image validation when marking as Selesai
    if (isMarkingCompleted && !proofFile && !proofPreview && !selectedReport.proof_image_url) {
      setValidationError("Wajib mengunggah foto bukti penanganan dari galeri untuk menyelesaikan laporan.");
      return;
    }

    // Schedule DateTime validation when status is Penjadwalan
    if (isScheduling && !scheduledDateTime) {
      setValidationError("Harap tentukan tanggal dan jam penjadwalan penanganan.");
      return;
    }

    setIsUpdating(true);
    setValidationError(null);

    try {
      let uploadedProofUrl = selectedReport.proof_image_url || "";

      // Upload proof file if user selected a new file from gallery
      if (proofFile) {
        uploadedProofUrl = await uploadReportImage(proofFile);
      }

      let formattedScheduleText = "";
      if (scheduledDateTime) {
        const d = new Date(scheduledDateTime);
        formattedScheduleText = d.toLocaleString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      const updatePayload: any = {
        status: newStatus,
        admin_note: adminNoteInput,
      };

      if (uploadedProofUrl) {
        updatePayload.proof_image_url = uploadedProofUrl;
      }

      if (scheduledDateTime) {
        updatePayload.scheduled_at = scheduledDateTime;
      }

      let { data: updatedRows, error } = await supabaseClient
        .from("reports")
        .update(updatePayload)
        .eq("id", selectedReport.id)
        .select();

      // If Postgres ENUM report_status constraint error occurs, fallback to standard enum values
      if (error && (error.message.includes("enum") || error.code === "22P02")) {
        console.warn("[WARN] Enum constraint error detected, falling back to standard enum values:", error.message);
        
        let enumMappedStatus = "in_progress";
        const stLower = newStatus.toLowerCase();
        if (stLower.includes("selesai") || stLower.includes("completed") || stLower.includes("sirkular")) {
          enumMappedStatus = "resolved";
        } else if (stLower.includes("ditolak") || stLower.includes("rejected")) {
          enumMappedStatus = "rejected";
        } else if (stLower.includes("pending") || stLower.includes("menunggu")) {
          enumMappedStatus = "pending";
        }

        const enumPayload = {
          ...updatePayload,
          status: enumMappedStatus,
        };

        const { data: enumFallbackRows, error: enumErr } = await supabaseClient
          .from("reports")
          .update(enumPayload)
          .eq("id", selectedReport.id)
          .select();

        if (enumErr) {
          alert(`Gagal memperbarui status: ${enumErr.message}. Silakan jalankan skrip SQL di Supabase SQL Editor.`);
          return;
        }
        updatedRows = enumFallbackRows;
      } else if (error) {
        console.warn("[WARN] Primary payload update error, attempting status only fallback:", error.message);
        
        const { data: fallbackRows, error: statusOnlyError } = await supabaseClient
          .from("reports")
          .update({ status: newStatus })
          .eq("id", selectedReport.id)
          .select();

        if (statusOnlyError) {
          alert(`Gagal memperbarui status: ${statusOnlyError.message}`);
          return;
        } else if (!fallbackRows || fallbackRows.length === 0) {
          alert("Peringatan RLS Supabase: 0 baris ter-update. RLS Policy di Supabase memblokir izin UPDATE untuk akun Admin. Silakan jalankan skrip SQL RLS Policy yang disediakan di Supabase SQL Editor.");
          return;
        }
      } else if (!updatedRows || updatedRows.length === 0) {
        alert("Peringatan RLS Supabase: 0 baris ter-update. RLS Policy di Supabase memblokir izin UPDATE untuk akun Admin. Silakan jalankan skrip SQL RLS Policy yang disediakan di Supabase SQL Editor.");
        return;
      }

      // Insert or Update biomass_catalogs entry when report is verified/approved/completed
      try {
        const treeSpeciesName = selectedReport.tree_species || selectedReport.tree_type || "Pohon Kayu Olahan";
        const calculatedBiomassKg = selectedReport.biomass_estimate
          ? Number(selectedReport.biomass_estimate)
          : selectedReport.canopy_volume
          ? Number(selectedReport.canopy_volume) * 10
          : 100.0;

        const { data: existingCatalog } = await supabaseClient
          .from("biomass_catalogs")
          .select("id")
          .eq("report_id", selectedReport.id)
          .maybeSingle();

        if (!existingCatalog) {
          await supabaseClient.from("biomass_catalogs").insert({
            report_id: selectedReport.id,
            wood_type: treeSpeciesName,
            volume_kg: calculatedBiomassKg,
            status: "available",
          });
        } else {
          await supabaseClient
            .from("biomass_catalogs")
            .update({
              wood_type: treeSpeciesName,
              volume_kg: calculatedBiomassKg,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingCatalog.id);
        }
      } catch (biomassErr) {
        console.warn("[NOTICE] biomass_catalogs auto-sync notice:", biomassErr);
      }

      // Update local state and refetch from Supabase database
      await fetchAllReportsAndProfiles();

      setSelectedReport(null);
      setProofFile(null);
      setProofPreview(null);
      setScheduledDateTime("");
      setValidationError(null);
    } catch (err: any) {
      alert(`Terjadi kesalahan saat menyimpan: ${err.message || err}`);
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/50">Total Laporan Warga</p>
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

          {/* Action: Pull All Reports Button + Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={fetchAllReportsAndProfiles}
              disabled={isLoadingReports}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
              title="Tarik Semua Laporan Terbaru dari Semua Pengguna"
            >
              <ArrowCounterClockwise size={15} className={isLoadingReports ? "animate-spin" : ""} />
              <span>{isLoadingReports ? "Memuat Data..." : "Tarik Semua Laporan"}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari ID / pelapor / catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9f5] border border-black/8 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
              />
            </div>
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
            <option value="in_progress">Proses Pemangkasan / Ditangani</option>
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
        <AdminMapView
          reports={filteredReports}
          onSelectReport={(rep) => handleOpenDetailModal(rep as AdminReportItem)}
        />
      ) : (
        /* Data Table View (Semua Data Laporan Semua Pengguna) */
        <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#ecefe6]/60 border-b border-black/5 text-[#111111]/70 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Foto &amp; ID Laporan</th>
                  <th className="py-3.5 px-4">Pelapor (Warga)</th>
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
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                      Tidak ada laporan aduan warga yang sesuai dengan kriteria filter.
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
                                <p className="text-[10px] text-[#111111]/60 line-clamp-1 max-w-[130px]">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Pelapor Warga */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#19382B] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              <User size={13} weight="bold" />
                            </div>
                            <div className="overflow-hidden max-w-[140px]">
                              <p className="font-bold text-[#111111] truncate text-[11px]">
                                {report.reporter_name || "Warga"}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {report.reporter_email || report.user_id?.slice(0, 8) || "Anonim"}
                              </p>
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
                              onClick={() => handleOpenDetailModal(report)}
                              className="bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                            >
                              <Eye size={14} weight="bold" />
                              <span>Detail &amp; Verifikasi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmReport(report)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 rounded-full border border-red-200 transition-all shrink-0"
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

      {/* ── 5. Comprehensive Report Detail & Workflow Action Modal DLH ── */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-md font-sans overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 my-auto flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-[#19382B] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#88d937] text-[#19382B] flex items-center justify-center font-bold shadow-xs">
                    <Eye size={22} weight="bold" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                      Detail Aduan &amp; Instuksi DLH
                    </h3>
                    <p className="text-xs text-white/70 font-mono">
                      ID: #{selectedReport.id ? selectedReport.id.slice(0, 10) : "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Modal Body Grid */}
              <div className="p-5 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Left Column: Visual Foto Warga + Bounding Box AI + Mini Map ── */}
                <div className="space-y-4">
                  {/* Citizen Photo Card */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                      <Camera size={15} weight="bold" className="text-[#19382B]" />
                      Foto Lokasi Unggahan Warga
                    </label>

                    <div className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-xs">
                      {(() => {
                        const rawBoxes = selectedReport.bounding_box || selectedReport.bounding_boxes;
                        const hasBoxes = Array.isArray(rawBoxes) && rawBoxes.length > 0;
                        return hasBoxes ? (
                          <TreeImageWithBoundingBox
                            imageUrl={selectedReport.image_url}
                            boundingBoxes={rawBoxes}
                            alt="Deteksi AI Pohon Rawan"
                          />
                        ) : (
                          <img
                            src={selectedReport.image_url}
                            alt="Foto Pohon Rawan"
                            className="w-full h-56 sm:h-64 object-cover"
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Foto Bukti Penanganan Selesai (Jika Sudah Ada) */}
                  {selectedReport.proof_image_url && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle size={15} weight="fill" className="text-emerald-600" />
                        Foto Bukti Selesai Penanganan
                      </label>
                      <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-xs">
                        <img
                          src={selectedReport.proof_image_url}
                          alt="Bukti Selesai Penanganan DLH"
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mini Map Preview */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                      <MapPin size={15} weight="bold" className="text-[#19382B]" />
                      Peta Titik Lokasi Pohon
                    </label>

                    {(() => {
                      const coords = parseCoordinates(selectedReport);
                      return coords ? (
                        <DetailMiniMap lat={coords.lat} lng={coords.lng} />
                      ) : (
                        <div className="h-36 bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400 font-medium">
                          Lokasi GPS tidak ditemukan
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* ── Right Column: AI Metrics + Report Info + Action Workflow ── */}
                <div className="space-y-5">
                  {/* AI Metrics Summary Grid */}
                  <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
                        Hasil Analisis Radar Pohon AI
                      </span>
                      {(() => {
                        const rawRisk = typeof selectedReport.risk_score === "number" ? selectedReport.risk_score : 0;
                        const riskLevel = getRiskLevel(rawRisk);
                        const riskConfig = riskLevelConfig[riskLevel];
                        const displayRisk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
                        return (
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${riskConfig.bgColor} ${riskConfig.textColor}`}>
                            {riskConfig.label} ({displayRisk}/100)
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-black/5">
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <p className="text-[10px] text-[#111111]/50 font-medium">Estimasi Volume Tajuk</p>
                        <p className="text-sm font-extrabold text-[#19382B] mt-0.5">
                          {selectedReport.canopy_volume || 0} m³
                        </p>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/5">
                        <p className="text-[10px] text-[#111111]/50 font-medium">Estimasi Biomassa Kayu</p>
                        <p className="text-sm font-extrabold text-[#19382B] mt-0.5">
                          {selectedReport.biomass_estimate || 0} kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi & Informasi Aduan Warga */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#111111]/60 font-medium">
                      <span>Pelapor Warga:</span>
                      <span className="font-bold text-[#111111]">
                        {selectedReport.reporter_name || "Warga"} ({selectedReport.reporter_email || "Anonim"})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#111111]/60 font-medium">
                      <span>Waktu Laporan:</span>
                      <span className="font-bold text-[#111111]">
                        {selectedReport.created_at
                          ? new Date(selectedReport.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>

                    <div className="bg-white border border-black/8 rounded-2xl p-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
                        Catatan / Deskripsi Warga:
                      </span>
                      <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                        {selectedReport.description || "Tidak ada catatan deskripsi tambahan dari pelapor."}
                      </p>
                    </div>
                  </div>

                  {/* ── 1. Pilih Tindakan (Dropdown Menu Status DLH) ── */}
                  <div className="space-y-2.5 pt-1 border-t border-gray-100">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/80 flex items-center gap-1.5">
                      <Sparkle size={15} weight="fill" className="text-[#19382B]" />
                      Pilih Tindakan / Ubah Status DLH <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={newStatus}
                      onChange={(e) => {
                        setNewStatus(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-2xl px-4 py-3 text-xs font-extrabold text-[#111111] focus:outline-none focus:border-[#19382B] shadow-xs cursor-pointer"
                    >
                      <option value="Terverifikasi DLH">🔵 Verifikasi — Terverifikasi DLH</option>
                      <option value="Proses Survei Lapangan">🟣 Survei — Proses Survei Lapangan</option>
                      <option value="Penjadwalan Pemangkasan">🟡 Penjadwalan — Penjadwalan Pemangkasan (Kalender &amp; Jam)</option>
                      <option value="Sedang Ditangani Lapangan">🟠 Ditangani — Sedang Ditangani Lapangan</option>
                      <option value="Selesai Penanganan">🟢 Selesai — Selesai Penanganan (Wajib Foto Bukti)</option>
                      <option value="Ditolak / Laporan Tidak Valid">🔴 Ditolak — Laporan Tidak Valid / Dibatalkan</option>
                    </select>
                  </div>

                  {/* ── 2. Kalender & Jam Penjadwalan (Muncul saat status Penjadwalan Pemangkasan) ── */}
                  {(newStatus.toLowerCase().includes("jadwal") ||
                    newStatus.toLowerCase().includes("penjadwalan") ||
                    newStatus.toLowerCase().includes("scheduled")) && (
                    <div className="bg-amber-50/80 border border-amber-500/30 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <Calendar size={16} weight="bold" className="text-amber-700" />
                          Tanggal &amp; Jam Penjadwalan Penanganan <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                          Kalender &amp; Jam
                        </span>
                      </div>

                      <input
                        type="datetime-local"
                        value={scheduledDateTime}
                        onChange={(e) => {
                          setScheduledDateTime(e.target.value);
                          setValidationError(null);
                        }}
                        className="w-full bg-white border border-amber-300 rounded-xl px-4 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:border-amber-600 shadow-xs cursor-pointer"
                      />
                      <p className="text-[10px] text-amber-800 font-semibold">
                        Tentukan waktu pelaksanaan pemangkasan/penanganan pohon oleh tim regu DLH.
                      </p>
                    </div>
                  )}

                  {/* ── 3. Form Unggah Foto Bukti (Wajib saat status 'Selesai') ── */}
                  {(newStatus.toLowerCase().includes("selesai") ||
                    newStatus.toLowerCase().includes("completed") ||
                    newStatus.toLowerCase().includes("sirkular")) && (
                    <div className="bg-emerald-50/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <Camera size={16} weight="bold" className="text-emerald-700" />
                          Foto Bukti Penanganan Selesai <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200/60 px-2.5 py-0.5 rounded-full">
                          Wajib dari Galeri
                        </span>
                      </div>

                      {proofPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 shadow-xs">
                          <img src={proofPreview} alt="Preview Bukti Selesai" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setProofFile(null);
                              setProofPreview(null);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md"
                            title="Ganti Foto Bukti"
                          >
                            <X size={15} weight="bold" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-600/40 hover:border-emerald-600 bg-white rounded-2xl cursor-pointer transition-all hover:bg-emerald-50/50">
                          <UploadSimple size={26} weight="bold" className="text-emerald-700 mb-1" />
                          <span className="text-xs font-bold text-[#111111]">Pilih Foto Bukti Selesai (Galeri)</span>
                          <span className="text-[10px] text-gray-500 mt-0.5">Pilih foto penanganan yang sudah rampung</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProofFile(file);
                                setProofPreview(URL.createObjectURL(file));
                                setValidationError(null);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Validation Error Banner */}
                  {validationError && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                      <WarningCircle size={16} weight="fill" className="shrink-0 text-red-600" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Input Catatan Resmi Dinas / Instruksi Regu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                      <NotePencil size={15} weight="bold" className="text-[#19382B]" />
                      Catatan Resmi Dinas LH / Instruksi Regu
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Contoh: Tim regu 2 DLH telah memangkas dahan rawan dan biomassa kayu dikirim ke bank sampah..."
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-2xl p-3 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#19382B] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="bg-[#f8f9f5] p-4 sm:p-5 border-t border-black/5 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold border border-black/10 bg-white hover:bg-gray-100 text-[#111111]"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={handleSaveReportStatus}
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <CircleNotch size={16} className="animate-spin text-[#88d937]" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} weight="bold" className="text-[#88d937]" />
                      <span>Simpan Perubahan Status</span>
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
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
