"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SemarangRiskMap, ReportItem } from "./SemarangRiskMap";
import { UmkmReportModal } from "./UmkmReportModal";
import { UmkmProfileModal } from "./UmkmProfileModal";
import { ReportDetailModal } from "./ReportDetailModal";
import { WoodCatalogCard, BiomassCatalogItem } from "./WoodCatalogCard";
import { LocationMapModal } from "../dashboard/LocationMapModal";
import {
  Storefront,
  Funnel,
  CalendarCheck,
  ShieldWarning,
  NavigationArrow,
  Package,
  MapTrifold,
  HandPalm,
  CheckCircle,
  Clock,
  X,
  CircleNotch,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { parseCoordinates } from "../admin/AdminDashboardClient";

interface UmkmDashboardClientProps {
  initialDisplayName: string;
  initialReports: ReportItem[];
}

export const UmkmDashboardClient = ({
  initialDisplayName,
  initialReports,
}: UmkmDashboardClientProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [displayName] = useState<string>(initialDisplayName);
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [catalogs, setCatalogs] = useState<BiomassCatalogItem[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedReportDetail, setSelectedReportDetail] = useState<ReportItem | null>(null);

  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Floating Toast Notification State
  const [toast, setToast] = useState<{
    id: string;
    title: string;
    message: string;
    type?: "success" | "info" | "warning";
  } | null>(null);

  const showToast = (
    message: string,
    title = "Klaim berhasil",
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

  // User location for radius filter & reverse geocoded address
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddressName, setUserAddressName] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Active View Tab: 'katalog' | 'klaim' | 'peta' | 'penindakan'
  const [activeTab, setActiveTab] = useState<"katalog" | "peta" | "penindakan">("katalog");

  // Data Profil Usaha UMKM (Nama Usaha, Jenis Usaha, Telepon)
  const [businessName, setBusinessName] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [confirmClaimItem, setConfirmClaimItem] = useState<BiomassCatalogItem | null>(null);

  useEffect(() => {
    // Load from localStorage or Supabase
    const savedName = localStorage.getItem("umkm_business_name");
    const savedType = localStorage.getItem("umkm_business_type");
    const savedPhone = localStorage.getItem("umkm_phone");
    const savedLat = localStorage.getItem("umkm_lat");
    const savedLng = localStorage.getItem("umkm_lng");
    const savedAddress = localStorage.getItem("umkm_address");

    if (savedName) setBusinessName(savedName);
    if (savedType) setBusinessType(savedType);
    if (savedPhone) setPhone(savedPhone);
    if (savedLat && savedLng) {
      const lat = Number(savedLat);
      const lng = Number(savedLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setUserLocation({ lat, lng });
        setUserAddressName(savedAddress || "Lokasi usaha tersimpan");
      }
    }

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          if (profile.business_name) {
            setBusinessName(profile.business_name);
            localStorage.setItem("umkm_business_name", profile.business_name);
          }
          if (profile.business_type) {
            setBusinessType(profile.business_type);
            localStorage.setItem("umkm_business_type", profile.business_type);
          }
          if (profile.phone_number) {
            setPhone(profile.phone_number);
            localStorage.setItem("umkm_phone", profile.phone_number);
          }
        }
      } catch (e) {
        console.log("Error loading profile", e);
      }
    };
    loadProfile();

    const syncProfileFromStorage = () => {
      const savedName = localStorage.getItem("umkm_business_name");
      const savedType = localStorage.getItem("umkm_business_type");
      const savedPhone = localStorage.getItem("umkm_phone");
      if (savedName) setBusinessName(savedName);
      if (savedType) setBusinessType(savedType);
      if (savedPhone) setPhone(savedPhone);
    };

    window.addEventListener("profile-updated", syncProfileFromStorage);
    return () => {
      window.removeEventListener("profile-updated", syncProfileFromStorage);
    };
  }, []);

  const saveUserLocation = (lat: number, lng: number, addressStr: string) => {
    setUserLocation({ lat, lng });
    setUserAddressName(addressStr);
    try {
      localStorage.setItem("umkm_lat", String(lat));
      localStorage.setItem("umkm_lng", String(lng));
      localStorage.setItem("umkm_address", addressStr);
    } catch (e) { }
  };

  const isWithinIndonesia = (lat: number, lng: number): boolean => {
    return (
      typeof lat === "number" &&
      typeof lng === "number" &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -11.0 &&
      lat <= 6.0 &&
      lng >= 95.0 &&
      lng <= 141.0
    );
  };

  const detectUserLocation = async () => {
    setIsDetectingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude;
          let lng = position.coords.longitude;

          // Sanitize coordinates if browser/IP proxy returned location outside Indonesia
          if (!isWithinIndonesia(lat, lng)) {
            console.warn("[WARN] Detected location outside Indonesia, using Tangerang fallback.");
            lat = -6.1783;
            lng = 106.6319;
            saveUserLocation(lat, lng, "Tangerang, Banten, Indonesia");
            setIsDetectingLocation(false);
            showToast("Lokasi diset ke Tangerang, Banten.", "GPS Usaha", "info");
            return;
          }

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const name = addr.suburb || addr.village || addr.neighbourhood || addr.city_district || addr.city || addr.town || "Lokasi Anda";
              const regency = addr.county || addr.regency || addr.state || "Indonesia";
              const fullAddr = `${name}, ${regency}`;
              saveUserLocation(lat, lng, fullAddr);
            } else {
              saveUserLocation(lat, lng, `Koordinat (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
            }
          } catch {
            saveUserLocation(lat, lng, `Koordinat (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
          } finally {
            setIsDetectingLocation(false);
            showToast("Lokasi GPS usaha terdeteksi secara akurat.", "GPS Usaha", "success");
          }
        },
        (err) => {
          console.log("GPS geolocation error", err);
          fallbackIpGeolocate();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fallbackIpGeolocate();
    }
  };

  const fallbackIpGeolocate = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude && isWithinIndonesia(data.latitude, data.longitude)) {
          const lat = data.latitude;
          const lng = data.longitude;
          const ipAddr = `${data.city || "Kota"}, ${data.region || ""}, Indonesia`;
          saveUserLocation(lat, lng, ipAddr);
          setIsDetectingLocation(false);
          showToast(`Lokasi usaha terdeteksi: ${ipAddr}`, "GPS Usaha", "success");
          return;
        }
      }
    } catch {
      console.log("IP API failed");
    }

    // Default Tangerang fallback if IP service fails or returns abroad location
    saveUserLocation(-6.1783, 106.6319, "Tangerang, Banten, Indonesia");
    setIsDetectingLocation(false);
    showToast("Lokasi diset ke Tangerang, Banten.", "GPS Usaha", "info");
  };

  const fetchReportsAndCatalogs = async () => {
    // 1. Fetch reports
    const { data: repData } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    const reportsList: ReportItem[] = (repData as ReportItem[]) || [];
    if (repData) {
      setReports(reportsList);
    }

    // 2. Fetch biomass_catalogs with joined report data & profile claims
    let catData: any[] = [];
    try {
      const { data, error } = await supabase
        .from("biomass_catalogs")
        .select(`
          *,
          reports (*),
          profiles:claimed_by (full_name)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        catData = data;
      }
    } catch (err) {
      console.log("Error loading biomass_catalogs", err);
    }

    // Combine completed/resolved reports with biomass_catalogs entries
    const completedReports = reportsList.filter(
      (r) => r.status === "completed" || r.status === "resolved" || !!r.proof_image_url || !!r.claimed_by_name
    );

    const catByReportId = new Map<string, any>();
    catData.forEach((c) => {
      if (c.report_id) catByReportId.set(c.report_id, c);
      if (c.id) catByReportId.set(c.id, c);
    });

    const combinedCatalogs: BiomassCatalogItem[] = [];
    const processedCatIds = new Set<string>();

    completedReports.forEach((r) => {
      const catRow = catByReportId.get(r.id);
      if (catRow) {
        processedCatIds.add(catRow.id);
        combinedCatalogs.push({
          id: catRow.id,
          report_id: catRow.report_id || r.id,
          wood_type: catRow.wood_type || r.tree_type || "Pohon kayu olahan dinas",
          volume_kg: catRow.volume_kg || (r.biomass_estimate ? Number(r.biomass_estimate) : 100.0),
          status: catRow.status || (r.claimed_by_name ? "claimed" : "available"),
          claimed_by: catRow.claimed_by,
          claimed_by_name: catRow.claimed_by_name || catRow.profiles?.full_name || r.claimed_by_name || (catRow.claimed_by ? "UMKM terdaftar" : null),
          claimed_by_business_name: catRow.claimed_by_business_name,
          claimed_by_business_type: catRow.claimed_by_business_type,
          claimed_by_phone: catRow.claimed_by_phone,
          created_at: catRow.created_at || r.created_at,
          updated_at: catRow.updated_at || r.created_at,
          reports: catRow.reports || r,
          claim_ticket_code: catRow.claim_ticket_code || `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`,
          handover_status: catRow.handover_status || (catRow.status === "claimed" || r.claimed_by_name ? "WAITING_PICKUP" : "AVAILABLE"),
        });
      } else {
        combinedCatalogs.push({
          id: r.id,
          report_id: r.id,
          wood_type: r.tree_type || "Pohon kayu olahan dinas",
          volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : (r.canopy_volume ? Number(r.canopy_volume) * 10 : 120.0),
          status: r.claimed_by_name ? "claimed" : "available",
          claimed_by_name: r.claimed_by_name || null,
          created_at: r.created_at,
          updated_at: r.created_at,
          reports: r,
          claim_ticket_code: `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`,
          handover_status: r.claimed_by_name ? "WAITING_PICKUP" : "AVAILABLE",
        });
      }
    });

    // Add any catData entries that weren't matched to completedReports
    catData.forEach((c) => {
      if (!processedCatIds.has(c.id)) {
        combinedCatalogs.push({
          id: c.id,
          report_id: c.report_id,
          wood_type: c.wood_type || "Pohon kayu olahan dinas",
          volume_kg: c.volume_kg || 100.0,
          status: c.status || "available",
          claimed_by: c.claimed_by,
          claimed_by_name: c.claimed_by_name || c.profiles?.full_name || (c.claimed_by ? "UMKM terdaftar" : null),
          claimed_by_business_name: c.claimed_by_business_name,
          claimed_by_business_type: c.claimed_by_business_type,
          claimed_by_phone: c.claimed_by_phone,
          created_at: c.created_at,
          updated_at: c.updated_at,
          reports: c.reports,
          claim_ticket_code: c.claim_ticket_code || `KLM-2026-TRM-${c.id.slice(0, 4).toUpperCase()}`,
          handover_status: c.handover_status || (c.status === "claimed" ? "WAITING_PICKUP" : "AVAILABLE"),
        });
      }
    });

    setCatalogs(combinedCatalogs);
  };

  const deriveCatalogFromReports = (allRep: ReportItem[]) => {
    const completedRep = allRep.filter(
      (r) => r.status === "completed" || r.status === "resolved" || !!r.proof_image_url || !!r.claimed_by_name
    );

    const derived: BiomassCatalogItem[] = completedRep.map((r) => ({
      id: r.id,
      report_id: r.id,
      wood_type: r.tree_type || "Pohon kayu olahan dinas",
      volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : (r.canopy_volume ? Number(r.canopy_volume) * 10 : 120.0),
      status: r.claimed_by_name ? "claimed" : "available",
      claimed_by_name: r.claimed_by_name || null,
      created_at: r.created_at,
      updated_at: r.created_at,
      reports: r,
      claim_ticket_code: `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`,
      handover_status: r.claimed_by_name ? "WAITING_PICKUP" : "AVAILABLE",
    }));

    setCatalogs(derived);
  };

  useEffect(() => {
    detectUserLocation();
    fetchReportsAndCatalogs();
  }, []);

  // Trigger Pop-up Modal Konfirmasi Klaim
  const handleClaimWoodItem = (catalogItem: BiomassCatalogItem) => {
    if (catalogItem.status === "claimed" || catalogItem.claimed_by_name) return;
    setConfirmClaimItem(catalogItem);
  };

  // Execute actual database write upon user confirmation
  const executeClaimWoodItem = async () => {
    if (!confirmClaimItem) return;
    const catalogItem = confirmClaimItem;

    setClaimingId(catalogItem.id);
    const newTicketCode = `KLM-2026-TRM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const claimPayload = {
        claimed_by: user?.id || null,
        claimed_by_name: displayName || user?.email || "UMKM terdaftar",
        claimed_by_business_name: businessName || "Kerajinan Kayu Mutiara Jati",
        claimed_by_business_type: businessType || "Kerajinan kayu",
        claimed_by_phone: phone || "0812-3456-7890",
        claim_ticket_code: newTicketCode,
        handover_status: "WAITING_PICKUP",
        status: "claimed",
        updated_at: new Date().toISOString(),
      };

      // 1. Try to update existing biomass_catalogs row by id OR report_id
      const targetReportId = catalogItem.report_id || catalogItem.id;
      const { data: updatedData } = await supabase
        .from("biomass_catalogs")
        .update(claimPayload)
        .or(`id.eq.${catalogItem.id},report_id.eq.${targetReportId}`)
        .select();

      // 2. If no existing row was updated, insert a new row into biomass_catalogs
      if (!updatedData || updatedData.length === 0) {
        await supabase
          .from("biomass_catalogs")
          .insert({
            report_id: targetReportId,
            wood_type: catalogItem.wood_type || catalogItem.reports?.tree_type || "Pohon kayu olahan dinas",
            volume_kg: catalogItem.volume_kg || 100.0,
            created_at: new Date().toISOString(),
            ...claimPayload,
          });
      }

      // 3. Update reports table if report_id exists
      if (targetReportId) {
        await supabase
          .from("reports")
          .update({
            claimed_by_name: displayName || user?.email || "UMKM terdaftar",
          })
          .eq("id", targetReportId);
      }

      showToast(
        `Tiket ${newTicketCode} terbit! Kayu "${catalogItem.wood_type}" berhasil diklaim atas nama ${displayName}.`,
        "Klaim kayu berhasil!",
        "success"
      );

      setCatalogs((prev) =>
        prev.map((c) =>
          c.id === catalogItem.id || c.report_id === targetReportId
            ? {
              ...c,
              status: "claimed",
              claimed_by_name: displayName,
              claimed_by_business_name: businessName,
              claim_ticket_code: newTicketCode,
              handover_status: "WAITING_PICKUP",
            }
            : c
        )
      );

      setReports((prev) =>
        prev.map((r) =>
          r.id === targetReportId ? { ...r, claimed_by_name: displayName } : r
        )
      );

      setConfirmClaimItem(null);
      router.push("/klaim");
    } catch (e) {
      console.log("Claim error", e);
      setConfirmClaimItem(null);
    } finally {
      setClaimingId(null);
    }
  };

  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getItemCoordinates = (item: BiomassCatalogItem): { lat: number; lng: number } | null => {
    if (typeof item.pickup_latitude === "number" && typeof item.pickup_longitude === "number") {
      return { lat: item.pickup_latitude, lng: item.pickup_longitude };
    }
    const rep = item.reports;
    if (!rep) return null;
    if (typeof rep.latitude === "number" && typeof rep.longitude === "number") {
      return { lat: rep.latitude, lng: rep.longitude };
    }
    return parseCoordinates(rep);
  };

  // Process catalogs with distance calculation, radius filter & ascending distance sort (closest first)
  const processedCatalogs = catalogs
    .map((item) => {
      let distanceKm: number | null = null;
      if (userLocation) {
        const itemCoords = getItemCoordinates(item);
        if (itemCoords) {
          distanceKm = calculateDistanceKm(
            userLocation.lat,
            userLocation.lng,
            itemCoords.lat,
            itemCoords.lng
          );
        }
      }
      return { ...item, distanceKm };
    })
    .filter((item) => {
      if (radiusKm === null || item.distanceKm === null) return true;
      return item.distanceKm <= radiusKm;
    })
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return 0;
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  // Compute metrics
  const mappedReports = reports.map((r) => {
    const coords = parseCoordinates(r);
    return coords ? { ...r, latitude: coords.lat, longitude: coords.lng } : r;
  });

  const criticalReports = mappedReports.filter(
    (r) => r.status === "pending" || r.status === "verified" || r.risk_score >= 60
  );
  const scheduledReports = mappedReports.filter(
    (r) => r.status === "scheduled" || r.status === "in_progress" || !!r.scheduled_at
  );
  const claimedCatalogsCount = catalogs.filter((c) => c.status === "claimed" || !!c.claimed_by_name).length;

  return (
    <div
      className="w-full space-y-6 sm:space-y-8 font-sans pb-16"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Top Header & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8"
      >
        <div className="space-y-1.5 min-w-0 max-w-md">
          {displayName && (
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 bg-[#ecefe6] text-[#19382B] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-black/5">
                <Storefront size={13} weight="fill" />
                <span>{displayName}</span>
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
            Dashboard UMKM {businessName ? <span className="font-serif italic font-medium text-[#19382B]">{businessName}</span> : null}
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Dapatkan pasokan kayu tebangan gratis untuk bahan baku usaha Anda.
          </p>
        </div>

        {/* Standardized Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 lg:ml-auto">
          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Katalog kayu
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {catalogs.length}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Kayu terklaim
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {claimedCatalogsCount}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Unified Card Layout */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        {/* Controls Section */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-black/5 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ecefe6] text-[#19382B] px-4 py-2 rounded-full text-xs font-bold border border-black/5">
              <Package size={16} weight="bold" />
              <span>Daftar Kayu Tersedia ({catalogs.length})</span>
            </div>

          </div>

          {/* Filter Radius Usaha & GPS Bar (Scrollable on Mobile) */}
          <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto custom-horizontal-scrollbar pb-2 pt-0.5 max-w-full shrink-0">
              <span className="font-bold text-[#111111]/60 flex items-center gap-1.5 shrink-0">
                <Funnel size={14} weight="bold" className="text-[#19382B]" />
                Filter:
              </span>

              <select
                value={radiusKm === null ? "all" : String(radiusKm)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRadiusKm(val === "all" ? null : Number(val));
                }}
                className="bg-[#f8f9f5] border border-black/10 text-xs font-bold text-[#111111] rounded-full px-3.5 py-1.5 focus:outline-none focus:border-[#19382B] cursor-pointer shrink-0"
              >
                <option value="all">Semua wilayah</option>
                <option value="0.5">Radius 500 meter</option>
                <option value="1">Radius 1 kilometer</option>
                <option value="2">Radius 2 kilometer</option>
                <option value="5">Radius 5 kilometer</option>
                <option value="10">Radius 10 kilometer</option>
                <option value="25">Radius 25 kilometer</option>
                <option value="50">Radius 50 kilometer</option>
              </select>

              <button
                type="button"
                onClick={detectUserLocation}
                disabled={isDetectingLocation}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full transition-all shadow-sm shrink-0 cursor-pointer border border-black/5"
              >
                <NavigationArrow weight="bold" className={`w-3.5 h-3.5 text-white ${isDetectingLocation ? "animate-spin" : ""}`} />
                <span>{isDetectingLocation ? "Mendeteksi..." : "Deteksi GPS"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMapPickerOpen(true)}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#ecefe6] text-[#19382B] hover:bg-[#dce8d0] px-3.5 py-1.5 rounded-full transition-all shadow-2xs shrink-0 cursor-pointer border border-black/5"
              >
                <MapTrifold weight="bold" className="w-3.5 h-3.5 text-[#19382B]" />
                <span>PILIH DI PETA</span>
              </button>

              {radiusKm !== null && (
                <button
                  type="button"
                  onClick={() => setRadiusKm(null)}
                  className="flex items-center justify-center gap-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer border border-red-200"
                >
                  <X weight="bold" className="w-3.5 h-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}

              <button
                type="button"
                onClick={fetchReportsAndCatalogs}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full transition-all shadow-2xs shrink-0 cursor-pointer border border-black/5 active:scale-95"
                title="Perbarui Data Katalog"
              >
                <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5 text-[#88d937]" />
                <span>Perbarui Data</span>
              </button>
            </div>

            <div className="text-[11px] font-medium text-[#111111]/70 leading-normal pt-0.5">
              {userAddressName ? (
                <span className="text-[#19382B] font-bold">Lokasi usaha: {userAddressName}</span>
              ) : (
                <span className="text-gray-600">Klik "Deteksi GPS" untuk memperbarui lokasi</span>
              )}
            </div>
          </div>
        </div>

        {/* Display Content: Katalog Kayu Only */}
        <div className="p-4 sm:p-6">
          <div className="space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  Katalog Kayu Tersedia
                </h3>
                <p className="text-xs text-[#111111]/60 font-medium">
                  Pilih dan klaim kayu tebangan yang Anda butuhkan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {processedCatalogs.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-black/8 p-12 text-center text-xs font-medium text-[#111111]/50 space-y-2">
                  <Package size={36} className="mx-auto text-gray-300" />
                  <p>Tidak ada sampel kayu di dalam radius {radiusKm ? (radiusKm < 1 ? `${radiusKm * 1000}m` : `${radiusKm}km`) : "tertentu"}.</p>
                  <button
                    type="button"
                    onClick={() => setRadiusKm(null)}
                    className="text-xs font-bold text-[#19382B] underline pt-1 inline-block cursor-pointer"
                  >
                    Tampilkan semua wilayah
                  </button>
                </div>
              ) : (
                processedCatalogs.map((item) => (
                  <WoodCatalogCard
                    key={item.id}
                    item={item}
                    distanceKm={item.distanceKm}
                    onClaim={handleClaimWoodItem}
                    onViewDetail={(rep) =>
                      setSelectedReportDetail({
                        ...(rep || item.reports || {}),
                        id: rep?.id || item.report_id || item.id,
                        volume_kg: item.volume_kg,
                        biomass_estimate: item.volume_kg || rep?.biomass_estimate,
                        diameter_cm: item.diameter_cm,
                        length_m: item.length_m,
                        distanceKm: item.distanceKm,
                        wood_type: item.wood_type || rep?.tree_type,
                      } as any)
                    }
                    isClaiming={claimingId === item.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Modal Konfirmasi Klaim Kayu */}
      <AnimatePresence>
        {confirmClaimItem && (
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
                    <HandPalm size={18} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">
                      Konfirmasi klaim kayu
                    </h4>
                    <span className="text-[10px] text-[#19382B] font-medium">
                      Biomassa kayu hasil penebangan dinas
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmClaimItem(null)}
                  className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X weight="bold" className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#f8f9f5] border border-black/5 rounded-xl p-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#111111]/50 block">Jenis &amp; spesifikasi kayu:</span>
                  <strong className="text-[#19382B] font-bold text-xs">{confirmClaimItem.wood_type} ({confirmClaimItem.volume_kg} kg)</strong>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#111111]/50 block">Identitas penerima UMKM:</span>
                  <strong className="text-[#111111] font-bold text-xs block">{businessName}</strong>
                  <span className="text-[11px] text-[#111111]/70 font-medium block">
                    Penanggung jawab: {displayName} • WA: {phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClaimItem(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeClaimWoodItem}
                  disabled={claimingId === confirmClaimItem.id}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {claimingId === confirmClaimItem.id ? (
                    <CircleNotch size={16} className="animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle size={16} weight="bold" className="text-white" />
                      <span>Konfirmasi klaim</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <UmkmReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => fetchReportsAndCatalogs()}
      />

      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReportDetail}
        onClose={() => setSelectedReportDetail(null)}
        onClaim={(rep) => {
          const match = catalogs.find((c) => c.report_id === rep.id || c.id === rep.id);
          if (match) {
            setSelectedReportDetail(null);
            handleClaimWoodItem(match);
          }
        }}
      />

      {/* Map Location Picker Modal for Business GPS */}
      <LocationMapModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={userLocation?.lat || -6.1783}
        initialLng={userLocation?.lng || 106.6319}
        onSelectLocation={(lat, lng, addr) => {
          saveUserLocation(lat, lng, addr);
          showToast(`Lokasi usaha diset ke: ${addr}`, "GPS Usaha", "success");
        }}
      />
      <UmkmProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={displayName}
      />
    </div>
  );
};
