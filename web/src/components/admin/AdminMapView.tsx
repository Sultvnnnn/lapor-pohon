"use client";

import { useEffect, useRef } from "react";
import { Tree, ShieldWarning, MapPin } from "@phosphor-icons/react";
import { parseCoordinates } from "./AdminDashboardClient";

type ReportItem = {
  id: string;
  latitude: number;
  longitude: number;
  location?: any;
  risk_score: number;
  canopy_volume: number;
  image_url?: string;
  status: string;
  created_at: string;
  description?: string;
};

interface AdminMapViewProps {
  reports: ReportItem[];
  onSelectReport?: (report: ReportItem) => void;
}

export const AdminMapView = ({ reports, onSelectReport }: AdminMapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      // Parse coordinates for all reports
      const mappedReports = reports
        .map((r) => {
          const coords = parseCoordinates(r);
          return coords ? { ...r, latitude: coords.lat, longitude: coords.lng } : null;
        })
        .filter((r): r is ReportItem => r !== null);

      let defaultLat = -6.9932;
      let defaultLng = 110.4203;

      if (mappedReports.length > 0) {
        defaultLat = mappedReports[0].latitude;
        defaultLng = mappedReports[0].longitude;
      }

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
        }).setView([defaultLat, defaultLng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add marker per report
      mappedReports.forEach((report) => {
        const rawRisk = typeof report.risk_score === "number" ? report.risk_score : 0;
        const risk = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
        
        let pinBg = "#10B981"; // Green (Low Risk)
        if (risk > 60) {
          pinBg = "#EF4444"; // Red (High Risk)
        } else if (risk >= 30) {
          pinBg = "#F59E0B"; // Yellow (Medium Risk)
        }

        const customIcon = L.divIcon({
          className: "custom-admin-pin",
          html: `<div style="background-color:${pinBg}; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.3); border:2px solid white; font-weight:bold; font-size:11px;">
            ${risk}
          </div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        const marker = L.marker([report.latitude, report.longitude], {
          icon: customIcon,
        }).addTo(map);

        const safeLat = typeof report.latitude === "number" ? report.latitude.toFixed(4) : "-";
        const safeLng = typeof report.longitude === "number" ? report.longitude.toFixed(4) : "-";

        const popupContent = `
          <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
            ${report.image_url ? `<img src="${report.image_url}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:6px;" />` : ''}
            <div style="font-weight:bold; font-size:12px; margin-bottom:4px; color:#111;">
              Risiko: <span style="color:${pinBg}">${risk}/100</span>
            </div>
            <div style="font-size:11px; color:#555; margin-bottom:4px;">
              Volume: ${report.canopy_volume || 0} m³
            </div>
            <div style="font-size:10px; color:#888;">
              GPS: ${safeLat}, ${safeLng}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectReport) {
          marker.on("click", () => onSelectReport(report));
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [reports]);

  // Clean up Leaflet instance when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-black/10 shadow-xs bg-gray-100 font-sans">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-[20] bg-white/90 backdrop-blur-md border border-black/10 rounded-2xl p-3 shadow-md space-y-1.5 text-xs font-semibold text-[#111111]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span>Risiko Tinggi (&gt; 60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span>Risiko Sedang (30 - 60)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <span>Risiko Rendah (&lt; 30)</span>
        </div>
      </div>
    </div>
  );
};
