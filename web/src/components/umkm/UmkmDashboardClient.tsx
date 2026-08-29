"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SemarangRiskMap, ReportItem } from "./SemarangRiskMap";
import { UmkmReportModal } from "./UmkmReportModal";
import { ReportDetailModal } from "./ReportDetailModal";
import { WoodCatalogCard, BiomassCatalogItem } from "./WoodCatalogCard";
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

  // Active View Tab: 'katalog' | 'klaim' | 'peta' | 'penindakan'
  const [activeTab, setActiveTab] = useState<"katalog" | "peta" | "penindakan">("katalog");

  // Data Profil Usaha UMKM (Nama Usaha, Jenis Usaha, Telepon)
  const [businessName, setBusinessName] = useState<string>("Kerajinan Kayu Mutiara Jati");
  const [businessType, setBusinessType] = useState<string>("Kerajinan Kayu & Ukir");
  const [phone, setPhone] = useState<string>("0812-3456-7890");
  const [confirmClaimItem, setConfirmClaimItem] = useState<BiomassCatalogItem | null>(null);

  useEffect(() => {
    // Load from localStorage or Supabase
    const savedName = localStorage.getItem("umkm_business_name");
    const savedType = localStorage.getItem("umkm_business_type");
    const savedPhone = localStorage.getItem("umkm_phone");
    if (savedName) setBusinessName(savedName);
    if (savedType) setBusinessType(savedType);
    if (savedPhone) setPhone(savedPhone);

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

  const detectUserLocation = async () => {
    setIsDetectingLocation(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const name = addr.suburb || addr.city_district || addr.city || addr.town || "Lokasi Anda";
              setUserAddressName(`${name}, Indonesia`);
            }
          } catch {
            setUserAddressName(`Koordinat (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
          } finally {
            setIsDetectingLocation(false);
            showToast("Lokasi usaha terdeteksi.", "GPS Usaha", "success");
          }
        },
        () => {
          fallbackIpGeolocate();
        },
        { enableHighAccuracy: true, timeout: 8000 }
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
        if (data.latitude && data.longitude) {
          setUserLocation({ lat: data.latitude, lng: data.longitude });
          const ipAddr = `${data.city || "Kota"}, ${data.region || ""}, Indonesia`;
          setUserAddressName(ipAddr);
          setIsDetectingLocation(false);
          showToast(`Lokasi usaha terdeteksi: ${ipAddr}`, "GPS Usaha", "success");
          return;
        }
      }
    } catch {
      console.log("IP API failed");
    }

    setIsDetectingLocation(false);
    setUserAddressName("Lokasi usaha terdaftar");
    showToast("Lokasi terdeteksi.", "GPS Usaha", "success");
  };

  const fetchReportsAndCatalogs = async () => {
    // 1. Fetch reports
    const { data: repData } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (repData) {
      setReports(repData as ReportItem[]);
    }

    // 2. Fetch biomass_catalogs with joined report data & profile claims
    try {
      const { data: catData, error: catErr } = await supabase
        .from("biomass_catalogs")
        .select(`
          *,
          reports (*),
          profiles:claimed_by (full_name)
        `)
        .order("created_at", { ascending: false });

      if (!catErr && catData && catData.length > 0) {
        const formattedCatalogs: BiomassCatalogItem[] = catData.map((c: any) => ({
          id: c.id,
          report_id: c.report_id,
          wood_type: c.wood_type || "Pohon kayu olahan",
          volume_kg: c.volume_kg || 100.0,
          status: c.status || "available",
          claimed_by: c.claimed_by,
          claimed_by_name: c.profiles?.full_name || (c.claimed_by ? "UMKM terdaftar" : null),
          created_at: c.created_at,
          updated_at: c.updated_at,
          reports: c.reports,
          claim_ticket_code: c.claim_ticket_code || `KLM-2026-${c.id.slice(0, 5).toUpperCase()}`,
          handover_status: c.handover_status || (c.status === "claimed" ? "WAITING_PICKUP" : "AVAILABLE"),
        }));
        setCatalogs(formattedCatalogs);
      } else {
        deriveCatalogFromReports(repData as ReportItem[] || []);
      }
    } catch {
      deriveCatalogFromReports(repData as ReportItem[] || []);
    }
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

      await supabase
        .from("biomass_catalogs")
        .update({
          claimed_by: user?.id || null,
          claimed_by_name: displayName || user?.email || "UMKM terdaftar",
          claimed_by_business_name: businessName || "Kerajinan Kayu Mutiara Jati",
          claimed_by_business_type: businessType || "Kerajinan kayu",
          claimed_by_phone: phone || "0812-3456-7890",
          claim_ticket_code: newTicketCode,
          handover_status: "WAITING_PICKUP",
          status: "claimed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", catalogItem.id);

      if (catalogItem.report_id) {
        await supabase
          .from("reports")
          .update({
            claimed_by_name: displayName,
          })
          .eq("id", catalogItem.report_id);
      }

      showToast(
        `Tiket ${newTicketCode} terbit! Kayu "${catalogItem.wood_type}" berhasil diklaim atas nama ${displayName}.`,
        "Klaim kayu berhasil!",
        "success"
      );

      setCatalogs((prev) =>
        prev.map((c) =>
          c.id === catalogItem.id
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
          r.id === catalogItem.report_id ? { ...r, claimed_by_name: displayName } : r
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
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 bg-[#ecefe6] text-[#19382B] px-3 py-1 rounded-full text-[10px] font-bold border border-black/5">
              <Storefront size={13} weight="fill" />
              <span>{businessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] leading-tight">
            Panel UMKM <span className="font-serif italic font-medium text-[#19382B]">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Klaim pasokan kayu hasil penebangan pemeliharaan pohon &amp; manfaatkan untuk produk olahan UMKM lokal.
          </p>
        </div>

        {/* Standardized Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0 lg:ml-auto">
          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Katalog kayu
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {catalogs.length}
            </span>
          </div>

          <div className="bg-[#ecefe6] border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#19382B] mb-1">
              Kayu terklaim
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#19382B] tracking-tight">
              {claimedCatalogsCount}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Jadwal petugas
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {scheduledReports.length}
            </span>
          </div>

          <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col justify-center min-w-[130px] shadow-sm">
            <span className="text-[11px] font-medium text-[#111111]/60 mb-1">
              Risiko tinggi
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              {criticalReports.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Unified Card Layout */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        {/* Controls Section */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-black/5 bg-white">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Tab View Switcher */}
            <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 overflow-x-auto scrollbar-none w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("katalog")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "katalog"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <Package size={15} weight="bold" />
                <span>Katalog kayu ({catalogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("peta")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "peta"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <MapTrifold size={15} weight="bold" />
                <span>Peta lokasi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("penindakan")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "penindakan"
                    ? "bg-[#19382B] text-white shadow-sm"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <CalendarCheck size={15} weight="bold" />
                <span>Jadwal petugas ({scheduledReports.length})</span>
              </button>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95 cursor-pointer"
            >
              <ShieldWarning size={16} weight="bold" className="text-white" />
              <span>Lapor pohon rawan sekitar usaha</span>
            </button>
          </div>

          {/* Filter Radius Usaha & GPS Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[#111111]/60 flex items-center gap-1.5 shrink-0">
                <Funnel size={14} weight="bold" className="text-[#19382B]" />
                Filter radius usaha:
              </span>

              <select
                value={radiusKm === null ? "all" : String(radiusKm)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRadiusKm(val === "all" ? null : Number(val));
                }}
                className="bg-[#f8f9f5] border border-black/10 text-xs font-bold text-[#111111] rounded-full px-4 py-1.5 focus:outline-none focus:border-[#19382B] cursor-pointer"
              >
                <option value="all">Semua wilayah</option>
                <option value="0.5">Radius 500 meter</option>
                <option value="1">Radius 1 kilometer</option>
                <option value="2">Radius 2 kilometer</option>
              </select>

              <button
                type="button"
                onClick={detectUserLocation}
                disabled={isDetectingLocation}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full transition-all shadow-sm shrink-0 cursor-pointer border border-black/5"
              >
                <NavigationArrow weight="bold" className={`w-3.5 h-3.5 text-white ${isDetectingLocation ? "animate-spin" : ""}`} />
                <span>{isDetectingLocation ? "Mendeteksi..." : "Deteksi GPS usaha"}</span>
              </button>
            </div>

            <div className="text-[11px] font-medium text-[#111111]/70 truncate">
              {userAddressName ? (
                <span className="text-[#19382B] font-bold">Lokasi usaha: {userAddressName}</span>
              ) : (
                <span className="text-gray-600">Klik "Deteksi GPS usaha" untuk memperbarui lokasi</span>
              )}
            </div>
          </div>
        </div>

        {/* Display Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "katalog" && (
            <div className="space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                    Katalog kayu terverifikasi dinas
                  </h3>
                  <p className="text-xs text-[#111111]/60 font-medium">
                    Pohon yang disetujui atau ditebang oleh dinas kota dimasukkan ke katalog dan siap diklaim UMKM.
                  </p>
                </div>

                <span className="text-xs font-bold bg-[#19382B] text-white px-3.5 py-1.5 rounded-full border border-black/5 self-start sm:self-auto shrink-0">
                  {catalogs.length} kayu siap olah
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {catalogs.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-black/8 p-12 text-center text-xs font-medium text-[#111111]/50 space-y-2">
                    <Package size={36} className="mx-auto text-gray-300" />
                    <p>Belum ada sampel kayu di katalog saat ini.</p>
                  </div>
                ) : (
                  catalogs.map((item) => (
                    <WoodCatalogCard
                      key={item.id}
                      item={item}
                      onClaim={handleClaimWoodItem}
                      onViewDetail={(rep) => setSelectedReportDetail(rep)}
                      isClaiming={claimingId === item.id}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "peta" && (
            <div className="space-y-4 font-sans">
              <SemarangRiskMap
                reports={mappedReports}
                onSelectReport={(rep) => setSelectedReportDetail(rep)}
                userLocation={userLocation}
              />
            </div>
          )}

          {activeTab === "penindakan" && (
            <div className="space-y-4 font-sans">
              <div className="border-b border-black/5 pb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                  Jadwal penanganan petugas dinas
                </h3>
                <p className="text-xs text-[#111111]/60 font-medium">
                  Pantau tanggal eksekusi penebangan/pemangkasan pohon oleh regu lapangan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scheduledReports.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-black/8 p-12 text-center text-xs font-medium text-gray-400">
                    Belum ada jadwal penanganan eksekusi aktif.
                  </div>
                ) : (
                  scheduledReports.map((r) => (
                    <div key={r.id} className="bg-white border border-black/8 rounded-2xl p-4 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                          {r.tree_type || "Pohon kayu olahan"}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          #{r.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#111111] line-clamp-2">
                        {r.description || "Penanganan penebangan pohon kota"}
                      </p>
                      {r.scheduled_at && (
                        <div className="text-xs font-bold text-[#19382B] bg-[#ecefe6] p-2 rounded-xl flex items-center gap-1.5">
                          <CalendarCheck size={16} weight="bold" />
                          <span>
                            Jadwal: {new Date(r.scheduled_at).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
    </div>
  );
};
