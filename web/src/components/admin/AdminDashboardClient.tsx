"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  CaretDown,
  LockKey,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { uploadReportImage } from "@/lib/storageUtils";
import { TreeImageWithBoundingBox, BoundingBox } from "@/components/TreeImageWithBoundingBox";
import { AdminMapView } from "./AdminMapView";
import { getRiskLevel, riskLevelConfig } from "@/lib/riskLevel";
import { StatusTimeline, parseWibDate } from "@/components/StatusTimeline";

/* ── Custom Floating Label Dropdown Component (Sesuai Contoh di Gambar) ── */
export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  label: string;
  options: CustomSelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className = "",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative font-sans ${className}`}>
      {/* Outer Field Box dengan Floating Label Notch */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white border border-black/20 rounded-2xl px-4 py-2.5 cursor-pointer flex items-center justify-between shadow-2xs hover:border-[#19382B] transition-all group min-w-[180px]"
      >
        {/* Floating Label Notch di Top Border (Persis Gambar Contoh User) */}
        <span className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[10px] font-bold tracking-wider text-[#111111]/60 group-hover:text-[#19382B] transition-colors pointer-events-none">
          {label}
        </span>

        {/* Selected Label */}
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {selectedOption?.icon}
          <span className="text-xs font-bold text-[#111111] truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Chevron Icon */}
        <CaretDown
          size={15}
          weight="bold"
          className={`text-[#111111]/70 group-hover:text-[#19382B] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Animated Dropdown Menu Container (Persis Gambar Contoh User) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 z-[999] max-h-60 overflow-y-auto space-y-0.5"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-gray-100 text-[#111111] font-bold"
                      : "text-[#111111]/80 hover:bg-gray-50 hover:text-[#111111] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} weight="bold" className="text-[#19382B] shrink-0 ml-2" />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const formatLocationDisplay = (loc: any): string => {
  if (!loc) return "Lokasi tidak tersedia";
  if (typeof loc === "string") {
    if (loc.toUpperCase().startsWith("POINT")) return "Koordinat GPS Terdeteksi";
    return loc;
  }
  if (typeof loc === "object") {
    if (loc.address) return loc.address;
    if (loc.name) return loc.name;
    if (Array.isArray(loc.coordinates)) return `GPS (${loc.coordinates.join(", ")})`;
  }
  return String(loc);
};

export const getReportStatusConfig = (statusRaw?: string) => {
  const s = (statusRaw || "").toLowerCase().trim();

  // 1. Laporan Ditutup (Permanen)
  if (
    s.includes("ditutup") ||
    s.includes("dikunci") ||
    s === "closed" ||
    s.includes("closed")
  ) {
    return {
      label: "🔒 Laporan Ditutup",
      bg: "bg-gray-900 text-white",
      text: "text-white font-extrabold",
      border: "border-gray-900",
      isPending: false,
    };
  }

  // 2. Selesai Penanganan (Must be checked before "penanganan")
  if (
    s.includes("selesai") ||
    s.includes("resolved") ||
    s.includes("completed") ||
    s === "done"
  ) {
    return {
      label: "🟢 Selesai Penanganan",
      bg: "bg-emerald-500/15",
      text: "text-emerald-800",
      border: "border-emerald-500/30",
      isPending: false,
    };
  }

  // 2. Ditolak / Tidak Valid
  if (
    s.includes("ditolak") ||
    s.includes("rejected") ||
    s.includes("invalid") ||
    s.includes("batal")
  ) {
    return {
      label: "🔴 Ditolak / Tidak Valid",
      bg: "bg-red-500/10",
      text: "text-red-700",
      border: "border-red-500/20",
      isPending: false,
    };
  }

  // 3. Sedang Ditangani Lapangan
  if (
    s === "sedang ditangani lapangan" ||
    s === "in_progress" ||
    s === "progress" ||
    s.includes("ditangani") ||
    (s.includes("penanganan") && !s.includes("selesai"))
  ) {
    return {
      label: "🟠 Sedang Ditangani Lapangan",
      bg: "bg-orange-500/10",
      text: "text-orange-700",
      border: "border-orange-500/20",
      isPending: false,
    };
  }

  // 4. Penjadwalan Pemangkasan
  if (
    s.includes("jadwal") ||
    s.includes("penjadwalan") ||
    s.includes("scheduled")
  ) {
    return {
      label: "🟡 Penjadwalan Pemangkasan",
      bg: "bg-amber-500/10",
      text: "text-amber-800",
      border: "border-amber-500/20",
      isPending: false,
    };
  }

  // 5. Terverifikasi DLH
  if (s === "terverifikasi dlh" || s === "terverifikasi" || s === "verified") {
    return {
      label: "🔵 Terverifikasi DLH",
      bg: "bg-blue-500/10",
      text: "text-blue-700",
      border: "border-blue-500/20",
      isPending: false,
    };
  }

  // 6. Menunggu Verifikasi
  if (s === "pending" || s.includes("menunggu") || s === "") {
    return {
      label: "🔴 Menunggu Verifikasi",
      bg: "bg-red-500/10",
      text: "text-red-700",
      border: "border-red-500/20",
      isPending: true,
    };
  }

  return {
    label: `📌 ${statusRaw}`,
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
    isPending: false,
  };
};

export const parseBoundingBoxes = (item: any): BoundingBox[] => {
  if (!item) return [];
  const raw = item.bounding_box || item.bounding_boxes || item.boundingBoxes;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

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
  updated_at?: string;
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
    <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden border border-black/10 shadow-xs bg-gray-100">
      <div ref={mapRef} className="w-full h-full z-10" />
      <div className="absolute bottom-2 left-2 z-[20] bg-white/90 backdrop-blur-md border border-black/10 rounded-full px-3 py-1 text-[10px] font-bold text-[#19382B] flex items-center gap-1 shadow-xs">
        <MapPin size={12} weight="fill" />
        <span>GPS: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
      </div>
    </div>
  );
};

