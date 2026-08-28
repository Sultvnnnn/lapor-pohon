"use client";

import { useEffect, useRef, useState } from "react";
import { parseCoordinates } from "../admin/AdminDashboardClient";

export type ReportItem = {
  id: string;
  latitude: number;
  longitude: number;
  location?: any;
  risk_score: number;
  canopy_volume: number;
  biomass_estimate?: number;
  image_url?: string;
  status: string;
  created_at: string;
  scheduled_at?: string;
  admin_note?: string;
  proof_image_url?: string;
  description?: string;
  claimed_by_name?: string;
  tree_type?: string;
  bounding_box?: any;
  bounding_boxes?: any;
};

interface SemarangRiskMapProps {
  reports: ReportItem[];
  onSelectReport?: (report: ReportItem) => void;
  radiusKm?: number | null; // null = all, 0.5, 1, 2
  userLocation?: { lat: number; lng: number } | null;
}

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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
}

export const SemarangRiskMap = ({
  reports,
  onSelectReport,
  radiusKm = null,
  userLocation = null,
}: SemarangRiskMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "kritis" | "terjadwal" | "selesai">("all");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      // Filter & parse coordinates for all reports
      let mappedReports = reports
        .map((r) => {
          const coords = parseCoordinates(r);
          return coords ? { ...r, latitude: coords.lat, longitude: coords.lng } : null;
        })
        .filter((r): r is ReportItem => r !== null);

      // Apply status filter
      if (activeFilter === "kritis") {
        mappedReports = mappedReports.filter(
          (r) => r.status === "pending" || r.status === "verified" || r.risk_score >= 60
        );
      } else if (activeFilter === "terjadwal") {
        mappedReports = mappedReports.filter(
          (r) => r.status === "scheduled" || r.status === "in_progress" || !!r.scheduled_at
        );
      } else if (activeFilter === "selesai") {
        mappedReports = mappedReports.filter(
          (r) => r.status === "completed" || r.status === "resolved"
        );
      }

      // Apply radius filter if userLocation is set
      if (radiusKm && userLocation) {
        mappedReports = mappedReports.filter(
          (r) => getDistanceKm(userLocation.lat, userLocation.lng, r.latitude, r.longitude) <= radiusKm
        );
      }

      // Dynamic Default Center: User Location -> First Report -> Jakarta Fallback (-6.2088, 106.8456)
      let defaultLat = -6.2088;
      let defaultLng = 106.8456;

      if (userLocation) {
        defaultLat = userLocation.lat;
        defaultLng = userLocation.lng;
      } else if (mappedReports.length > 0) {
        defaultLat = mappedReports[0].latitude;
        defaultLng = mappedReports[0].longitude;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([defaultLat, defaultLng], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers & circles
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Fit bounds automatically if reports exist
      if (mappedReports.length > 0) {
        const bounds = L.latLngBounds(mappedReports.map((r) => [r.latitude, r.longitude]));
        if (userLocation) {
          bounds.extend([userLocation.lat, userLocation.lng]);
        }
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 13);
      }

      // Add user location marker & radius circle if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `<div style="background-color:#88d937; color:#111111; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.15); border:3px solid #19382B; font-weight:bold; font-size:11px;">
            UMKM
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<div style='font-family:sans-serif; font-weight:bold; font-size:12px; color:#111111;'>Posisi Usaha UMKM Anda</div>");

        if (radiusKm) {
          L.circle([userLocation.lat, userLocation.lng], {
            color: "#19382B",
            fillColor: "#88d937",
            fillOpacity: 0.15,
            radius: radiusKm * 1000,
          }).addTo(map);
        }
      }

      // Add markers per report
      mappedReports.forEach((report) => {
        const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
        const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);

        let pinBg = "#19382B"; // Brand Dark Green (Completed/Low Risk)
        let pinText = `${risk}%`;

        if (report.claimed_by_name) {
          pinBg = "#88d937";
          pinText = "KLAIM";
        } else if (report.status === "completed" || report.status === "resolved") {
          pinBg = "#19382B";
          pinText = "✓";
        } else if (report.status === "scheduled" || report.status === "in_progress" || report.scheduled_at) {
          pinBg = "#F59E0B"; // Amber (Scheduled Petugas Action)
          pinText = "AKSI";
        } else if (risk >= 60) {
          pinBg = "#EF4444"; // Red (High Risk Critical)
          pinText = `${risk}%`;
        } else if (risk >= 30) {
          pinBg = "#F59E0B";
          pinText = `${risk}%`;
        }

        const customIcon = L.divIcon({
          className: "custom-umkm-pin",
          html: `<div style="background-color:${pinBg}; color:${report.claimed_by_name ? '#111111' : 'white'}; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.15); border:2.5px solid white; font-weight:bold; font-size:10px;">
            ${pinText}
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([report.latitude, report.longitude], {
          icon: customIcon,
        }).addTo(map);

        const statusLabel = report.claimed_by_name
          ? `Kayu Di-klaim oleh ${report.claimed_by_name}`
          : report.status === "completed"
          ? "Selesai Dipangkas (Katalog Kayu Available)"
          : report.status === "scheduled"
          ? "Terjadwal Penindakan Petugas"
          : risk >= 60
          ? "Kritis (Risiko Tinggi)"
          : "Dalam Pemantauan";

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; max-width: 210px; color:#111111;">
            ${report.proof_image_url || report.image_url ? `<img src="${report.proof_image_url || report.image_url}" style="width:100%; height:105px; object-fit:cover; border-radius:10px; margin-bottom:8px;" />` : ''}
            <div style="font-weight:bold; font-size:12px; margin-bottom:4px; color:#19382B;">
              ${statusLabel}
            </div>
            <div style="font-size:11px; color:#555; margin-bottom:6px;">
              ${report.tree_type ? `Pohon: <b>${report.tree_type}</b> | ` : ''}Kanopi: ${report.canopy_volume || 0} m³
            </div>
            <button id="view-detail-${report.id}" style="width:100%; background:#19382B; color:white; font-weight:bold; border:none; padding:6px; border-radius:8px; font-size:11px; cursor:pointer;">
              Lihat Detail & Klaim &rarr;
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const detailBtn = document.getElementById(`view-detail-${report.id}`);
          if (detailBtn && onSelectReport) {
            detailBtn.onclick = () => {
              onSelectReport(report);
            };
          }
        });

        if (onSelectReport) {
          marker.on("click", () => onSelectReport(report));
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [reports, activeFilter, radiusKm, userLocation]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-[2rem] overflow-hidden border border-black/10 shadow-xs bg-white font-sans">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Filter Quick Buttons Overlay (Top Left) */}
      <div className="absolute top-4 left-4 z-[20] flex flex-wrap gap-2 max-w-[280px] sm:max-w-none">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full backdrop-blur-md border transition-all ${
            activeFilter === "all"
              ? "bg-[#19382B] text-white border-[#19382B] shadow-sm"
              : "bg-white/90 text-[#111111]/70 border-black/10 hover:bg-[#ecefe6]"
          }`}
        >
          Semua Lokasi ({reports.length})
        </button>

        <button
          onClick={() => setActiveFilter("kritis")}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full backdrop-blur-md border transition-all ${
            activeFilter === "kritis"
              ? "bg-red-600 text-white border-red-600 shadow-sm"
              : "bg-white/90 text-red-700 border-black/10 hover:bg-[#ecefe6]"
          }`}
        >
          Kritis
        </button>

        <button
          onClick={() => setActiveFilter("terjadwal")}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full backdrop-blur-md border transition-all ${
            activeFilter === "terjadwal"
              ? "bg-[#88d937] text-[#111111] border-[#88d937] shadow-sm"
              : "bg-white/90 text-[#19382B] border-black/10 hover:bg-[#ecefe6]"
          }`}
        >
          Terjadwal Petugas
        </button>

        <button
          onClick={() => setActiveFilter("selesai")}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-full backdrop-blur-md border transition-all ${
            activeFilter === "selesai"
              ? "bg-[#19382B] text-white border-[#19382B] shadow-sm"
              : "bg-white/90 text-emerald-700 border-black/10 hover:bg-[#ecefe6]"
          }`}
        >
          Katalog Kayu
        </button>
      </div>

      {/* Legend Overlay (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[20] bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl p-3 shadow-md space-y-1 text-[11px] font-semibold text-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
          <span>Risiko Tinggi (Kritis)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>Terjadwal Eksekusi Petugas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#19382B] shrink-0" />
          <span>Katalog Kayu Siap Klaim</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#88d937] shrink-0" />
          <span>Ter-klaim / Sold Out</span>
        </div>
      </div>
    </div>
  );
};
