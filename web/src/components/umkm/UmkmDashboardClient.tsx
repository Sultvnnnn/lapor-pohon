"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SemarangRiskMap, ReportItem } from "./SemarangRiskMap";
import { UmkmReportModal } from "./UmkmReportModal";
import { ReportDetailModal } from "./ReportDetailModal";
import { WoodCatalogCard, BiomassCatalogItem } from "./WoodCatalogCard";
import {
  Tree,
  Warning,
  Clock,
  CheckCircle,
  MapPin,
  Storefront,
  Funnel,
  CalendarCheck,
  CaretRight,
  ShieldWarning,
  Plus,
  NavigationArrow,
  Package,
  Check,
  X,
  Rows,
  MapTrifold,
  HandPalm,
  Sparkle,
  ShieldCheck,
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
    title = "Klaim Berhasil",
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

  // Active View Tab: 'katalog' | 'peta' | 'feed' | 'penindakan'
  const [activeTab, setActiveTab] = useState<"katalog" | "peta" | "feed" | "penindakan">("katalog");

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
          wood_type: c.wood_type || "Pohon Kayu Olahan",
          volume_kg: c.volume_kg || 100.0,
          status: c.status || "available",
          claimed_by: c.claimed_by,
          claimed_by_name: c.profiles?.full_name || (c.claimed_by ? "UMKM Terdaftar" : null),
          created_at: c.created_at,
          updated_at: c.updated_at,
          reports: c.reports,
        }));
        setCatalogs(formattedCatalogs);
      } else {
        // Fallback: If biomass_catalogs is empty or table not migrated yet, derive from completed reports
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
      wood_type: r.tree_type || "Pohon Kayu Olahan",
      volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : (r.canopy_volume ? Number(r.canopy_volume) * 10 : 100.0),
      status: r.claimed_by_name ? "claimed" : "available",
      claimed_by_name: r.claimed_by_name || null,
      created_at: r.created_at,
      updated_at: r.created_at,
      reports: r,
    }));

    setCatalogs(derived);
  };

  useEffect(() => {
    detectUserLocation();
    fetchReportsAndCatalogs();
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      const addr = data.address || {};
      const suburb = addr.suburb || addr.village || addr.neighbourhood || addr.quarter || addr.district || "";
      const city = addr.city || addr.town || addr.city_district || addr.county || addr.regency || "";
      const state = addr.state || "";

      const parts = [suburb, city, state].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : data.display_name || "Lokasi Usaha Terdeteksi";
    } catch {
      return "Lokasi Usaha Terdeteksi";
    }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        const address = await reverseGeocode(lat, lng);
        if (address) setUserAddressName(address);
        setIsDetectingLocation(false);
      },
      async () => {
        // Fallback default: Semarang center
        const lat = -6.9667;
        const lng = 110.4167;
        setUserLocation({ lat, lng });
        const address = await reverseGeocode(lat, lng);
        if (address) setUserAddressName(address);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Function for claiming wood item in biomass_catalogs
  const handleClaimWoodItem = async (catalogItem: BiomassCatalogItem) => {
    if (catalogItem.status === "claimed" || catalogItem.claimed_by_name) return;

    setClaimingId(catalogItem.id);

    try {
      // 1. Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Update biomass_catalogs table
      const { error: catErr } = await supabase
        .from("biomass_catalogs")
        .update({
          claimed_by: user?.id || null,
          status: "claimed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", catalogItem.id);

      // 3. Update reports table for fallback compatibility
      if (catalogItem.report_id) {
        await supabase
          .from("reports")
          .update({
            claimed_by_name: displayName,
          })
          .eq("id", catalogItem.report_id);
      }

      showToast(
        `Sampel kayu "${catalogItem.wood_type}" berhasil diklaim atas nama ${displayName}!`,
        "Klaim Biomass Berhasil!",
        "success"
      );

      // Optimistic UI update
      setCatalogs((prev) =>
        prev.map((c) =>
          c.id === catalogItem.id
            ? { ...c, status: "claimed", claimed_by_name: displayName }
            : c
        )
      );

      setReports((prev) =>
        prev.map((r) =>
          r.id === catalogItem.report_id ? { ...r, claimed_by_name: displayName } : r
        )
      );
    } catch (err) {
      console.error("Error claiming wood catalog item:", err);
      showToast("Gagal memproses klaim kayu. Silakan coba beberapa saat lagi.", "Gagal Mengklaim", "warning");
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
      {/* ── 1. Header Minimalis & Stats (Welcome Text Kiri, 4 Card Putih Kanan Persis Dashboard Admin & Warga) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8"
      >
        {/* Teks Sapaan & Subtitle */}
        <div className="space-y-1.5 min-w-0 max-w-md">
          <div className="inline-flex items-center gap-2 bg-[#ecefe6] text-[#19382B] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 border border-black/5">
            <Storefront size={14} weight="fill" className="text-[#19382B]" />
            <span>Panel UMKM Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[2rem] font-semibold tracking-tight text-[#111111] leading-tight">
            Panel UMKM <span className="font-serif italic font-medium text-[#0b3d2c]">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Klaim pasokan kayu hasil penebangan pemeliharaan pohon kota Semarang &amp; manfaatkan untuk produk olahan UMKM lokal.
          </p>
        </div>

        {/* Metrik KPI (4 Card Putih Bersih di Pinggir Kanan khas Dashboard Admin & Warga) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0 lg:ml-auto">
          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40 mb-1">
              Katalog Biomass
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#19382B] tracking-tight">
              {catalogs.length}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600/70 mb-1">
              Kayu Terklaim
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              {claimedCatalogsCount}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600/70 mb-1">
              Jadwal Petugas
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
              {scheduledReports.length}
            </span>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[125px] sm:min-w-[140px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-600/70 mb-1">
              Risiko Kritis
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
              {criticalReports.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Unified Card Layout (Controls, Filter Radius, & Content Display Sesuai Dashboard Admin) ── */}
      <div className="bg-white rounded-[2rem] border border-black/5 shadow-xs overflow-hidden">
        {/* Card Header & Controls Section */}
        <div className="p-4 sm:p-6 space-y-4 border-b border-black/5 bg-white">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
            {/* Tab View Switcher (Katalog | Peta | Laporan Kritis | Jadwal Petugas) */}
            <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 overflow-x-auto scrollbar-none w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("katalog")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "katalog"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <Package size={15} weight="bold" className={activeTab === "katalog" ? "text-[#88d937]" : ""} />
                <span>Katalog Kayu ({catalogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("peta")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "peta"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <MapTrifold size={15} weight="bold" className={activeTab === "peta" ? "text-[#88d937]" : ""} />
                <span>Peta Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("feed")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "feed"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <Warning size={15} weight="bold" className={activeTab === "feed" ? "text-[#88d937]" : ""} />
                <span>Laporan Kritis ({criticalReports.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("penindakan")}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "penindakan"
                    ? "bg-[#19382B] text-white shadow-xs"
                    : "text-[#111111]/70 hover:bg-black/5 hover:text-[#111111]"
                }`}
              >
                <CalendarCheck size={15} weight="bold" className={activeTab === "penindakan" ? "text-[#88d937]" : ""} />
                <span>Jadwal Petugas ({scheduledReports.length})</span>
              </button>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-5 py-2.5 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 active:scale-95 cursor-pointer"
            >
              <ShieldWarning size={16} weight="bold" className="text-[#88d937]" />
              <span>Lapor Pohon Rawan Sekitar Usaha</span>
            </button>
          </div>

          {/* Filter Radius Usaha & GPS Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-[#111111]/60 flex items-center gap-1.5 shrink-0">
                <Funnel size={14} weight="bold" className="text-[#19382B]" />
                Filter Radius Usaha:
              </span>

              <select
                value={radiusKm === null ? "all" : String(radiusKm)}
                onChange={(e) => {
                  const val = e.target.value;
                  setRadiusKm(val === "all" ? null : Number(val));
                }}
                className="bg-[#f8f9f5] border border-black/10 text-xs font-extrabold text-[#111111] rounded-full px-4 py-1.5 focus:outline-none focus:border-[#19382B] cursor-pointer"
              >
                <option value="all">Semua Wilayah</option>
                <option value="0.5">Radius 500 meter</option>
                <option value="1">Radius 1 kilometer</option>
                <option value="2">Radius 2 kilometer</option>
              </select>

              <button
                type="button"
                onClick={detectUserLocation}
                disabled={isDetectingLocation}
                className="flex items-center justify-center gap-1.5 text-xs font-extrabold bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full transition-all shadow-2xs shrink-0 cursor-pointer active:scale-95 border border-black/5"
                title="Deteksi Lokasi Usaha via GPS"
              >
                <NavigationArrow weight="bold" className={`w-3.5 h-3.5 text-[#88d937] ${isDetectingLocation ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isDetectingLocation ? "Mendeteksi..." : "GPS Usaha"}</span>
              </button>
            </div>

            <div className="text-[11px] font-semibold text-[#111111]/50 truncate">
              {userAddressName ? `📍 ${userAddressName}` : "Aktifkan GPS untuk memfilter radius lokasi usaha"}
            </div>
          </div>
        </div>

        {/* Display Content depending on active tab */}
        <div className="p-4 sm:p-6">
          {activeTab === "katalog" && (
            <div className="space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#88d937] text-[#111111] border border-black/10 inline-block">
                    EKONOMI SIRKULAR BIOMASS_CATALOGS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight pt-0.5">
                    Katalog Kayu Biomass Terverifikasi Admin
                  </h3>
                  <p className="text-xs text-[#111111]/60 font-medium">
                    Pohon yang disetujui / ditebang oleh Dinas Lingkungan Hidup dimasukkan ke katalog dan siap diklaim UMKM.
                  </p>
                </div>

                <span className="text-xs font-extrabold bg-[#19382B] text-white px-3.5 py-1.5 rounded-full border border-black/5 self-start sm:self-auto shrink-0">
                  {catalogs.length} Item Kayu Siap Olah
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
                {catalogs.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[2rem] border border-black/8 p-12 text-center text-xs font-semibold text-[#111111]/50 space-y-2">
                    <Package size={36} className="mx-auto text-gray-300" />
                    <p>Belum ada sampel kayu di katalog saat ini.</p>
                  </div>
                ) : (
                  catalogs.map((item) => (
                    <WoodCatalogCard
                      key={item.id}
                      item={item}
                      isClaiming={claimingId === item.id}
                      onClaim={(catItemToClaim) => handleClaimWoodItem(catItemToClaim)}
                      onViewDetail={(reportToView) => setSelectedReportDetail(reportToView)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "peta" && (
            <div className="space-y-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#19382B] flex items-center gap-2">
                  <MapPin weight="bold" className="w-4 h-4 text-[#88d937]" />
                  Peta Persebaran Radar Risiko Pohon Kota Semarang
                </h3>
                <span className="text-[11px] text-[#111111]/50 font-semibold">
                  Klik pada pin lokasi untuk melihat rincian detail aduan &amp; foto
                </span>
              </div>

              <SemarangRiskMap
                reports={mappedReports}
                radiusKm={radiusKm}
                userLocation={userLocation}
                onSelectReport={(report) => setSelectedReportDetail(report)}
              />
            </div>
          )}

          {activeTab === "feed" && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] flex items-center gap-2">
                  <Warning weight="bold" className="w-4 h-4 text-red-600" />
                  Laporan Warga Kritis di Sekitar Anda
                </h3>
                <span className="text-[10px] font-extrabold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                  {criticalReports.length} Titik Bahaya
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalReports.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#111111]/50 text-xs font-medium">
                    Tidak ada laporan pohon kritis di area ini.
                  </div>
                ) : (
                  criticalReports.map((item) => {
                    const rawRisk = typeof item.risk_score === "number" ? item.risk_score : 0;
                    const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedReportDetail(item)}
                        className="bg-[#f8f9f5] border border-black/8 hover:border-[#19382B]/40 rounded-2xl p-4 space-y-2.5 transition-all cursor-pointer group hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full inline-block border border-red-200">
                              RISIKO {risk}% (KRITIS)
                            </span>
                            <h4 className="text-xs font-extrabold text-[#111111] group-hover:text-[#19382B] transition-colors line-clamp-1">
                              {item.description || "Laporan Pohon Rawan Tumbang Warga"}
                            </h4>
                          </div>
                          <CaretRight weight="bold" className="w-4 h-4 text-[#111111]/40 group-hover:text-[#19382B] transition-colors shrink-0 mt-1" />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#111111]/60 pt-2 border-t border-black/5 font-medium">
                          <span>Kanopi: {item.canopy_volume || 0} m³</span>
                          <span className="text-[#19382B] font-extrabold flex items-center gap-1">
                            <MapPin weight="bold" className="w-3.5 h-3.5 text-[#19382B]" />
                            Detail
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "penindakan" && (
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] flex items-center gap-2">
                  <CalendarCheck weight="bold" className="w-4 h-4 text-[#19382B]" />
                  Jadwal Penindakan Petugas DLH Pemkot
                </h3>
                <span className="text-[10px] font-extrabold bg-[#ecefe6] text-[#19382B] px-2.5 py-0.5 rounded-full border border-black/5">
                  {scheduledReports.length} Aksi Terjadwal
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduledReports.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#111111]/50 text-xs font-medium">
                    Belum ada penindakan terjadwal petugas saat ini.
                  </div>
                ) : (
                  scheduledReports.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReportDetail(item)}
                      className="bg-[#f8f9f5] border border-black/8 hover:border-[#19382B]/40 rounded-2xl p-4 space-y-2.5 cursor-pointer transition-all group hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full border border-black/5">
                          {item.status === "in_progress" ? "SEDANG DIEKSEKUSI" : "TERJADWAL"}
                        </span>
                        {item.scheduled_at && (
                          <span className="text-[11px] font-extrabold text-[#19382B]">
                            {new Date(item.scheduled_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-extrabold text-[#111111] group-hover:text-[#19382B] transition-colors line-clamp-2">
                        {item.admin_note || "Penataan & Pemangkasan Dahan Pohon Rawan"}
                      </h4>

                      <div className="bg-[#ecefe6] rounded-xl p-2.5 text-[11px] text-[#111111]/80 font-medium leading-relaxed flex items-center justify-between border border-black/5">
                        <span className="line-clamp-1">Notice UMKM: Akses jalan dapat terganggu</span>
                        <CaretRight weight="bold" className="w-3.5 h-3.5 text-[#19382B] shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Floating Toast Notification Pill ── */}
      <AnimatePresence>
        {toast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[999999] pointer-events-none font-sans px-4 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-[#19382B] text-white p-4 rounded-2xl shadow-2xl border border-[#88d937]/30 flex items-center gap-3 pointer-events-auto"
            >
              <div className="w-9 h-9 rounded-full bg-[#88d937] text-[#19382B] flex items-center justify-center shrink-0 shadow-2xs">
                <Check size={20} weight="bold" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-white tracking-tight">{toast.title}</p>
                <p className="text-[11px] text-[#88d937] font-medium leading-snug truncate mt-0.5">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setToast(null)}
                className="w-6 h-6 rounded-full hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center shrink-0 transition-colors"
              >
                <X size={14} weight="bold" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Lapor Pohon Cepat untuk UMKM */}
      <UmkmReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => fetchReportsAndCatalogs()}
      />

      {/* Modal Detail Laporan Komprehensif saat Titik/Item Diklik */}
      <ReportDetailModal
        report={selectedReportDetail}
        onClose={() => setSelectedReportDetail(null)}
        onClaim={() => {
          const matchingCatalog = catalogs.find((c) => c.report_id === selectedReportDetail?.id);
          if (matchingCatalog) handleClaimWoodItem(matchingCatalog);
        }}
        isClaiming={claimingId !== null}
      />
    </div>
  );
};
