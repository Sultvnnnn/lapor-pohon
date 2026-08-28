"use client";

import { useState, useEffect } from "react";
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

  // User location for radius filter & reverse geocoded address
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddressName, setUserAddressName] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Active Mobile View Tab: 'peta' | 'katalog' | 'feed' | 'penindakan'
  const [mobileTab, setMobileTab] = useState<"peta" | "katalog" | "feed" | "penindakan">("katalog");

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
        // Fallback default: Jakarta center (-6.2088, 106.8456)
        const lat = -6.2088;
        const lng = 106.8456;
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

      alert(`Berhasil mengklaim sampel kayu atas nama UMKM: ${displayName}! Status pada katalog diperbarui menjadi TERKLAIM / SOLD OUT.`);

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

  return (
    <div
      className="max-w-[1300px] w-full mx-auto space-y-8 sm:space-y-10 pb-20 pt-2 sm:pt-6 px-4 sm:px-6 lg:px-8 font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── 1. Top Header Banner — Brand Dark Green #19382B & Lime #88d937 ── */}
      <div className="bg-[#19382B] text-white rounded-[2rem] p-6 sm:p-8 sm:p-10 shadow-sm border border-black/5 space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#88d937] text-[#111111] font-sans inline-flex items-center gap-1.5">
                <Storefront weight="duotone" className="w-4 h-4" />
                KATALOG KAYU BIOMASS & DASHBOARD ROLE UMKM
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.25rem] font-medium tracking-tight text-white leading-tight">
              Halo, <span className="font-serif italic font-medium text-[#88d937]">{displayName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
              Klaim kayu hasil penebangan dari tabel biomass_catalogs & pantau radar lokasi sekitar tempat usaha Anda.
            </p>
          </div>

          {/* Primary Lime CTA Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-[#88d937] hover:bg-[#78c92a] text-[#111111] font-bold rounded-full px-6 py-3.5 text-xs transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-95 uppercase tracking-wider"
          >
            <ShieldWarning weight="bold" className="w-4 h-4" />
            <span>Lapor Pohon Sekitar Usaha</span>
          </button>
        </div>

        {/* ── Summary Stats Cards ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#88d937] mb-1 flex items-center gap-1">
              <Package weight="bold" className="w-3.5 h-3.5 text-[#88d937]" />
              Katalog Biomass
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {catalogs.length}
              </span>
              <span className="text-[10px] text-white/60 hidden sm:inline font-semibold">Siap Olah</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-1 flex items-center gap-1">
              <Clock weight="bold" className="w-3.5 h-3.5 text-amber-300" />
              Terjadwal Petugas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                {scheduledReports.length}
              </span>
              <span className="text-[10px] text-white/60 hidden sm:inline font-semibold">Aksi Dinas</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col justify-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/80 mb-1 flex items-center gap-1">
              <Warning weight="bold" className="w-3.5 h-3.5 text-red-400" />
              Risiko Kritis
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {criticalReports.length}
              </span>
              <span className="text-[10px] text-white/60 hidden sm:inline font-semibold">Warga</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Filter Radius Usaha & GPS ── */}
      <div className="bg-white rounded-2xl border border-black/5 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center shrink-0 font-bold">
            <Funnel weight="bold" className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Filter Radius Usaha UMKM
            </h4>
            <p className="text-[11px] text-[#111111]/70 font-semibold">
              {userAddressName
                ? `Lokasi Terdeteksi: ${userAddressName}`
                : isDetectingLocation
                ? "Mendeteksi nama lokasi usaha Anda..."
                : "Aktifkan GPS untuk memfilter radius lokasi usaha Anda"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={detectUserLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] px-4 py-2 rounded-full transition-all shadow-sm shrink-0"
          >
            <NavigationArrow weight="bold" className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin" : ""}`} />
            <span>{isDetectingLocation ? "Mendeteksi..." : "GPS Usaha"}</span>
          </button>

          <select
            value={radiusKm === null ? "all" : String(radiusKm)}
            onChange={(e) => {
              const val = e.target.value;
              setRadiusKm(val === "all" ? null : Number(val));
            }}
            className="bg-[#ecefe6] border border-black/10 text-xs font-bold text-[#111111] rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#19382B]"
          >
            <option value="all">Semua Wilayah</option>
            <option value="0.5">Radius 500 meter</option>
            <option value="1">Radius 1 kilometer</option>
            <option value="2">Radius 2 kilometer</option>
          </select>
        </div>
      </div>

      {/* ── 3. Mobile View Tab Switcher (< 1024px) ── */}
      <div className="lg:hidden flex items-center gap-1 p-1 bg-[#ecefe6] border border-black/10 rounded-full">
        <button
          onClick={() => setMobileTab("katalog")}
          className={`flex-1 py-2 text-[11px] font-bold rounded-full transition-all ${
            mobileTab === "katalog"
              ? "bg-[#19382B] text-white shadow-xs"
              : "text-[#111111]/70 hover:text-[#111111]"
          }`}
        >
          Katalog Kayu
        </button>
        <button
          onClick={() => setMobileTab("peta")}
          className={`flex-1 py-2 text-[11px] font-bold rounded-full transition-all ${
            mobileTab === "peta"
              ? "bg-[#19382B] text-white shadow-xs"
              : "text-[#111111]/70 hover:text-[#111111]"
          }`}
        >
          Peta Pemantauan
        </button>
        <button
          onClick={() => setMobileTab("feed")}
          className={`flex-1 py-2 text-[11px] font-bold rounded-full transition-all ${
            mobileTab === "feed"
              ? "bg-[#19382B] text-white shadow-xs"
              : "text-[#111111]/70 hover:text-[#111111]"
          }`}
        >
          Radar Risiko
        </button>
      </div>

      {/* ── 4. SEKSI KATALOG KAYU DAPAT DI-KLAIM UMKM (Data dari biomass_catalogs) ── */}
      <div
        className={`space-y-4 ${
          mobileTab !== "katalog" ? "hidden lg:block" : "block"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#88d937] text-[#111111]">
              EKONOMI SIRKULAR BIOMASS_CATALOGS
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight pt-1">
              Katalog Kayu Biomass Terverifikasi Admin
            </h3>
            <p className="text-xs text-[#111111]/60">
              Pohon yang telah disetujui/ditebang oleh Admin dimasukkan ke tabel biomass_catalogs dan siap diklaim UMKM.
            </p>
          </div>

          <span className="text-xs font-extrabold bg-[#19382B] text-white px-3 py-1.5 rounded-full hidden sm:inline-block">
            {catalogs.length} Item Kayu Siap Klaim
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.length === 0 ? (
            <div className="col-span-full bg-white rounded-[2rem] border border-black/5 p-8 text-center text-xs font-semibold text-[#111111]/50">
              Belum ada sampel kayu di tabel biomass_catalogs saat ini.
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

      {/* ── 5. Main Multi-Column Grid (Peta Radar & Feed Notifikasi) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left / Center (7 Cols): Semarang Risk Map */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab !== "peta" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#19382B] flex items-center gap-2">
              <MapPin weight="bold" className="w-4 h-4 text-[#88d937]" />
              Peta Persebaran Radar Risiko Pohon
            </h3>
            <span className="text-[11px] text-[#111111]/50 font-semibold">
              Tekan titik pin untuk detail lengkap
            </span>
          </div>

          <SemarangRiskMap
            reports={mappedReports}
            radiusKm={radiusKm}
            userLocation={userLocation}
            onSelectReport={(report) => setSelectedReportDetail(report)}
          />
        </div>

        {/* Right Panel (5 Cols): Live Feed Laporan Warga & Penindakan Pemkot ── */}
        <div
          className={`lg:col-span-5 space-y-6 ${
            mobileTab === "peta" || mobileTab === "katalog" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Feed Notifikasi Laporan Warga Bermasalah */}
          <div
            className={`bg-white rounded-[2rem] border border-black/5 p-6 shadow-xs space-y-4 ${
              mobileTab === "penindakan" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-2">
                <Warning weight="bold" className="w-4 h-4 text-red-600" />
                Laporan Warga Kritis
              </h3>
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                {criticalReports.length} Titik Bahaya
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {criticalReports.length === 0 ? (
                <div className="text-center py-8 text-[#111111]/50 text-xs font-medium">
                  Tidak ada laporan pohon kritis di area ini.
                </div>
              ) : (
                criticalReports.slice(0, 5).map((item) => {
                  const rawRisk = typeof item.risk_score === "number" ? item.risk_score : 0;
                  const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReportDetail(item)}
                      className="bg-[#f8f9f5] border border-black/5 hover:border-[#19382B]/40 rounded-2xl p-4 space-y-2 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full inline-block">
                            RISIKO {risk}% (KRITIS)
                          </span>
                          <p className="text-xs font-bold text-[#111111] group-hover:text-[#19382B] transition-colors line-clamp-1 mt-1">
                            {item.description || "Laporan Pohon Rawan Tumbang Warga"}
                          </p>
                        </div>
                        <CaretRight weight="bold" className="w-4 h-4 text-[#111111]/40 group-hover:text-[#19382B] transition-colors shrink-0 mt-1" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#111111]/60 pt-1 border-t border-black/5">
                        <span>Kanopi: {item.canopy_volume || 0} m³</span>
                        <span className="text-[#19382B] font-bold flex items-center gap-1">
                          <MapPin weight="bold" className="w-3.5 h-3.5 text-[#19382B]" />
                          Lihat Detail
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* E-Timeline Penindakan Pemkot / Petugas */}
          <div
            className={`bg-white rounded-[2rem] border border-black/5 p-6 shadow-xs space-y-4 ${
              mobileTab === "feed" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#111111] flex items-center gap-2">
                <CalendarCheck weight="bold" className="w-4 h-4 text-[#19382B]" />
                Jadwal Penindakan Petugas
              </h3>
              <span className="text-[10px] font-bold bg-[#ecefe6] text-[#19382B] px-2.5 py-0.5 rounded-full">
                {scheduledReports.length} Aksi Terjadwal
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {scheduledReports.length === 0 ? (
                <div className="text-center py-8 text-[#111111]/50 text-xs font-medium">
                  Belum ada penindakan terjadwal petugas saat ini.
                </div>
              ) : (
                scheduledReports.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedReportDetail(item)}
                    className="bg-[#f8f9f5] border border-black/5 hover:border-[#19382B]/40 rounded-2xl p-4 space-y-2 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#19382B] bg-[#ecefe6] px-2.5 py-0.5 rounded-full">
                        {item.status === "in_progress" ? "SEDANG DIEKSEKUSI" : "TERJADWAL"}
                      </span>
                      {item.scheduled_at && (
                        <span className="text-[11px] font-bold text-[#19382B]">
                          {new Date(item.scheduled_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#111111] group-hover:text-[#19382B] transition-colors">
                      {item.admin_note || "Penataan & Pemangkasan Dahan Pohon Rawan"}
                    </p>

                    <div className="bg-[#ecefe6] rounded-xl p-2.5 text-[11px] text-[#111111]/80 font-medium leading-relaxed flex items-center justify-between">
                      <span>Notice Dampak UMKM: Potensi gangguan akses jalan</span>
                      <CaretRight weight="bold" className="w-3.5 h-3.5 text-[#19382B] shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

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
