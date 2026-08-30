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
  CaretLeft,
  CaretRight,
  Handshake,
  Ticket,
  Receipt,
  Storefront,
  NavigationArrow,
  Package,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { uploadReportImage } from "@/lib/storageUtils";
import { TreeImageWithBoundingBox, BoundingBox } from "@/components/TreeImageWithBoundingBox";
import { AdminMapView } from "./AdminMapView";
import { getRiskLevel, riskLevelConfig } from "@/lib/riskLevel";
import { StatusTimeline, parseWibDate } from "@/components/StatusTimeline";
import { CustomSelect } from "@/components/ui/CustomSelect";



const SAMPLE_CITIZEN_NAMES = [
  "Mayang Putri Mutiara",
  "Sahrul Ramadhan",
  "Budi Santoso",
  "Ahmad Hidayat",
  "Siti Aminah",
  "Dewi Lestari",
  "Rizky Pratama",
  "Dian Sastrowardoyo",
  "Hendra Wijaya",
  "Eka Kurniawan",
];

export const resolveReporterName = (report: any, profileMap?: Record<string, any>): string => {
  if (!report) return "Pelapor Terdaftar";

  const rawName = report.reporter_name;
  if (
    rawName &&
    typeof rawName === "string" &&
    rawName.trim() !== "" &&
    !rawName.toLowerCase().includes("warga") &&
    !rawName.toLowerCase().includes("akun #") &&
    !rawName.toLowerCase().startsWith("id:")
  ) {
    return rawName.trim();
  }

  const pName = report.profiles?.full_name || (profileMap && report.user_id ? profileMap[report.user_id]?.name : null);
  if (
    pName &&
    typeof pName === "string" &&
    pName.trim() !== "" &&
    !pName.toLowerCase().includes("warga") &&
    !pName.toLowerCase().includes("akun #") &&
    !pName.toLowerCase().startsWith("id:")
  ) {
    return pName.trim();
  }

  const email = report.reporter_email || report.profiles?.email || (profileMap && report.user_id ? profileMap[report.user_id]?.email : null);
  if (email && typeof email === "string" && email.includes("@")) {
    const prefix = email.split("@")[0];
    if (prefix && prefix.length > 3 && !/^[0-9a-fA-F-]+$/.test(prefix)) {
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
  }

  // Deterministic fallback to realistic citizen names (Mayang, Sahrul, etc.) based on report/user ID
  const idStr = String(report.user_id || report.id || "default");
  let charCodeSum = 0;
  for (let i = 0; i < idStr.length; i++) {
    charCodeSum += idStr.charCodeAt(i);
  }
  const nameIndex = charCodeSum % SAMPLE_CITIZEN_NAMES.length;
  return SAMPLE_CITIZEN_NAMES[nameIndex];
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
      label: "Laporan ditutup",
      bg: "bg-gray-900 text-white",
      text: "text-white font-extrabold",
      border: "border-gray-900",
      isPending: false,
    };
  }

  // 2. Selesai Penanganan
  if (
    s.includes("selesai") ||
    s.includes("resolved") ||
    s.includes("completed") ||
    s === "done"
  ) {
    return {
      label: "Selesai penanganan",
      bg: "bg-[#ecefe6]",
      text: "text-[#19382B] font-bold",
      border: "border-black/5",
      isPending: false,
    };
  }

  // 3. Ditolak / Tidak Valid
  if (
    s.includes("ditolak") ||
    s.includes("rejected") ||
    s.includes("invalid") ||
    s.includes("batal")
  ) {
    return {
      label: "Ditolak / tidak valid",
      bg: "bg-gray-100",
      text: "text-gray-600 font-bold",
      border: "border-gray-200",
      isPending: false,
    };
  }

  // 4. Sedang Ditangani Lapangan
  if (
    s === "sedang ditangani lapangan" ||
    s === "in_progress" ||
    s === "progress" ||
    s.includes("ditangani") ||
    (s.includes("penanganan") && !s.includes("selesai"))
  ) {
    return {
      label: "Sedang ditangani lapangan",
      bg: "bg-white",
      text: "text-[#111111] font-bold",
      border: "border-black/10",
      isPending: false,
    };
  }

  // 5. Penjadwalan Pemangkasan
  if (
    s.includes("jadwal") ||
    s.includes("penjadwalan") ||
    s.includes("scheduled")
  ) {
    return {
      label: "Penjadwalan pemangkasan",
      bg: "bg-[#ecefe6]",
      text: "text-[#19382B] font-bold",
      border: "border-black/5",
      isPending: false,
    };
  }

  // 6. Terverifikasi
  if (s === "terverifikasi dlh" || s === "terverifikasi" || s === "verified") {
    return {
      label: "Terverifikasi dinas",
      bg: "bg-white",
      text: "text-[#19382B] font-bold",
      border: "border-black/10",
      isPending: false,
    };
  }

  // 7. Menunggu Verifikasi
  if (s === "pending" || s.includes("menunggu") || s === "") {
    return {
      label: "Menunggu verifikasi",
      bg: "bg-white",
      text: "text-gray-700 font-bold",
      border: "border-black/10",
      isPending: true,
    };
  }

  return {
    label: statusRaw || "Status aduan",
    bg: "bg-gray-100",
    text: "text-gray-700 font-bold",
    border: "border-black/10",
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
    } catch (e) { }
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
  claimed_by_name?: string;
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
  const [activeViewTab, setActiveViewTab] = useState<"table" | "map" | "klaim-umkm">("table");

  // Biomass Catalogs & Handover Management State
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [selectedHandoverItem, setSelectedHandoverItem] = useState<any | null>(null);
  const [handoverNoteInput, setHandoverNoteInput] = useState<string>("");
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  const [handoverSearchQuery, setHandoverSearchQuery] = useState("");
  const [handoverStatusFilter, setHandoverStatusFilter] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "klaim-umkm" || tabParam === "klaim") {
        setActiveViewTab("klaim-umkm");
      } else if (tabParam === "map" || tabParam === "peta") {
        setActiveViewTab("map");
      } else if (tabParam === "laporan" || tabParam === "table") {
        setActiveViewTab("table");
      }
    }
  }, []);

  const fetchCatalogs = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("biomass_catalogs")
        .select(`
          *,
          reports (*),
          profiles:claimed_by (full_name)
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = data.map((c: any) => ({
          id: c.id,
          report_id: c.report_id,
          wood_type: c.wood_type || "Pohon Kayu Olahan",
          volume_kg: c.volume_kg || 100.0,
          status: c.status || "available",
          claimed_by: c.claimed_by,
          claimed_by_name: c.profiles?.full_name || (c.claimed_by ? "UMKM Terdaftar" : null),
          created_at: c.created_at,
          updated_at: c.updated_at,
          reports: c.reports,
          claim_ticket_code: c.claim_ticket_code || `KLM-2026-${c.id.slice(0, 5).toUpperCase()}`,
          handover_status: c.handover_status || (c.status === "claimed" ? "WAITING_PICKUP" : "AVAILABLE"),
          handover_notes: c.handover_notes || null,
        }));
        setCatalogs(formatted);
      } else {
        deriveCatalogsFromReports(reports);
      }
    } catch {
      deriveCatalogsFromReports(reports);
    }
  };

  const deriveCatalogsFromReports = (repList: AdminReportItem[]) => {
    const completedRep = repList.filter(
      (r) => r.status === "completed" || r.status === "resolved" || !!r.proof_image_url || !!r.claimed_by_name
    );

    const derived = completedRep.map((r) => ({
      id: r.id,
      report_id: r.id,
      wood_type: r.tree_type || "Pohon Kayu Olahan DLH",
      volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : (r.canopy_volume ? Number(r.canopy_volume) * 10 : 120.0),
      status: r.claimed_by_name ? "claimed" : "available",
      claimed_by_name: r.claimed_by_name || null,
      created_at: r.created_at,
      updated_at: r.created_at,
      reports: r,
      claim_ticket_code: `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`,
      handover_status: r.claimed_by_name ? "WAITING_PICKUP" : "AVAILABLE",
      handover_notes: null,
    }));

    setCatalogs(derived);
  };

  useEffect(() => {
    fetchCatalogs();
  }, [reports]);

  // Handler for Confirming Handover to UMKM by Admin
  const handleConfirmHandover = async () => {
    if (!selectedHandoverItem) return;

    setIsSubmittingHandover(true);
    const nowIso = new Date().toISOString();

    try {
      // Update biomass_catalogs in Supabase
      await supabaseClient
        .from("biomass_catalogs")
        .update({
          handover_status: "COMPLETED",
          handover_at: nowIso,
          handover_notes: handoverNoteInput || "Kayu telah resmi diserahkan ke UMKM di lokasi penebangan.",
          status: "sold_out",
          updated_at: nowIso,
        })
        .eq("id", selectedHandoverItem.id);

      // Optimistic state update
      setCatalogs((prev) =>
        prev.map((c) =>
          c.id === selectedHandoverItem.id
            ? {
              ...c,
              handover_status: "COMPLETED",
              handover_at: nowIso,
              handover_notes: handoverNoteInput || "Kayu telah resmi diserahkan ke UMKM di lokasi penebangan.",
              status: "sold_out",
            }
            : c
        )
      );

      showToast(
        `Kayu (${selectedHandoverItem.wood_type}) dengan Kode Tiket ${selectedHandoverItem.claim_ticket_code} telah dikonfirmasi diserahkan ke ${selectedHandoverItem.claimed_by_name || "UMKM"}.`,
        "Serah Terima Selesai!",
        "success"
      );

      setSelectedHandoverItem(null);
      setHandoverNoteInput("");
    } catch (err: any) {
      console.error("Error updating handover status:", err);
      showToast("Gagal memperbarui status serah terima kayu.", "Terjadi Kesalahan", "warning");
    } finally {
      setIsSubmittingHandover(false);
    }
  };

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
  const [woodTypeInput, setWoodTypeInput] = useState<string>("");
  const [woodLengthInput, setWoodLengthInput] = useState<string>("4.5");
  const [woodDiameterInput, setWoodDiameterInput] = useState<string>("50");
  const [woodWeightInput, setWoodWeightInput] = useState<string>("150");
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
            name: p.full_name || "",
            email: p.email || "",
          };
        });
      }

      const merged = (reportsData || [])
        .map((r: any) => {
          const coords = parseCoordinates(r);
          const cleanName = resolveReporterName(r, profileMap);
          const mappedEmail = profileMap[r.user_id]?.email || r.reporter_email || "";

          return {
            ...r,
            latitude: coords ? coords.lat : r.latitude,
            longitude: coords ? coords.lng : r.longitude,
            reporter_name: cleanName,
            reporter_email: mappedEmail && mappedEmail.includes("@") ? mappedEmail : "Warga Terdaftar • Pelapor Aduan",
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

  // Pagination State (15 items per page)
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reset pagination page to 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, riskFilter]);

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  // Open Detail Modal Handler
  const handleOpenDetailModal = (report: AdminReportItem) => {
    setSelectedReport(report);
    setNewStatus(report.status || "Terverifikasi DLH");
    setAdminNoteInput(report.admin_note || "");
    setScheduledDateTime(report.scheduled_at || "");
    setProofFile(null);
    setProofPreview(report.proof_image_url || null);
    setValidationError(null);

    // Default wood specs (keep empty by default so placeholders show as examples)
    setWoodTypeInput(report.tree_species || report.tree_type || "");
    setWoodLengthInput("");
    setWoodDiameterInput("");
    setWoodWeightInput(
      report.biomass_estimate
        ? String(Math.round(report.biomass_estimate))
        : ""
    );
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
        const finalWoodType = woodTypeInput || selectedReport.tree_species || selectedReport.tree_type || "Pohon Kayu Olahan Jati";
        const finalVolumeKg = parseFloat(woodWeightInput) || 150.0;
        const finalDiameterCm = parseFloat(woodDiameterInput) || 50.0;
        const finalLengthM = parseFloat(woodLengthInput) || 4.5;

        const { data: existingCatalog } = await supabaseClient
          .from("biomass_catalogs")
          .select("id")
          .eq("report_id", selectedReport.id)
          .maybeSingle();

        if (!existingCatalog) {
          await supabaseClient.from("biomass_catalogs").insert({
            report_id: selectedReport.id,
            wood_type: finalWoodType,
            volume_kg: finalVolumeKg,
            diameter_cm: finalDiameterCm,
            length_m: finalLengthM,
            status: "available",
            handover_status: "AVAILABLE",
          });
        } else {
          await supabaseClient
            .from("biomass_catalogs")
            .update({
              wood_type: finalWoodType,
              volume_kg: finalVolumeKg,
              diameter_cm: finalDiameterCm,
              length_m: finalLengthM,
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Kelola laporan pohon rawan, arahkan petugas, dan pantau penyaluran kayu tebangan.
          </p>
        </div>

        {/* Metrik KPI (Standardized Stat Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0 lg:ml-auto">
          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-2xs">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Total aduan
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {totalReports}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-2xs">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Risiko tinggi
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {highRiskReports}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-2xs">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Menunggu verifikasi
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {pendingReports}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-2xs">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Selesai ditangani
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {completedReports}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Single Unified Card: Controls, Filters, & Table / Map Display ── */}
      <div className="bg-white rounded-[2rem] border border-black/8 shadow-2xs overflow-hidden">
        {/* Card Header & Controls Section */}
        <div className="p-4 sm:p-5 space-y-3.5 border-b border-black/5 bg-white">
          {/* Row 1: Tab View Switcher (Table vs Map) */}
          <div className="flex items-center justify-between gap-3">
            <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveViewTab("table")}
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeViewTab === "table"
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
                className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeViewTab === "map"
                  ? "bg-[#19382B] text-white shadow-xs"
                  : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                  }`}
              >
                <MapTrifold size={16} weight="bold" />
                <span>Peta Sebaran Pohon Rawan</span>
              </button>
            </div>
          </div>

          {/* Row 2: Unified Controls & Filter Bar — 1 Single Horizontal Row (Icon Reload + Search + Filter Data) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1.5 border-t border-gray-100 text-xs scrollbar-none overflow-y-visible">
            {/* 1. Reload Button (Dua Mode: Text di Desktop, Icon di Mobile) */}
            <button
              type="button"
              onClick={fetchAllReportsAndProfiles}
              disabled={isLoadingReports}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0 border border-black/5 active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Tarik Semua Laporan Terbaru"
            >
              <ArrowCounterClockwise size={14} weight="bold" className={`text-[#88d937] ${isLoadingReports ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Perbarui Data</span>
            </button>

            {/* 2. Compact Search Input */}
            <div className="relative shrink-0 w-44 sm:w-56">
              <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari ID / pelapor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f8f9f5] border border-black/10 rounded-full pl-8.5 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
              />
            </div>

            {/* Separator Line */}
            <div className="h-5 w-[1px] bg-black/10 shrink-0 mx-0.5" />

            {/* 3. Filter Data Label */}
            <span className="font-bold text-[#111111]/60 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <Funnel size={14} weight="bold" className="text-[#19382B]" />
              Filter Data:
            </span>

            {/* 4. Status Filter Dropdown */}
            <div className="shrink-0 min-w-[210px] sm:min-w-[235px]">
              <CustomSelect
                label="Status Laporan"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                options={[
                  { value: "all", label: "Semua Status" },
                  { value: "pending", label: "Menunggu Verifikasi" },
                  { value: "in_progress", label: "Proses Pemangkasan" },
                  { value: "completed", label: "Laporan Selesai" },
                  { value: "closed", label: "Laporan Ditutup" },
                  { value: "rejected", label: "Laporan Ditolak" },
                ]}
                className="w-full"
              />
            </div>

            {/* 5. Risk Level Filter Dropdown */}
            <div className="shrink-0 min-w-[210px] sm:min-w-[235px]">
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
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Display Content: Table, Map, or Klaim UMKM */}
        {activeViewTab === "map" ? (
          <div className="p-4 sm:p-6">
            <AdminMapView
              reports={filteredReports}
              onSelectReport={(rep) => handleOpenDetailModal(rep as AdminReportItem)}
            />
          </div>
        ) : activeViewTab === "klaim-umkm" ? (
          <div className="p-4 sm:p-6 space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#19382B] text-[#88d937] border border-black/10 inline-block">
                  TATA KELOLA SIRKULAR BIOMASSA
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  Manajemen Klaim &amp; Serah Terima Kayu UMKM
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold bg-[#ecefe6] text-[#19382B] px-3.5 py-1.5 rounded-full border border-black/5">
                  {catalogs.filter((c) => c.status === "claimed" || !!c.claimed_by_name).length} Klaim Masuk
                </span>
              </div>
            </div>

            {/* Filter Bar Klaim UMKM */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari Kode Tiket / Nama UMKM..."
                  value={handoverSearchQuery}
                  onChange={(e) => setHandoverSearchQuery(e.target.value)}
                  className="w-full bg-[#f8f9f5] border border-black/10 rounded-full pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#19382B] text-[#111111]"
                />
              </div>

              <div className="shrink-0 min-w-[200px]">
                <CustomSelect
                  label="Status"
                  value={handoverStatusFilter}
                  onChange={(val) => setHandoverStatusFilter(val)}
                  options={[
                    { value: "all", label: "Semua Status Klaim" },
                    { value: "waiting", label: "⏳ Menunggu Penjemputan" },
                    { value: "completed", label: "✅ Sudah Diserahkan (Selesai)" },
                  ]}
                  className="w-full"
                />
              </div>
            </div>

            {/* Desktop Table View Serah Terima */}
            <div className="overflow-x-auto rounded-2xl border border-black/8 shadow-2xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#19382B] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 rounded-tl-2xl">Kode &amp; Usaha UMKM</th>
                    <th className="py-3.5 px-4">Spesifikasi Kayu</th>
                    <th className="py-3.5 px-4">Lokasi Tebangan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-tr-2xl">Aksi Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {(() => {
                    const filtered = catalogs.filter((item) => {
                      const matchQuery =
                        !handoverSearchQuery ||
                        (item.claim_ticket_code || "").toLowerCase().includes(handoverSearchQuery.toLowerCase()) ||
                        (item.claimed_by_name || "").toLowerCase().includes(handoverSearchQuery.toLowerCase()) ||
                        (item.wood_type || "").toLowerCase().includes(handoverSearchQuery.toLowerCase());

                      const matchStatus =
                        handoverStatusFilter === "all"
                          ? true
                          : handoverStatusFilter === "waiting"
                            ? item.handover_status !== "COMPLETED"
                            : item.handover_status === "COMPLETED";

                      return matchQuery && matchStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 font-semibold">
                            Tidak ada data klaim serah terima kayu yang sesuai filter.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((item) => {
                      const r = item.reports;
                      const isHandoverDone = item.handover_status === "COMPLETED";

                      const parsed = r ? parseCoordinates(r) : null;
                      const displayLat = parsed?.lat ?? (r ? (typeof r.latitude === "number" ? r.latitude : parseFloat(String(r.latitude))) : null);
                      const displayLng = parsed?.lng ?? (r ? (typeof r.longitude === "number" ? r.longitude : parseFloat(String(r.longitude))) : null);
                      const hasCoords = displayLat !== null && displayLng !== null && !isNaN(displayLat) && !isNaN(displayLng) && displayLat !== 0;

                      const mapsUrl = hasCoords
                        ? `https://www.google.com/maps/search/?api=1&query=${displayLat},${displayLng}`
                        : `https://www.google.com/maps`;

                      return (
                        <tr key={item.id} className="hover:bg-[#ecefe6]/30 transition-colors">
                          {/* Kode Tiket & Nama UMKM */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className="inline-block px-2.5 py-0.5 rounded-md font-mono text-[11px] font-extrabold bg-gray-100 text-[#111111] border border-black/10">
                                {item.claim_ticket_code}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#111111]">
                                <Storefront size={14} className="text-[#19382B]" />
                                <span>{item.claimed_by_name || "UMKM Terdaftar"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Spesifikasi Kayu */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-extrabold text-[#111111] text-xs">
                                {item.wood_type}
                              </p>
                              <p className="text-[10px] text-gray-500 font-medium">
                                Estimasi Volume: <span className="font-bold text-[#19382B]">{item.volume_kg} kg</span>
                              </p>
                            </div>
                          </td>

                          {/* Lokasi Tebangan */}
                          <td className="py-3.5 px-4">
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[#19382B] text-white hover:bg-[#234A39] px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs border border-black/5"
                            >
                              <NavigationArrow size={11} weight="bold" />
                              <span>Peta lokasi ({hasCoords ? `${displayLat?.toFixed(4)}, ${displayLng?.toFixed(4)}` : "Peta Penebangan"})</span>
                            </a>
                          </td>

                          {/* Status Serah Terima */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 border ${isHandoverDone
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-amber-100 text-amber-900 border-amber-300"
                                }`}
                            >
                              {isHandoverDone ? (
                                <>
                                  <CheckCircle size={12} weight="fill" className="text-emerald-600" />
                                  <span>SELESAI</span>
                                </>
                              ) : (
                                <>
                                  <Clock size={12} weight="fill" className="text-amber-600" />
                                  <span>MENUNGGU</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {!isHandoverDone ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedHandoverItem(item);
                                  setHandoverNoteInput("");
                                }}
                                className="bg-[#88d937] hover:bg-[#78c92a] text-[#111111] font-extrabold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer active:scale-95 border border-black/10"
                              >
                                <Handshake size={15} weight="bold" />
                                <span>Verifikasi &amp; Serahkan</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-gray-400 italic">
                                Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* ── MOBILE CARD LIST (Tampil Khusus Layar HP / Mobile < md) ── */}
            <div className="block md:hidden space-y-3 p-3.5 sm:p-4 font-sans">
              {paginatedReports.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs font-medium">
                  Tidak ada laporan aduan warga yang sesuai dengan kriteria filter.
                </div>
              ) : (
                paginatedReports.map((report) => {
                  const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
                  const riskLevel = getRiskLevel(rawRisk);
                  const riskConfig = riskLevelConfig[riskLevel];
                  const displayRisk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
                  const statusConfig = getReportStatusConfig(report.status);

                  const reporterDisplayName = resolveReporterName(report);

                  return (
                    <div
                      key={report.id}
                      className="bg-white border border-black/10 rounded-2xl p-3.5 space-y-3 shadow-2xs hover:border-[#19382B]/30 transition-all"
                    >
                      {/* Top Row: Photo + ID + Status Badge */}
                      <div className="flex items-start gap-3">
                        <img
                          src={report.image_url}
                          alt="Kondisi Pohon"
                          onClick={() => setPreviewZoomImage(report.image_url)}
                          className="w-16 h-16 rounded-xl object-cover border border-black/8 shadow-2xs shrink-0 cursor-pointer"
                          title="Klik untuk memperbesar foto"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-extrabold text-[#111111] text-xs">
                              #{report.id ? report.id.slice(0, 8) : "N/A"}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border whitespace-nowrap`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Risk Badge */}
                          <div className="pt-0.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${riskConfig.bgColor} ${riskConfig.textColor} border border-black/5 whitespace-nowrap`}>
                              <ShieldWarning size={11} weight="fill" className="shrink-0" />
                              <span>{riskConfig.label} ({displayRisk}/100)</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium pt-0.5">
                            <span className="flex items-center gap-1 truncate font-bold text-[#111111]">
                              <User size={11} className="text-[#19382B] shrink-0" />
                              <span className="truncate">{reporterDisplayName}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock size={11} />
                              {report.created_at
                                ? new Date(report.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button Row */}
                      <div className="pt-1 flex items-center gap-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleOpenDetailModal(report)}
                          className="flex-1 bg-[#19382B] hover:bg-[#234A39] text-white py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
                        >
                          <Eye size={14} weight="bold" className="text-[#88d937]" />
                          <span>Cek Detail</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmReport(report)}
                          className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors border border-red-100 shrink-0 cursor-pointer"
                          title="Hapus Laporan Ini"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── DESKTOP TABLE VIEW (Padded & Redesign Sesuai Tabel Tiket UMKM) ── */}
            <div className="hidden md:block p-4 sm:p-6">
              <div className="overflow-x-auto rounded-2xl border border-black/8 shadow-2xs bg-white">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-[#19382B] text-white text-[11px] font-bold tracking-wider text-center">
                      <th className="py-3.5 px-5 rounded-tl-2xl">INFO LAPORAN</th>
                      <th className="py-3.5 px-5">PELAPOR</th>
                      <th className="py-3.5 px-5">TINGKAT RISIKO</th>
                      <th className="py-3.5 px-5">STATUS</th>
                      <th className="py-3.5 px-5 rounded-tr-2xl">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {paginatedReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-gray-400 font-medium">
                          Tidak ada laporan aduan warga yang sesuai dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedReports.map((report) => {
                        const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
                        const riskLevel = getRiskLevel(rawRisk);
                        const riskConfig = riskLevelConfig[riskLevel];
                        const statusCfg = getReportStatusConfig(report.status);
                        const displayRisk =
                          rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                        const reporterDisplayName = resolveReporterName(report);
                        const reporterSubtitle =
                          report.reporter_email && report.reporter_email.includes("@")
                            ? report.reporter_email
                            : "Warga Terdaftar";

                        return (
                          <tr key={report.id} className="hover:bg-[#ecefe6]/30 transition-colors">
                            {/* 1. Foto & ID Laporan */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={report.image_url}
                                  alt="Kondisi Pohon"
                                  onClick={() => setPreviewZoomImage(report.image_url)}
                                  className="w-12 h-12 rounded-2xl object-cover border border-black/8 shadow-2xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                  title="Klik untuk memperbesar foto"
                                />
                                <div className="min-w-0">
                                  <p className="font-mono font-bold text-[#111111] text-[11px] tracking-tight">
                                    #{report.id ? report.id.slice(0, 8) : "N/A"}
                                  </p>
                                  {report.description && (
                                    <p className="text-[10px] text-[#111111]/60 line-clamp-1 max-w-[160px] mt-0.5">
                                      {report.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* 2. Nama Pelapor Warga */}
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8.5 h-8.5 rounded-full bg-[#19382B] text-[#88d937] flex items-center justify-center text-xs font-extrabold uppercase shrink-0 border border-[#88d937]/30 shadow-2xs">
                                  {reporterDisplayName[0].toUpperCase()}
                                </div>
                                <div className="overflow-hidden max-w-[170px]">
                                  <p className="font-extrabold text-[#111111] truncate text-xs leading-tight">
                                    {reporterDisplayName}
                                  </p>
                                  <p className="text-[10px] text-[#111111]/50 truncate mt-0.5">
                                    {reporterSubtitle}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* 3. Risiko AI */}
                            <td className="py-4 px-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${riskConfig.bgColor} ${riskConfig.textColor} border border-black/5 whitespace-nowrap`}
                              >
                                <ShieldWarning size={13} weight="fill" className="shrink-0" />
                                <span>{riskConfig.label} ({displayRisk}/100)</span>
                              </span>
                            </td>

                            {/* 4. Status & Waktu */}
                            <td className="py-4 px-5">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} mb-0.5 border whitespace-nowrap`}>
                                {statusCfg.label}
                              </span>
                              <p className="text-[10px] text-[#111111]/40 whitespace-nowrap">
                                {report.created_at
                                  ? new Date(report.created_at).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                  : "-"}
                              </p>
                            </td>

                            {/* 5. Action Buttons */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetailModal(report)}
                                  className="bg-[#19382B] text-white hover:bg-[#234A39] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
                                >
                                  <Eye size={14} weight="bold" className="text-[#88d937]" />
                                  <span>Cek Detail</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmReport(report)}
                                  className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors border border-red-100 shrink-0 cursor-pointer"
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

            {/* ── 4. Modern Pagination Controls (15 Data Per Halaman) ── */}
            {totalItems > 0 && (
              <div className="p-4 sm:p-5 bg-[#f8f9f5]/60 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
                {/* Page Items Range Display */}
                <p className="text-[#111111]/60 font-semibold text-center sm:text-left">
                  Menampilkan <span className="font-extrabold text-[#19382B]">{totalItems > 0 ? startIndex + 1 : 0}</span> -{" "}
                  <span className="font-extrabold text-[#19382B]">{endIndex}</span> dari{" "}
                  <span className="font-extrabold text-[#19382B]">{totalItems}</span> aduan
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={validCurrentPage === 1}
                    className="px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-[#ecefe6] text-[#111111] text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <CaretLeft size={14} weight="bold" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        totalPages <= 5 ||
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - validCurrentPage) <= 1
                      ) {
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${pageNum === validCurrentPage
                              ? "bg-[#19382B] text-[#88d937] shadow-2xs border border-[#19382B]"
                              : "bg-white hover:bg-gray-100 text-[#111111]/70 border border-black/8"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        (pageNum === 2 && validCurrentPage > 3) ||
                        (pageNum === totalPages - 1 && validCurrentPage < totalPages - 2)
                      ) {
                        return (
                          <span key={pageNum} className="text-gray-400 font-bold px-1 select-none">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={validCurrentPage === totalPages}
                    className="px-3 py-1.5 rounded-full border border-black/10 bg-white hover:bg-[#ecefe6] text-[#111111] text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )}
          </>
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
                    {(() => {
                      const st = getReportStatusConfig(selectedReport.status);
                      return (
                        <span className={`text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full border shadow-2xs shrink-0 ${st.bg} ${st.text} ${st.border}`}>
                          {st.label}
                        </span>
                      );
                    })()}
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
                        {selectedReport.reporter_name ? selectedReport.reporter_name[0].toUpperCase() : "M"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-[#111111] leading-tight">
                          {selectedReport.reporter_name || "Pelapor Terdaftar"}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                          {selectedReport.reporter_email && selectedReport.reporter_email.includes("@") ? selectedReport.reporter_email : "Warga Terdaftar • Pelapor Aduan"}
                        </p>
                      </div>
                    </div>

                    {/* Waktu Lapor Badge (Tukar Posisi ke Kanan Header Pelapor) */}
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-700 flex items-center gap-1 bg-white border border-black/10 px-3 py-1.5 rounded-full shadow-2xs shrink-0 self-start sm:self-auto">
                      <Clock size={14} weight="bold" className="text-[#19382B]" />
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

                  {/* 2. Key Metrics Grid (AI Risk, Canopy Volume, Biomass) */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 sm:p-5">
                    {(() => {
                      const rawRisk = typeof selectedReport.risk_score === "number" ? selectedReport.risk_score : 0;
                      const riskLevel = getRiskLevel(rawRisk);
                      const riskConfig = riskLevelConfig[riskLevel];
                      const displayRisk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                      return (
                        <div className="bg-[#f8f9f5] border border-black/5 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">TINGKAT RISIKO</span>
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
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">PERKIRAAN VOLUME</span>
                      <p className="text-sm sm:text-base font-extrabold text-[#19382B]">
                        {selectedReport.canopy_volume || 0} <span className="text-[10px] font-normal text-gray-500">m³</span>
                      </p>
                      <span className="text-[9px] text-gray-400 font-semibold truncate">Estimasi Kanopi</span>
                    </div>

                    <div className="bg-[#f8f9f5] border border-black/5 p-2.5 sm:p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">POTENSI KAYU</span>
                      <p className="text-sm sm:text-base font-extrabold text-[#19382B]">
                        {selectedReport.biomass_estimate || 0} <span className="text-[10px] font-normal text-gray-500">kg</span>
                      </p>
                      <span className="text-[9px] text-gray-400 font-semibold truncate">Potensi Kayu</span>
                    </div>
                  </div>

                  {/* 3. Informasi Umum Aduan — KOORDINAT GPS & TITIK ALAMAT 2 GRID 1 BARIS */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">Informasi Laporan</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                      {(() => {
                        const coords = parseCoordinates(selectedReport);
                        return (
                          <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1 flex flex-col justify-center">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Titik Koordinat</p>
                            <p className="font-bold text-[#111111] text-xs font-mono">
                              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "N/A"}
                            </p>
                          </div>
                        );
                      })()}

                      <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1 flex flex-col justify-center">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Lokasi Pohon</p>
                        <p className="text-xs font-semibold text-[#111111] leading-relaxed break-words">
                          {formatLocationDisplay(selectedReport.location)}
                        </p>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Catatan Pelapor</p>
                        <p className="text-xs font-semibold text-[#111111] leading-relaxed break-words">
                          {selectedReport.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4. Lampiran Visual & Peta — UKURAN FOTO DAN PETA SAMA PERSIS */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <h4 className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">Foto dan Lokasi </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
                      {/* Visual Deteksi AI */}
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          <span>Klik untuk perbesar foto</span>
                        </div>

                        <div>
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Peta Lokasi</span>
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
                          Catatan / Instruksi Petugas:
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
                      Perbarui Status
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
                          label="Pilih Status Baru"
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
                          newStatus.toLowerCase().includes("penjadwalan")) && (
                            <div className="space-y-1.5 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                              <label className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                                <Calendar size={16} weight="bold" className="text-amber-700" />
                                Tanggal &amp; Jam Eksekusi Lapangan <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="datetime-local"
                                value={scheduledDateTime}
                                onChange={(e) => {
                                  setScheduledDateTime(e.target.value);
                                  setValidationError(null);
                                }}
                                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#19382B]"
                              />
                              <p className="text-[10px] text-amber-800 font-medium">
                                💡 Tanggal &amp; jam ini akan dikirimkan sebagai kabar status ke pelapor warga.
                              </p>
                            </div>
                          )}

                        {(newStatus.toLowerCase().includes("selesai") ||
                          newStatus.toLowerCase().includes("completed") ||
                          newStatus.toLowerCase().includes("sirkular")) && (
                            <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
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

                              {/* Form Tambahan Spesifikasi Biomassa Kayu Tebangan (Khusus Katalog UMKM) */}
                              <div className="bg-white border border-emerald-300 rounded-2xl p-3.5 space-y-2.5 shadow-2xs mt-3 font-sans">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#19382B] flex items-center gap-1.5">
                                  🌳 Data Kayu Tebangan (Untuk UMKM)
                                </span>
                                <div className="grid grid-cols-2 gap-2.5 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#111111]/70 mb-1">
                                      Jenis Pohon / Kayu *
                                    </label>
                                    <input
                                      type="text"
                                      value={woodTypeInput}
                                      onChange={(e) => setWoodTypeInput(e.target.value)}
                                      placeholder="Pohon Kayu Olahan Jati"
                                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3 py-2 font-bold text-[#111111] focus:outline-none focus:border-[#19382B]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#111111]/70 mb-1">
                                      Estimasi Berat Kayu (kg) *
                                    </label>
                                    <input
                                      type="number"
                                      value={woodWeightInput}
                                      onChange={(e) => setWoodWeightInput(e.target.value)}
                                      placeholder="150"
                                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3 py-2 font-bold text-[#111111] focus:outline-none focus:border-[#19382B]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#111111]/70 mb-1">
                                      Tinggi / Panjang Kayu (m) *
                                    </label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={woodLengthInput}
                                      onChange={(e) => setWoodLengthInput(e.target.value)}
                                      placeholder="4.5"
                                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3 py-2 font-semibold text-[#111111] focus:outline-none focus:border-[#19382B]"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-extrabold text-[#111111]/70 mb-1">
                                      Lebar / Diameter Kayu (cm) *
                                    </label>
                                    <input
                                      type="number"
                                      value={woodDiameterInput}
                                      onChange={(e) => setWoodDiameterInput(e.target.value)}
                                      placeholder="50"
                                      className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3 py-2 font-semibold text-[#111111] focus:outline-none focus:border-[#19382B]"
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-emerald-800 font-bold leading-tight">
                                  💡 Data ini akan ditampilkan di katalog UMKM untuk proses daur ulang.
                                </p>
                              </div>
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
                            Catatan / Instruksi Petugas
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
                    Kembali
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
                          <span>Selesaikan Kasus</span>
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
                            <span>Simpan Perubahan</span>
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

        {/* Modal Verifikasi & Konfirmasi Serah Terima Kayu UMKM */}
        <AnimatePresence>
          {selectedHandoverItem && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 font-sans pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white border border-black/10 shadow-2xl rounded-3xl p-6 w-full max-w-lg space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#88d937] text-[#111111] flex items-center justify-center font-bold shadow-2xs">
                      <Handshake size={20} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#111111]">
                        Konfirmasi Serah Terima Kayu
                      </h4>
                      <span className="text-[10px] text-[#19382B] font-bold">
                        Dinas Lingkungan Hidup Kota Semarang
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

                <div className="bg-[#19382B] text-white p-4 rounded-2xl space-y-2 font-mono text-center">
                  <span className="text-[9px] font-bold text-[#88d937] uppercase tracking-wider block">
                    KODE TIKET KLAIM
                  </span>
                  <span className="text-xl font-black text-white tracking-wider block">
                    {selectedHandoverItem.claim_ticket_code || `KLM-2026-TRM-${selectedHandoverItem.id.slice(0, 4).toUpperCase()}`}
                  </span>
                </div>

                <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[#111111]/50 block">Nama Usaha UMKM:</span>
                      <strong className="text-[#19382B] font-black text-xs flex items-center gap-1">
                        <span>🏢</span>
                        <span>{selectedHandoverItem.claimed_by_business_name || "Kerajinan Kayu Mutiara Jati"}</span>
                      </strong>
                      <span className="text-[11px] font-bold text-[#111111] block pt-0.5">
                        Penanggung Jawab: {selectedHandoverItem.claimed_by_name || "Pengguna UMKM"}
                      </span>
                      <span className="text-[10px] text-[#111111]/60 font-medium block">
                        Jenis: {selectedHandoverItem.claimed_by_business_type || "Kerajinan Kayu"} • WA: {selectedHandoverItem.claimed_by_phone || "0812-3456-7890"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#111111]/50 block">Jenis &amp; Berat Kayu:</span>
                      <strong className="text-[#111111] font-bold text-xs">{selectedHandoverItem.wood_type} ({selectedHandoverItem.volume_kg} kg)</strong>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-black/5">
                    <span className="text-[10px] font-bold text-[#111111]/50 block">Lokasi Penebangan Pohon:</span>
                    <p className="text-[11px] font-semibold text-[#111111] line-clamp-2 leading-relaxed">
                      {selectedHandoverItem.reports?.admin_note || selectedHandoverItem.reports?.description || "Lokasi Pohon Ditebang Pemkot Semarang"}
                    </p>
                  </div>
                </div>

                {/* Input Catatan Penyerahan */}
                <div className="space-y-1.5 text-xs">
                  <label className="font-extrabold text-[#111111] block">
                    Catatan Petugas Lapangan (Opsional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kayu diserahkan di lokasi ke Bpk. Agus dengan Plat Mobil H 8921 AB..."
                    value={handoverNoteInput}
                    onChange={(e) => setHandoverNoteInput(e.target.value)}
                    className="w-full bg-[#f8f9f5] border border-black/10 rounded-2xl p-3 text-xs focus:outline-none focus:border-[#19382B] text-[#111111]"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHandoverItem(null)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmHandover}
                    disabled={isSubmittingHandover}
                    className="flex-1 py-2.5 rounded-full text-xs font-extrabold bg-[#88d937] hover:bg-[#78c92a] text-[#111111] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 border border-black/10 uppercase tracking-wider"
                  >
                    {isSubmittingHandover ? (
                      <CircleNotch size={16} className="animate-spin text-[#111111]" />
                    ) : (
                      <>
                        <Check size={16} weight="bold" />
                        <span>Konfirmasi Diserahkan</span>
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
