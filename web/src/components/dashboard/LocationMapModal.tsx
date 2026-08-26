"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  X,
  Check,
  CircleNotch,
  Crosshair,
  House,
} from "@phosphor-icons/react";

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onSelectLocation: (lat: number, lng: number, address: string) => void;
}

export const LocationMapModal = ({
  isOpen,
  onClose,
  initialLat = -6.9932,
  initialLng = 110.4203,
  onSelectLocation,
}: LocationMapModalProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  const [selectedLat, setSelectedLat] = useState<number>(initialLat);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng);
  const [address, setAddress] = useState<string>("Memuat alamat lokasi...");
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // Reverse Geocoding using Nominatim (OpenStreetMap)
  const fetchAddress = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "Accept-Language": "id,en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`Lokasi (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
        }
      } else {
        setAddress(`Lokasi (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
      }
    } catch (err) {
      console.warn("[WARN] Reverse geocoding failed:", err);
      setAddress(`Lokasi (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Toggle body modal-open class to hide mobile header navbar completely when map modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  // Synchronize state and map view whenever modal opens with updated initial location (from auto GPS detection)
  useEffect(() => {
    if (isOpen && initialLat && initialLng) {
      setSelectedLat(initialLat);
      setSelectedLng(initialLng);
      fetchAddress(initialLat, initialLng);
    }
  }, [isOpen, initialLat, initialLng]);

  // Invalidate Leaflet map size after Framer Motion modal animation finishes
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        const targetLat = selectedLat || initialLat;
        const targetLng = selectedLng || initialLng;
        if (targetLat && targetLng) {
          mapInstanceRef.current.setView([targetLat, targetLng], 16);
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([targetLat, targetLng]);
          }
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, selectedLat, selectedLng, initialLat, initialLng]);

  // Initialize Leaflet Map dynamically on client side
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current) return;

      const currentLat = selectedLat || initialLat;
      const currentLng = selectedLng || initialLng;

      // Custom Pin Marker Icon (LaporPohon Branding)
      const customPinIcon = L.divIcon({
        className: "custom-laporpohon-pin",
        html: `<div style="background-color:#19382B; color:#88d937; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 16px rgba(0,0,0,0.35); border:2.5px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M128,16a88.1,88.1,0,0,0-88,88c0,75.3,80,132.17,83.41,134.55a8,8,0,0,0,9.18,0C136,236.17,216,179.3,216,104A88.1,88.1,0,0,0,128,16Zm0,112a24,24,0,1,1,24-24A24,24,0,0,1,128,128Z"></path></svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Always clean up any existing stale map instance before creating a new map
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore cleanup error
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([currentLat, currentLng], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const latlng = e.target.getLatLng();
        const newLat = parseFloat(latlng.lat.toFixed(6));
        const newLng = parseFloat(latlng.lng.toFixed(6));
        setSelectedLat(newLat);
        setSelectedLng(newLng);
        fetchAddress(newLat, newLng);
      });

      map.on("click", (e: any) => {
        const newLat = parseFloat(e.latlng.lat.toFixed(6));
        const newLng = parseFloat(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        setSelectedLat(newLat);
        setSelectedLng(newLng);
        fetchAddress(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      fetchAddress(currentLat, currentLng);

      // Force size recalculation after modal animation finishes
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    };

    initMap();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Clean up Leaflet map instance whenever modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    }
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // GPS Location button inside map
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      alert("GPS tidak didukung oleh browser Anda.");
      return;
    }
    setIsLocatingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        setSelectedLat(lat);
        setSelectedLng(lng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }

        fetchAddress(lat, lng);
        setIsLocatingGPS(false);
      },
      (err) => {
        console.error("[ERROR] GPS detect failed:", err.message);
        alert("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
        setIsLocatingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation(selectedLat, selectedLng, address);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-black/10 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#19382B] text-[#88d937] flex items-center justify-center shadow-xs">
                  <MapPin size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#111111] leading-tight">
                    Pilih Lokasi di Peta Interaktif
                  </h3>
                  <p className="text-[11px] text-[#111111]/60">
                    Geser pin atau ketuk titik di peta untuk menentukan posisi pohon
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111111] flex items-center justify-center transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Map Container Viewport */}
            <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] w-full bg-gray-100">
              <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[380px] z-10" />

              {/* Floating GPS Target Button on Map */}
              <button
                type="button"
                onClick={handleGPSDetect}
                disabled={isLocatingGPS}
                className="absolute bottom-4 right-4 z-[20] bg-white text-[#19382B] hover:bg-[#ecefe6] border border-black/10 px-3.5 py-2.5 rounded-full shadow-md text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
              >
                {isLocatingGPS ? (
                  <>
                    <CircleNotch size={16} className="animate-spin text-[#19382B]" />
                    <span>Mendeteksi GPS...</span>
                  </>
                ) : (
                  <>
                    <Crosshair size={16} weight="bold" className="text-[#19382B]" />
                    <span>Gunakan Lokasi GPS Saya</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Footer: Address Preview & Confirm Action */}
            <div className="p-5 sm:p-6 bg-[#ecefe6]/50 border-t border-gray-100 space-y-4 shrink-0">
              <div className="bg-white border border-black/8 p-3.5 rounded-2xl space-y-1 shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
                  <span className="flex items-center gap-1">
                    <House size={13} weight="fill" className="text-[#19382B]" />
                    Alamat Terdeteksi
                  </span>
                  <span>
                    Lat: {selectedLat.toFixed(6)} | Lng: {selectedLng.toFixed(6)}
                  </span>
                </div>
                <p className="text-xs text-[#111111] font-semibold leading-relaxed line-clamp-2">
                  {isGeocoding ? (
                    <span className="text-gray-400 animate-pulse">Mengidentifikasi alamat jalan...</span>
                  ) : (
                    address
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/10 bg-white text-[#111111] hover:bg-gray-100 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-[2] py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Check size={16} weight="bold" />
                  <span>Konfirmasi Lokasi Ini</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