/* Helper to render modals directly to document.body, completely covering sidebar & top navbar */
const ClientPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
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

  // Lightbox Image Zoom Modal State
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);
  const [previewZoomBoxes, setPreviewZoomBoxes] = useState<BoundingBox[]>([]);
  const [previewZoomRiskScore, setPreviewZoomRiskScore] = useState<number | undefined>(undefined);
  const [deleteConfirmReport, setDeleteConfirmReport] = useState<AdminReportItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Custom Close Report Confirmation Modal State
  const [closeConfirmReport, setCloseConfirmReport] = useState<AdminReportItem | null>(null);

  // Floating Toast Notification State
  const [toast, setToast] = useState<{
    id: string;
    title: string;
    message: string;
    type?: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (
    message: string,
    title = "Data Berhasil Diperbarui",
    type: "success" | "info" | "warning" = "success"
  ) => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const isReportClosed = (report?: AdminReportItem | null) => {
    if (!report) return false;
    const s = (report.status || "").toLowerCase().trim();
    return (
      s.includes("dikunci") ||
      s.includes("ditutup") ||
      s.includes("closed")
    );
  };

  const isCompletedReport = (report?: AdminReportItem | null) => {
    if (!report) return false;
    const s = (report.status || "").toLowerCase().trim();
    return (
      s.includes("selesai") ||
      s.includes("completed") ||
      s.includes("resolved") ||
      s === "done"
    );
  };

  // Lock body scroll when modal or drawer is open
  useEffect(() => {
    if (selectedReport || previewZoomImage || deleteConfirmReport) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedReport, previewZoomImage, deleteConfirmReport]);

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

      const merged = (reportsData || [])
        .map((r: any) => {
          const coords = parseCoordinates(r);
          return {
            ...r,
            latitude: coords ? coords.lat : r.latitude,
            longitude: coords ? coords.lng : r.longitude,
            reporter_name: profileMap[r.user_id]?.name || "Warga",
            reporter_email: profileMap[r.user_id]?.email || (r.user_id ? `${r.user_id.slice(0, 8)}...` : "Pelapor Warga"),
          };
        })
        .sort((a, b) => {
          const rawA = typeof a.risk_score === "number" ? a.risk_score : 0;
          const riskA = rawA <= 1 ? Math.round(rawA * 100) : Math.round(rawA);
          const rawB = typeof b.risk_score === "number" ? b.risk_score : 0;
          const riskB = rawB <= 1 ? Math.round(rawB * 100) : Math.round(rawB);
          return riskB - riskA; // High risk first!
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

  // Filtered & Sorted Reports (Default: High Risk First)
  const filteredReports = reports
    .filter((r) => {
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
          ? (st.includes("selesai") || st.includes("completed")) && !st.includes("ditutup") && !st.includes("dikunci") && st !== "closed"
          : statusFilter === "closed"
          ? st.includes("ditutup") || st.includes("dikunci") || st === "closed"
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
    })
    .sort((a, b) => {
      const rawA = typeof a.risk_score === "number" ? a.risk_score : 0;
      const riskA = rawA <= 1 ? Math.round(rawA * 100) : Math.round(rawA);
      const rawB = typeof b.risk_score === "number" ? b.risk_score : 0;
      const riskB = rawB <= 1 ? Math.round(rawB * 100) : Math.round(rawB);
      return riskB - riskA; // High risk first!
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

      const updatedSelectedReport: AdminReportItem = {
        ...selectedReport,
        status: newStatus,
        admin_note: adminNoteInput,
        proof_image_url: uploadedProofUrl || selectedReport.proof_image_url,
        scheduled_at: scheduledDateTime || selectedReport.scheduled_at,
        updated_at: new Date().toISOString(),
      };

      setSelectedReport(updatedSelectedReport);
      showToast("Status aduan dan tanggapan DLH berhasil diperbarui ke database.", "Data Berhasil Diperbarui");

      setProofFile(null);
      setValidationError(null);
    } catch (err: any) {
      alert(`Terjadi kesalahan saat menyimpan: ${err.message || err}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler Tutup Laporan (Buka Modal Konfirmasi Custom)
  const handleCloseAndLockReport = () => {
    if (!selectedReport) return;
    setCloseConfirmReport(selectedReport);
  };

  // Eksekusi Tutup & Kunci Laporan
  const executeCloseAndLockReport = async () => {
    if (!closeConfirmReport) return;

    setIsUpdating(true);
    try {
      const lockStatus = "Laporan Ditutup";
      const lockPayload = {
        status: lockStatus,
        admin_note: adminNoteInput
          ? `${adminNoteInput}\n[LAPORAN RESMI DITUTUP]`
          : "[LAPORAN RESMI DITUTUP]",
      };

      let { data: updatedRows, error } = await supabaseClient
        .from("reports")
        .update(lockPayload)
        .eq("id", closeConfirmReport.id)
        .select();

      if (error) {
        const { data: fallbackRows, error: fallbackErr } = await supabaseClient
          .from("reports")
          .update({ status: "closed" })
          .eq("id", closeConfirmReport.id)
          .select();

        if (fallbackErr) {
          alert(`Gagal menutup laporan: ${fallbackErr.message}`);
          return;
        }
        updatedRows = fallbackRows;
      }

      await fetchAllReportsAndProfiles();

      const updatedItem: AdminReportItem = (updatedRows && updatedRows[0])
        ? (updatedRows[0] as AdminReportItem)
        : { ...closeConfirmReport, status: lockStatus };

      setSelectedReport(updatedItem);
      setCloseConfirmReport(null);
      showToast("Laporan aduan telah resmi ditutup.", "Laporan Berhasil Ditutup");
    } catch (err: any) {
      alert(`Terjadi kesalahan saat menutup laporan: ${err.message || err}`);
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
      {/* ── 1. Header Minimalis & Stats (Welcome Text Kiri, 4 Card Putih Kanan Sesuai Dashboard Warga) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8"
      >
        {/* Teks Sapaan & Subtitle */}
        <div className="space-y-1.5 min-w-0 max-w-md">
          <div className="inline-flex items-center gap-2 bg-[#ecefe6] text-[#19382B] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 border border-black/5">
            <ShieldCheck size={14} weight="fill" className="text-[#19382B]" />
            <span>Panel Admin Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[2rem] font-semibold tracking-tight text-[#111111] leading-tight">
            Panel Admin <span className="font-serif italic font-medium text-[#0b3d2c]">{adminDisplayName || "DLH Semarang"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Verifikasi aduan pohon rawan, instruksi petugas lapangan, dan tata kelola biomassa kayu sirkular.
          </p>
        </div>

        {/* Metrik KPI (Card Putih Bersih di Pinggir Kanan khas Dashboard Warga) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0 lg:ml-auto">
          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40 mb-1">
              Total Aduan
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#19382B] tracking-tight">
              {totalReports}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-600/70 mb-1">
              Risiko Tinggi
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight">
              {highRiskReports}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600/70 mb-1">
              Verifikasi
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {pendingReports}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700/70 mb-1">
              Sirkular Selesai
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
              {completedReports}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Single Unified Card: Controls, Filters, & Table / Map Display ── */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-xs overflow-hidden">
        {/* Card Header & Controls Section */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-black/5 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Tab View Switcher (Table vs Map) */}
            <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveViewTab("table")}
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeViewTab === "table"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
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
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <MapTrifold size={16} weight="bold" />
                <span>Peta Sebaran Pohon Rawan</span>
              </button>
            </div>

            {/* Action: Pull All Reports Button + Search Bar */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={fetchAllReportsAndProfiles}
                disabled={isLoadingReports}
                className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
                title="Tarik Semua Laporan Terbaru dari Semua Pengguna"
              >
                <ArrowCounterClockwise size={15} className={isLoadingReports ? "animate-spin text-[#88d937]" : "text-[#88d937]"} />
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

          {/* Filter Dropdowns Bar (Custom Floating Label Dropdown Sesuai Contoh Gambar) */}
          <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-gray-100 text-xs">
            <span className="font-bold text-[#111111]/60 flex items-center gap-1.5">
              <Funnel size={14} weight="bold" className="text-[#19382B]" />
              Filter Data:
            </span>

            <CustomSelect
              label="Status Laporan"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "all", label: "Semua Status" },
                { value: "pending", label: "Menunggu Verifikasi (Pending)" },
                { value: "in_progress", label: "Proses Pemangkasan / Ditangani" },
                { value: "completed", label: "Sirkular Selesai" },
                { value: "closed", label: "🔒 Laporan Ditutup" },
                { value: "rejected", label: "Ditolak / Pembatalan" },
              ]}
              className="min-w-[190px]"
            />

            <CustomSelect
              label="Tingkat Risiko"
              value={riskFilter}
              onChange={(val) => setRiskFilter(val)}
              options={[
                { value: "all", label: "Semua Tingkat Risiko" },
                { value: "high", label: "🔴 Risiko Tinggi (> 60)" },
                { value: "medium", label: "🟡 Risiko Sedang (30-60)" },
                { value: "low", label: "🟢 Risiko Rendah (< 30)" },
              ]}
              className="min-w-[190px]"
            />

            <div className="ml-auto text-[11px] font-semibold text-[#111111]/50">
              Menampilkan <span className="font-bold text-[#19382B]">{filteredReports.length}</span> aduan (Urut Risiko Tinggi)
            </div>
          </div>
        </div>

        {/* Display Content: Table or Map */}
        {activeViewTab === "map" ? (
          <div className="p-4 sm:p-6">
            <AdminMapView
              reports={filteredReports}
              onSelectReport={(rep) => handleOpenDetailModal(rep as AdminReportItem)}
            />
          </div>
        ) : (
          /* Minimalist Modern Table View (Tanpa Kolom Volume Biomassa & GPS) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#f8f9f5] border-b border-black/5 text-[#111111]/50 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-5">Foto &amp; ID Laporan</th>
                  <th className="py-4 px-5">Nama Pelapor (Warga)</th>
                  <th className="py-4 px-5">Risiko AI YOLOv8</th>
                  <th className="py-4 px-5">Status &amp; Waktu</th>
                  <th className="py-4 px-5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400 font-medium">
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

                    return (
                      <tr key={report.id} className="hover:bg-[#ecefe6]/30 transition-colors">
                        {/* Foto & ID */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={report.image_url}
                              alt="Kondisi Pohon"
                              onClick={() => setPreviewZoomImage(report.image_url)}
                              className="w-12 h-12 rounded-2xl object-cover border border-black/8 shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              title="Klik untuk memperbesar foto"
                            />
                            <div>
                              <p className="font-mono font-bold text-[#111111] text-[11px] tracking-tight">
                                #{report.id ? report.id.slice(0, 8) : "N/A"}
                              </p>
                              {report.description && (
                                <p className="text-[10px] text-[#111111]/60 line-clamp-1 max-w-[150px] mt-0.5">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Nama Pelapor Warga */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8.5 h-8.5 rounded-full bg-[#19382B] text-[#88d937] flex items-center justify-center text-xs font-extrabold uppercase shrink-0 border border-[#88d937]/30 shadow-2xs">
                              {report.reporter_name ? report.reporter_name[0] : "W"}
                            </div>
                            <div className="overflow-hidden max-w-[170px]">
                              <p className="font-extrabold text-[#111111] truncate text-xs leading-tight">
                                {report.reporter_name || "Warga"}
                              </p>
                              <p className="text-[10px] text-[#111111]/50 truncate mt-0.5">
                                {report.reporter_email || (report.user_id ? `${report.user_id.slice(0, 8)}...` : "Pelapor Warga")}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Risiko AI */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${riskConfig.bgColor} ${riskConfig.textColor} border border-black/5`}
                          >
                            <ShieldWarning size={13} weight="fill" />
                            <span>{riskConfig.label} ({displayRisk}/100)</span>
                          </span>
                        </td>

                        {/* Status & Waktu */}
                        <td className="py-4 px-5">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecefe6] text-[#19382B] mb-0.5 border border-black/5">
                            {report.status || "Pending"}
                          </span>
                          <p className="text-[10px] text-[#111111]/40">
                            {report.created_at
                              ? new Date(report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </p>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDetailModal(report)}
                              className="bg-[#19382B] text-white hover:bg-[#234A39] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                            >
                              <Eye size={14} weight="bold" className="text-[#88d937]" />
                              <span>Detail &amp; Verifikasi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmReport(report)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors border border-red-100 shrink-0"
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
        )}
      </div>

      {/* ── 5. Floating Right Drawer Slide-Over Panel (Role Admin) ── */}
      <ClientPortal>
        <AnimatePresence>
          {selectedReport && (
            <div className="fixed inset-0 z-[99999] flex justify-end font-sans overflow-hidden p-0 pointer-events-none">
              {/* Backdrop Overlay (Click to Close) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedReport(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
              />

              {/* Floating Right Drawer Panel Box */}
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="relative z-10 pointer-events-auto w-full sm:w-[540px] md:w-[600px] max-w-full h-full bg-white shadow-2xl overflow-hidden flex flex-col font-sans border-l border-black/10 rounded-l-[1.8rem] sm:rounded-l-[2.2rem] ml-auto"
              >
                {/* Drawer Top Header Bar */}
                <div className="p-3.5 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[11px] sm:text-xs font-bold font-mono bg-[#f8f9f5] border border-black/10 px-2.5 sm:px-3 py-1 rounded-full text-[#111111]/70 shrink-0">
                      ID #{selectedReport.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-600 flex items-center gap-1 bg-[#f8f9f5] border border-black/10 px-2.5 sm:px-3 py-1 rounded-full shrink-0">
                      <Clock size={13} weight="bold" className="text-gray-400" />
                      <span>
                        {selectedReport.created_at
                          ? (() => {
                              const d = parseWibDate(selectedReport.created_at);
                              return d
                                ? d.toLocaleString("id-ID", {
                                    timeZone: "Asia/Jakarta",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }) + " WIB"
                                : selectedReport.created_at;
                            })()
                          : "-"}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111111] flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Tutup Panel"
                  >
                    <X size={18} weight="bold" />
                  </button>
                </div>

                {/* Drawer Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pb-4">
                  {/* 1. Header Profile Pelapor Warga */}
                  <div className="p-4 sm:p-5 bg-[#f8f9f5]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#19382B] text-[#88d937] flex items-center justify-center font-extrabold text-base uppercase shrink-0 border border-[#88d937]/30 shadow-xs">
                        {selectedReport.reporter_name ? selectedReport.reporter_name[0] : "W"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-[#111111] leading-tight">
                          {selectedReport.reporter_name || "Warga Pelapor"}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                          {selectedReport.reporter_email || "Pelapor Terdaftar"} • {new Date(selectedReport.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const st = getReportStatusConfig(selectedReport.status);
                      return (
                        <span className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border shadow-2xs self-start sm:self-auto ${st.bg} ${st.text} ${st.border}`}>
                          {st.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* 2. Key Metrics Grid (AI Risk, Canopy Volume, Biomass) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-5">
                    {(() => {
                      const rawRisk = typeof selectedReport.risk_score === "number" ? selectedReport.risk_score : 0;
                      const riskLevel = getRiskLevel(rawRisk);
                      const riskConfig = riskLevelConfig[riskLevel];
                      const displayRisk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                      return (
                        <div className="bg-[#f8f9f5] border border-black/5 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Risiko AI</span>
                          <p className="text-sm sm:text-base font-extrabold text-[#19382B]">
                            {displayRisk} <span className="text-[10px] font-normal text-gray-500">/100</span>
                          </p>
                          <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-extrabold uppercase truncate ${riskConfig.bgColor} ${riskConfig.textColor}`}>
                            {riskConfig.label}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="bg-[#f8f9f5] border border-black/5 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Volume Tajuk</span>
                      <p className="text-sm sm:text-base font-extrabold text-[#19382B]">
                        {selectedReport.canopy_volume || 0} <span className="text-[10px] font-normal text-gray-500">m³</span>
                      </p>
                      <span className="text-[9px] text-gray-400 font-semibold truncate">Estimasi Kanopi</span>
                    </div>

                    <div className="bg-[#f8f9f5] border border-black/5 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Biomassa Kayu</span>
                      <p className="text-sm sm:text-base font-extrabold text-[#19382B]">
                        {selectedReport.biomass_estimate || 0} <span className="text-[10px] font-normal text-gray-500">kg</span>
                      </p>
                      <span className="text-[9px] text-gray-400 font-semibold truncate">Potensi Kayu</span>
                    </div>
                  </div>

                  {/* 3. Informasi Umum Aduan — KOORDINAT GPS & TITIK ALAMAT 2 GRID 1 BARIS */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">Informasi Umum Aduan</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                      {(() => {
                        const coords = parseCoordinates(selectedReport);
                        return (
                          <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1 flex flex-col justify-center">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">KOORDINAT GPS</p>
                            <p className="font-bold text-[#111111] text-xs font-mono">
                              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "N/A"}
                            </p>
                          </div>
                        );
                      })()}

                      <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1 flex flex-col justify-center">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">TITIK ALAMAT LOKASI</p>
                        <p className="text-xs font-semibold text-[#111111] leading-relaxed break-words">
                          {formatLocationDisplay(selectedReport.location)}
                        </p>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">CATATAN / DESKRIPSI WARGA</p>
                        <p className="text-xs font-semibold text-[#111111] leading-relaxed break-words">
                          {selectedReport.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4. Lampiran Visual & Peta — UKURAN FOTO DAN PETA SAMA PERSIS */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">Lampiran Visual &amp; Peta (Klik Foto untuk Memperbesar)</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                      {/* Visual Deteksi AI */}
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          <span>Foto &amp; Deteksi AI</span>
                          <span className="text-[#19382B] text-[9px] font-extrabold cursor-pointer">🔍 Klik Perbesar</span>
                        </div>

                        <div
                          onClick={() => {
                            const boxes = parseBoundingBoxes(selectedReport);
                            setPreviewZoomImage(selectedReport.image_url);
                            setPreviewZoomBoxes(boxes);
                            setPreviewZoomRiskScore(selectedReport.risk_score);
                          }}
                          className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-xs h-48 sm:h-52 cursor-pointer relative group flex-1"
                          title="Klik untuk memperbesar foto"
                        >
                          {(() => {
                            const boxes = parseBoundingBoxes(selectedReport);
                            return (
                              <TreeImageWithBoundingBox
                                imageUrl={selectedReport.image_url}
                                boundingBoxes={boxes}
                                riskScore={selectedReport.risk_score}
                                alt="Deteksi AI Pohon Rawan"
                                className="relative w-full h-48 sm:h-52 overflow-hidden rounded-2xl"
                                imgClassName="block w-full h-48 sm:h-52 rounded-2xl object-cover"
                              />
                            );
                          })()}

                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 pointer-events-none z-30">
                            <Eye size={16} weight="bold" />
                            <span>Klik Perbesar</span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Map Lokasi GPS (Ukuran h-48 sm:h-52 Sama Persis dengan Foto) */}
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Peta Lokasi GPS</span>
                        {(() => {
                          const coords = parseCoordinates(selectedReport);
                          return coords ? (
                            <DetailMiniMap lat={coords.lat} lng={coords.lng} />
                          ) : (
                            <div className="h-48 sm:h-52 bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400 font-medium">
                              Lokasi GPS tidak ditemukan
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* 5. Flow Pemantauan Status (Dengan Jadwal & Bukti Terintegrasi) & Catatan Petugas DLH di Paling Bawah */}
                  <div className="p-4 sm:p-5 pt-2 border-t border-gray-100 space-y-3">
                    <StatusTimeline
                      report={selectedReport}
                      onPreviewProof={(url) => {
                        setPreviewZoomImage(url);
                        setPreviewZoomBoxes([]);
                        setPreviewZoomRiskScore(undefined);
                      }}
                    />

                    {selectedReport.admin_note && (
                      <div className="bg-white border border-black/10 p-3.5 sm:p-4 rounded-2xl space-y-1 shadow-2xs mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#19382B] flex items-center gap-1.5">
                          <NotePencil size={14} weight="bold" />
                          Catatan Resmi Petugas DLH:
                        </p>
                        <p className="text-xs font-semibold text-[#111111] leading-relaxed break-words">
                          {selectedReport.admin_note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 5. Ubah Status DLH (Form / Lock Indicator) */}
                  <div className="p-4 sm:p-5 bg-[#f8f9f5]/80 space-y-4 border-t-2 border-[#19382B]/10">
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#19382B] flex items-center gap-1.5">
                      <Sparkle size={15} weight="fill" className="text-[#19382B]" />
                      Instruksi &amp; Perubahan Status DLH
                    </h4>

                    {isReportClosed(selectedReport) ? (
                      <div className="bg-[#19382B]/10 border border-[#19382B]/20 rounded-2xl p-4 sm:p-5 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center mx-auto shadow-xs">
                          <LockKey size={20} weight="bold" />
                        </div>
                        <h5 className="text-xs font-extrabold text-[#19382B]">
                          Laporan Ini Telah Resmi Ditutup &amp; Dikunci Permanen
                        </h5>
                        <p className="text-[11px] font-semibold text-gray-600 leading-relaxed max-w-sm mx-auto">
                          Status aduan ini telah ditutup secara resmi. Seluruh data, tanggal penanganan, dan catatan resmi petugas telah bersifat final dan tidak dapat diubah lagi oleh Admin.
                        </p>
                      </div>
                    ) : (
                      <>
                        <CustomSelect
                          label="Ubah Status DLH"
                          value={newStatus}
                          onChange={(val) => {
                            setNewStatus(val);
                            setValidationError(null);
                          }}
                          options={[
                            { value: "Terverifikasi DLH", label: "🔵 Verifikasi — Terverifikasi DLH" },
                            { value: "Penjadwalan Pemangkasan", label: "🟡 Penjadwalan — Penjadwalan Pemangkasan (Kalender & Jam)" },
                            { value: "Sedang Ditangani Lapangan", label: "🟠 Ditangani — Sedang Ditangani Lapangan" },
                            { value: "Selesai Penanganan", label: "🟢 Selesai — Selesai Penanganan (Wajib Foto Bukti)" },
                            { value: "Ditolak / Laporan Tidak Valid", label: "🔴 Ditolak — Laporan Tidak Valid / Dibatalkan" },
                          ]}
                          className="w-full bg-white"
                        />

                        {(newStatus.toLowerCase().includes("jadwal") ||
                          newStatus.toLowerCase().includes("penjadwalan") ||
                          newStatus.toLowerCase().includes("scheduled")) && (
                          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                <Calendar size={16} weight="bold" className="text-amber-700" />
                                Tanggal &amp; Jam Penjadwalan Penanganan <span className="text-red-500">*</span>
                              </label>
                              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                                Wajib Diisi
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
                          </div>
                        )}

                        {(newStatus.toLowerCase().includes("selesai") ||
                          newStatus.toLowerCase().includes("completed") ||
                          newStatus.toLowerCase().includes("sirkular")) && (
                          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 space-y-3">
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
                              <div className="relative rounded-2xl overflow-hidden border border-emerald-400 shadow-xs">
                                <img
                                  src={proofPreview}
                                  alt="Preview Bukti Selesai"
                                  className="w-full h-40 object-cover cursor-pointer"
                                  onClick={() => setPreviewZoomImage(proofPreview)}
                                />
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
                              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-500/60 hover:border-emerald-600 bg-white rounded-2xl cursor-pointer transition-all hover:bg-emerald-50/50">
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

                        {validationError && (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                            <WarningCircle size={16} weight="fill" className="shrink-0 text-red-600" />
                            <span>{validationError}</span>
                          </div>
                        )}

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
                            className="w-full bg-white border border-black/15 rounded-2xl p-3 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#19382B] resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawer Sticky Action Footer */}
                <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-3 rounded-2xl text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] transition-all cursor-pointer"
                  >
                    Tutup Detail
                  </button>

                  {isReportClosed(selectedReport) ? (
                    <div className="flex-1 max-w-xs py-3 rounded-2xl text-xs font-extrabold bg-gray-200 text-gray-600 flex items-center justify-center gap-1.5 border border-gray-300">
                      <LockKey size={16} weight="bold" />
                      <span>Laporan Ditutup &amp; Dikunci</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
                      {isCompletedReport(selectedReport) && (
                        <button
                          type="button"
                          onClick={handleCloseAndLockReport}
                          disabled={isUpdating}
                          className="px-4 py-3 rounded-2xl text-xs font-extrabold bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                          title="Kunci dan tutup laporan ini secara permanen agar tidak bisa diupdate lagi"
                        >
                          <LockKey size={15} weight="bold" className="text-amber-400" />
                          <span>Tutup Laporan</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveReportStatus}
                        disabled={isUpdating}
                        className="flex-1 py-3 rounded-2xl text-xs font-extrabold bg-[#19382B] text-white hover:bg-[#234A39] flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {isUpdating ? (
                          <>
                            <CircleNotch size={16} className="animate-spin text-[#88d937]" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} weight="bold" className="text-[#88d937]" />
                            <span>Simpan Update</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ClientPortal>

      {/* ── 6. Modal Fullscreen Preview Lightbox Foto (Ukuran Ringkas Desktop & Selalu Menutupi Navbar) ── */}
      <ClientPortal>
        <AnimatePresence>
          {previewZoomImage && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
              {/* Backdrop Overlay Click to Close */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => {
                  setPreviewZoomImage(null);
                  setPreviewZoomBoxes([]);
                }}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex items-center justify-center max-h-[85vh] max-w-[92vw]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setPreviewZoomImage(null);
                    setPreviewZoomBoxes([]);
                  }}
                  className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer shadow-xl border border-white/20 hover:scale-105 active:scale-95"
                  title="Tutup Preview"
                >
                  <X size={18} weight="bold" />
                </button>

                {previewZoomBoxes.length > 0 ? (
                  <TreeImageWithBoundingBox
                    imageUrl={previewZoomImage}
                    boundingBoxes={previewZoomBoxes}
                    riskScore={previewZoomRiskScore}
                    alt="Foto Laporan Diperbesar dengan Deteksi AI"
                    isLightbox={true}
                  />
                ) : (
                  <img
                    src={previewZoomImage}
                    alt="Foto Laporan Diperbesar"
                    className="max-h-[82vh] max-w-[90vw] w-auto h-auto block object-contain rounded-2xl shadow-2xl border border-white/15"
                  />
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ClientPortal>

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

      {/* ── 8. Floating Top Notification Toast (Sesuai Palet Modern Minimalis #19382B & #88d937) ── */}
      <ClientPortal>
        <AnimatePresence>
          {toast && (
            <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100000] w-[92%] max-w-sm pointer-events-auto font-sans">
              <motion.div
                initial={{ y: -40, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -25, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="bg-[#19382B] text-white border border-[#88d937]/30 shadow-2xl rounded-full pl-4 pr-3 py-2.5 flex items-center justify-between gap-3 relative overflow-hidden"
              >
                {/* Subtle Glow */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#88d937]/15 rounded-full blur-xl pointer-events-none" />

                {/* Icon + Text */}
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#19382B] flex items-center justify-center shrink-0 shadow-2xs font-extrabold">
                    <Check size={14} weight="bold" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-extrabold text-white truncate leading-tight tracking-wide">
                      {toast.title}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-200/90 truncate leading-none pt-0.5">
                      {toast.message}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <X size={12} weight="bold" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ClientPortal>
      {/* ── 9. Custom Confirmation Modal: Tutup & Kunci Laporan ── */}
      <ClientPortal>
        <AnimatePresence>
          {closeConfirmReport && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="bg-white border border-black/10 shadow-2xl rounded-3xl p-5 sm:p-6 w-full max-w-sm text-center space-y-4 relative overflow-hidden"
              >
                {/* Lock Icon */}
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                  <LockKey size={24} weight="bold" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-[#111111]">
                    Konfirmasi Tutup Laporan
                  </h4>
                  <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                    Apakah Anda yakin ingin menutup dan mengunci laporan aduan ini? Setelah ditutup, status aduan akan menjadi <span className="font-bold text-[#19382B]">Laporan Ditutup</span> dan data tidak dapat diubah lagi oleh Admin.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCloseConfirmReport(null)}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={executeCloseAndLockReport}
                    disabled={isUpdating}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-extrabold bg-[#19382B] hover:bg-[#234A39] text-white flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <CircleNotch size={16} className="animate-spin text-[#88d937]" />
                    ) : (
                      <>
                        <LockKey size={15} weight="bold" className="text-[#88d937]" />
                        <span>Ya, Tutup &amp; Kunci</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </ClientPortal>
    </div>
  );
};
