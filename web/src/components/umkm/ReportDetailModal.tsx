"use client";

import { useState, useEffect, useRef } from "react";
import { ReportItem } from "./SemarangRiskMap";
import { parseCoordinates } from "../admin/AdminDashboardClient";
import { TreeImageWithBoundingBox } from "@/components/TreeImageWithBoundingBox";
import {
  X,
  MapPin,
  Clock,
  CheckCircle,
  Tree,
  CalendarCheck,
  Info,
  HandPalm,
  Storefront,
  NavigationArrow,
} from "@phosphor-icons/react";

/* ── Interactive Leaflet Map for Detail Modal ── */
const ModalInteractiveMap = ({
  report,
  addressName,
}: {
  report: ReportItem;
  addressName: string | null;
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const parsed = parseCoordinates(report);
  const lat =
    parsed?.lat ??
    (typeof report.latitude === "number"
      ? report.latitude
      : parseFloat(String(report.latitude)) || -6.9667);
  const lng =
    parsed?.lng ??
    (typeof report.longitude === "number"
      ? report.longitude
      : parseFloat(String(report.longitude)) || 110.4167);

  const hasValidCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  const displayLat = hasValidCoords ? lat : -6.9667;
  const displayLng = hasValidCoords ? lng : 110.4167;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isSubscribed = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (!isSubscribed || !mapContainerRef.current) return;

      // Fix Leaflet Default Icon Paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Inject Leaflet CSS dynamically if missing
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [displayLat, displayLng],
        zoom: 16,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin Marker
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background: #19382B;
            color: #ffffff;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            border-radius: 9999px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
          ">
            •
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([displayLat, displayLng], { icon: customIcon }).addTo(map);
      marker
        .bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; font-weight: 700; color: #111111; padding: 2px;">
          <strong style="color: #19382B; display: block; font-size: 12px; margin-bottom: 2px;">${
            report.tree_type || "Lokasi pohon ditebang"
          }</strong>
          <span>ID laporan: #${report.id.slice(0, 8)}</span><br/>
          <span style="color: #666;">${addressName || report.description || "Titik tebangan dinas"}</span>
        </div>
      `)
        .openPopup();

      mapInstanceRef.current = map;
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);
    };

    initMap();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [displayLat, displayLng, report, addressName]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${displayLat},${displayLng}`;

  return (
    <div className="space-y-2 pt-1 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#111111]/60 flex items-center gap-1.5">
          <MapPin weight="fill" className="w-3.5 h-3.5 text-[#19382B]" />
          Peta lokasi tebangan (ID Laporan: #{report.id.slice(0, 8)})
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#19382B] hover:bg-[#234A39] text-white px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all"
        >
          <span>Buka Google Maps</span>
          <NavigationArrow size={11} weight="bold" />
        </a>
      </div>

      {/* Interactive Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-48 rounded-2xl border border-black/10 shadow-sm bg-[#ecefe6] z-0 overflow-hidden relative"
      />

      <div className="bg-[#ecefe6] p-3 rounded-2xl text-xs font-bold text-[#19382B] flex items-center gap-2">
        <MapPin weight="fill" className="w-4 h-4 text-[#19382B] shrink-0" />
        <span className="font-medium text-[11px] text-[#111111] line-clamp-2">
          {addressName ||
            (hasValidCoords
              ? `Koordinat: ${displayLat.toFixed(5)}, ${displayLng.toFixed(5)}`
              : "Lokasi terverifikasi petugas dinas")}
        </span>
      </div>
    </div>
  );
};

interface ReportDetailModalProps {
  report: ReportItem | null;
  onClose: () => void;
  onClaim?: (report: ReportItem) => void;
  isClaiming?: boolean;
}

export const ReportDetailModal = ({
  report,
  onClose,
  onClaim,
  isClaiming = false,
}: ReportDetailModalProps) => {
  const [addressName, setAddressName] = useState<string | null>(null);

  useEffect(() => {
    if (!report) {
      setAddressName(null);
      return;
    }

    const lat = typeof report.latitude === "number" ? report.latitude : parseFloat(String(report.latitude));
    const lng = typeof report.longitude === "number" ? report.longitude : parseFloat(String(report.longitude));

    if (isNaN(lat) || isNaN(lng)) return;

    let isMounted = true;

    const reverseGeocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const addr = data.address || {};
        const suburb = addr.suburb || addr.village || addr.neighbourhood || addr.quarter || addr.district || "";
        const city = addr.city || addr.town || addr.city_district || addr.county || addr.regency || "";
        const state = addr.state || "";

        const parts = [suburb, city, state].filter(Boolean);
        if (isMounted) {
          setAddressName(parts.length > 0 ? parts.join(", ") : data.display_name);
        }
      } catch {
        if (isMounted) setAddressName(null);
      }
    };

    reverseGeocode();

    return () => {
      isMounted = false;
    };
  }, [report]);

  if (!report) return null;

  const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
  const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

  let riskBg = "bg-[#19382B] text-white";
  let riskLabel = "Risiko rendah";

  if (risk >= 60) {
    riskBg = "bg-[#19382B] text-white";
    riskLabel = "Kritis (risiko tinggi)";
  } else if (risk >= 30) {
    riskBg = "bg-[#ecefe6] text-[#19382B]";
    riskLabel = "Risiko sedang";
  }

  const isCompleted = report.status === "completed" || report.status === "resolved";
  const isScheduled = report.status === "scheduled" || report.status === "in_progress" || !!report.scheduled_at;
  const isSoldOut = !!report.claimed_by_name;

  const displayImage = report.proof_image_url || report.image_url;
  const rawBoxes = report.bounding_box || report.bounding_boxes;
  const hasBoxes = Array.isArray(rawBoxes) && rawBoxes.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Tree weight="fill" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Detail pohon &amp; katalog kayu
              </h3>
              <span className="text-[10px] font-medium text-[#111111]/60 block mt-0.5">
                Monitoring lokasi aduan
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition-colors shrink-0"
          >
            <X weight="bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Gambar Laporan / Bukti Penebangan dengan Bounding Box */}
        {displayImage ? (
          <div className="relative w-full rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-[#f8f9f5]">
            {hasBoxes && !report.proof_image_url ? (
              <TreeImageWithBoundingBox
                imageUrl={displayImage}
                boundingBoxes={rawBoxes}
                riskScore={risk}
                alt="Deteksi bounding box pohon"
              />
            ) : (
              <img
                src={displayImage}
                alt="Foto laporan pohon"
                className="w-full h-52 sm:h-60 object-cover"
              />
            )}
            <div className="absolute top-3 left-3 z-10">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-sm ${riskBg}`}>
                {riskLabel} ({risk}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-36 bg-[#f8f9f5] border border-black/5 rounded-2xl flex items-center justify-center text-xs font-medium text-[#111111]/40">
            Tidak ada foto lampiran
          </div>
        )}

        {/* Status Penindakan Petugas & Katalog Klaim */}
        <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#111111]/50">
              Status penindakan petugas
            </span>
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                isSoldOut
                  ? "bg-gray-200 text-gray-700"
                  : isCompleted
                  ? "bg-[#19382B] text-white"
                  : isScheduled
                  ? "bg-[#ecefe6] text-[#19382B]"
                  : "bg-white text-gray-600 border border-black/10"
              }`}
            >
              {isSoldOut
                ? "Terklaim / habis"
                : isCompleted
                ? "Selesai dipangkas (siap klaim)"
                : isScheduled
                ? "Terjadwal petugas"
                : "Menunggu penindakan"}
            </span>
          </div>

          {report.tree_type && (
            <div className="text-xs font-bold text-[#19382B] bg-[#ecefe6] p-2.5 rounded-xl">
              Jenis pohon kayu: <span className="font-bold text-[#111111]">{report.tree_type}</span>
            </div>
          )}

          {report.scheduled_at && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#19382B] bg-[#ecefe6] p-2.5 rounded-xl">
              <CalendarCheck weight="bold" className="w-4 h-4 text-[#19382B] shrink-0" />
              <span>
                Jadwal eksekusi:{" "}
                {new Date(report.scheduled_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {report.admin_note && (
            <div className="text-xs text-[#111111]/80 font-medium italic bg-white p-3 rounded-xl border border-black/5">
              Catatan petugas dinas: "{report.admin_note}"
            </div>
          )}
        </div>

        {/* Metrik Analisis */}
        {(() => {
          const canopyVol = typeof report.canopy_volume === "number" ? report.canopy_volume : parseFloat(String(report.canopy_volume || 0));
          const biomassEst = typeof report.biomass_estimate === "number" ? report.biomass_estimate : parseFloat(String(report.biomass_estimate || 0));

          return (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-[#111111]/50 block mb-1">
                    Volume kanopi
                  </span>
                  <span className="text-xl font-bold text-[#19382B]">
                    {!isNaN(canopyVol) ? canopyVol.toFixed(2) : "0.00"} m³
                  </span>
                </div>

                <div className="bg-[#f8f9f5] border border-black/5 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-[#111111]/50 block mb-1">
                    Estimasi biomassa
                  </span>
                  <span className="text-xl font-bold text-[#19382B]">
                    {!isNaN(biomassEst) ? biomassEst.toFixed(2) : "0.00"} kg
                  </span>
                </div>
              </div>

              {/* Deskripsi & Peta Lokasi Real Laporan Warga */}
              <div className="space-y-3 text-xs text-[#111111]">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#111111]/50 flex items-center gap-1.5">
                    <Info weight="bold" className="w-3.5 h-3.5 text-[#19382B]" />
                    Deskripsi laporan warga
                  </span>
                  <p className="bg-[#f8f9f5] border border-black/5 p-3 rounded-xl leading-relaxed text-[#111111]/80 font-normal">
                    {report.description || "Tidak ada deskripsi detail tambahan."}
                  </p>
                </div>

                {/* Peta Interaktif Leaflet Titik Laporan Warga */}
                <ModalInteractiveMap report={report} addressName={addressName} />
              </div>
            </>
          );
        })()}

        {/* Status Klaim / Tombol Klaim Kayu */}
        {isSoldOut ? (
          <div className="bg-[#ecefe6] border border-black/5 rounded-2xl p-4 text-center space-y-1">
            <span className="text-xs font-bold text-[#19382B] flex items-center justify-center gap-1.5">
              <Storefront weight="duotone" className="w-4 h-4 text-[#19382B]" />
              Kayu telah diklaim oleh UMKM:
            </span>
            <p className="text-sm font-bold text-[#111111]">
              {report.claimed_by_name}
            </p>
          </div>
        ) : isCompleted && onClaim ? (
          <button
            onClick={() => onClaim(report)}
            disabled={isClaiming}
            className="w-full bg-[#19382B] hover:bg-[#234A39] text-white font-bold py-3.5 px-4 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <HandPalm weight="bold" className="w-4 h-4" />
            <span>{isClaiming ? "Memproses klaim..." : "Klaim kayu ini sekarang"}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
