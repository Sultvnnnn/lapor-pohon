"use client";

import { useState, useRef, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Sparkle,
  CircleNotch,
  CheckCircle,
  Tree,
  FileText,
  ShieldWarning,
  Camera,
  ArrowCounterClockwise,
  WarningCircle,
  DeviceMobile,
  Clock,
  ChartLineUp,
  Eye,
  X,
  Trash,
  MapTrifold,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { reportSchema, ReportFormValues } from "@/lib/validations/reportSchema";
import { uploadReportImage } from "@/lib/storageUtils";
import { createClient } from "@/lib/supabase/client";
import { TreeImageWithBoundingBox } from "@/components/TreeImageWithBoundingBox";
import { LocationMapModal } from "@/components/dashboard/LocationMapModal";
import { getRiskLevel, riskLevelConfig } from "@/lib/riskLevel";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
};

type SubmittedReport = {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  riskScore: number;
  canopyVolume: number;
  biomassEstimate: number;
  detections: number;
};

type ReportHistoryItem = {
  id: string;
  created_at: string;
  image_url: string;
  description: string;
  location: any;
  risk_score: number;
  canopy_volume: number;
  biomass_estimate: number;
  bounding_box: BoundingBox[] | null;
  status: "pending" | "in_progress" | "resolved" | string;
};

const formatLocationDisplay = (location: any): string => {
  if (!location) return "Lokasi terdeteksi";
  if (typeof location === "string") {
    return location.replace("POINT(", "").replace(")", "").trim();
  }
  if (typeof location === "object") {
    if (Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
      return `${location.coordinates[0]}, ${location.coordinates[1]}`;
    }
    if (location.x !== undefined && location.y !== undefined) {
      return `${location.x}, ${location.y}`;
    }
    if (location.longitude !== undefined && location.latitude !== undefined) {
      return `${location.longitude}, ${location.latitude}`;
    }
    return JSON.stringify(location);
  }
  return String(location);
};

type SubmitStep = "idle" | "uploading" | "analyzing" | "saving";
type TabMode = "scan" | "progress";

const submitStepLabels: Record<SubmitStep, string> = {
  idle: "",
  uploading: "Mengunggah foto laporan ke cloud...",
  analyzing: "Menganalisis bahaya & volume dengan AI YOLOv8 (Memuat server AI)...",
  saving: "Menyimpan data laporan ke database...",
};

export const getReportStatusConfig = (statusRaw?: string) => {
  const s = (statusRaw || "pending").toString().toLowerCase().trim();

  // 1. Pending variations
  if (s === "pending" || s === "menunggu" || s === "draft" || s === "unverified") {
    return {
      label: "⏳ Menunggu Verifikasi",
      bg: "bg-amber-500/10",
      text: "text-amber-700",
      border: "border-amber-500/20",
      isPending: true,
    };
  }

  // 2. Verified variations
  if (
    s === "verified" ||
    s === "terverifikasi" ||
    s === "verifikasi" ||
    s === "diverifikasi" ||
    s === "approved" ||
    s === "valid" ||
    s === "verified_dlh" ||
    s.includes("verif") ||
    s.includes("ok") ||
    s.includes("acc")
  ) {
    return {
      label: "✅ Terverifikasi DLH",
      bg: "bg-emerald-500/10",
      text: "text-emerald-700",
      border: "border-emerald-500/20",
      isPending: false,
    };
  }

  // 3. In Progress variations
  if (
    s === "in_progress" ||
    s === "progress" ||
    s === "proses" ||
    s === "diproses" ||
    s === "tindak_lanjut" ||
    s === "penanganan" ||
    s.includes("proses")
  ) {
    return {
      label: "🚜 Dalam Penanganan DLH",
      bg: "bg-blue-500/10",
      text: "text-blue-700",
      border: "border-blue-500/20",
      isPending: false,
    };
  }

  // 4. Resolved / Completed variations
  if (
    s === "resolved" ||
    s === "completed" ||
    s === "selesai" ||
    s === "sirkular" ||
    s.includes("selesai")
  ) {
    return {
      label: "♻️ Pemanfaatan Sirkular Selesai",
      bg: "bg-[#88d937]/20",
      text: "text-[#19382B]",
      border: "border-[#88d937]/40",
      isPending: false,
    };
  }

  // Fallback for custom status: Display actual status text dynamically
  return {
    label: `✅ ${statusRaw}`,
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    border: "border-emerald-500/20",
    isPending: false,
  };
};

type ReportFormProps = {
  onReportSubmitted?: () => void;
};

export const ReportForm = ({ onReportSubmitted }: ReportFormProps = {}) => {
  const [activeTab, setActiveTab] = useState<TabMode>("scan");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string>("");

  // Desktop Detection State
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // User Reports History
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ReportHistoryItem | null>(null);
  // Delete Report States
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<ReportHistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Camera Live Shoot States & Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera Zoom Controls States
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(5);
  const [zoomStep, setZoomStep] = useState<number>(0.5);
  const [hasHardwareZoom, setHasHardwareZoom] = useState<boolean>(false);

  const handleZoom = async (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, minZoom), maxZoom);
    const rounded = Math.round(clamped * 10) / 10;
    setZoomLevel(rounded);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === "function") {
        const caps = track.getCapabilities() as any;
        if (caps?.zoom) {
          try {
            await track.applyConstraints({
              advanced: [{ zoom: rounded }] as any,
            });
          } catch (e) {
            console.warn("[WARN] Hardware zoom applyConstraints exception:", e);
          }
        }
      }
    }
  };

  const handleZoomIn = () => handleZoom(zoomLevel + zoomStep);
  const handleZoomOut = () => handleZoom(zoomLevel - zoomStep);

  const supabaseClient = createClient();

  const formLogic = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      description: "",
    },
  });

  // Permanent Delete Handler
  const handleDeleteReport = async () => {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      const { data, error } = await supabaseClient
        .from("reports")
        .delete()
        .eq("id", deleteConfirmItem.id)
        .select();

      if (error) {
        console.error("[ERROR] Delete report failed:", error.message);
        alert(`Gagal membatalkan laporan: ${error.message}`);
      } else if (!data || data.length === 0) {
        console.warn("[WARN] Supabase deleted 0 rows. Check RLS DELETE policy.");
        alert(
          "Data tidak terhapus di database Supabase (0 baris terhapus).\n\nHal ini disebabkan karena aturan Row Level Security (RLS) di Supabase belum memiliki izin DELETE.\n\nSilakan jalankan SQL Policy DELETE pada Supabase SQL Editor."
        );
      } else {
        // Data successfully deleted permanently from Supabase
        setReportHistory((prev) =>
          prev.filter((item) => item.id !== deleteConfirmItem.id)
        );
        setDeleteConfirmItem(null);
        onReportSubmitted?.();
      }
    } catch (err) {
      console.error("[ERROR] Delete report exception:", err);
      alert("Terjadi kesalahan sistem saat membatalkan laporan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Detect Desktop Device vs Mobile / Tablet
  useEffect(() => {
    setIsMounted(true);
    const checkDevice = () => {
      const ua = navigator.userAgent;
      // 1. Standard Mobile & Tablet User Agent Regex
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          ua
        );

      // 2. iPadOS 13+ detection (reports as Macintosh, but has touch points)
      const isIPadOS = ua.includes("Macintosh") && navigator.maxTouchPoints > 0;

      // 3. UserAgentData API (Modern Chromium Browsers)
      const isMobileData = (navigator as any).userAgentData?.mobile ?? false;

      // Device is considered Mobile / Tablet if any of the above conditions are met
      const isMobileOrTablet = isMobileUA || isIPadOS || isMobileData;

      setIsDesktop(!isMobileOrTablet);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch Report History for Progress Tab (Laporan Saya)
  const fetchReportHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user?.id) {
        setReportHistory([]);
        setIsLoadingHistory(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReportHistory(data as ReportHistoryItem[]);
      } else if (error) {
        console.error("[ERROR] Fetching report history failed:", error.message);
        setReportHistory([]);
      }
    } catch (err) {
      console.error("[ERROR] Fetching report history failed:", err);
      setReportHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchReportHistory();
  }, []);

  useEffect(() => {
    if (activeTab === "progress") {
      fetchReportHistory();
    }
  }, [activeTab]);

  // Start Camera Stream (Works on Desktop & Mobile)
  const startCamera = async () => {
    if (isDesktop) {
      stopCamera();
      return;
    }
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Safety check: Abort and stop stream if device is desktop or tab changed while getUserMedia was resolving
      if (isDesktop || activeTab !== "scan") {
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraActive(false);
        return;
      }

      streamRef.current = stream;

      // Check hardware camera zoom capabilities
      const track = stream.getVideoTracks()[0];
      if (track && typeof track.getCapabilities === "function") {
        const caps = track.getCapabilities() as any;
        if (caps?.zoom) {
          setHasHardwareZoom(true);
          if (caps.zoom.min) setMinZoom(caps.zoom.min);
          if (caps.zoom.max) setMaxZoom(Math.min(caps.zoom.max, 10));
          if (caps.zoom.step) setZoomStep(caps.zoom.step);
        } else {
          setHasHardwareZoom(false);
          setMinZoom(1);
          setMaxZoom(5);
          setZoomStep(0.5);
        }
      }
      setZoomLevel(1);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== "AbortError") {
            console.warn("[WARN] Camera video play exception:", playErr);
          }
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("[ERROR] Accessing camera failed:", err);
      setCameraError(
        "Kamera peramban tidak dapat diakses. Pastikan izin kamera telah diaktifkan."
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Manage Camera Life Cycle (Only for Mobile devices)
  useEffect(() => {
    if (!isMounted) return;

    if (activeTab === "scan" && !isDesktop && !imagePreview && !submittedReport) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, isDesktop, imagePreview, submittedReport, isMounted]);

  // Auto-get Location via Device GPS & Reverse Geocode
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Fitur lokasi GPS tidak didukung oleh peramban kamu.");
      return;
    }

    setIsGettingLocation(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        formLogic.setValue("latitude", lat as any);
        formLogic.setValue("longitude", lng as any);
        formLogic.trigger(["latitude", "longitude"]);

        // Perform reverse geocoding via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { "Accept-Language": "id,en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) {
              setDetectedAddress(data.display_name);
            } else {
              setDetectedAddress(`Lokasi GPS (${lat}, ${lng})`);
            }
          }
        } catch (err) {
          console.warn("[WARN] Reverse geocode failed:", err);
          setDetectedAddress(`Lokasi GPS (${lat}, ${lng})`);
        }

        setIsGettingLocation(false);
        setLocationSuccess(true);
      },
      (error) => {
        console.error("[ERROR] Geolocation error:", error.message);
        alert(
          "Gagal mengambil lokasi GPS. Silakan pastikan izin lokasi diaktifkan di HP kamu."
        );
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handler for Location selection from Interactive Leaflet Map Modal
  const handleLocationSelectedFromMap = (lat: number, lng: number, addressStr: string) => {
    formLogic.setValue("latitude", lat as any);
    formLogic.setValue("longitude", lng as any);
    formLogic.trigger(["latitude", "longitude"]);
    setDetectedAddress(addressStr);
    setLocationSuccess(true);
  };

  // Capture Photo from Camera Frame & Auto Get GPS Location
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (zoomLevel > 1 && !hasHardwareZoom) {
        const vWidth = video.videoWidth || canvas.width;
        const vHeight = video.videoHeight || canvas.height;
        const sw = vWidth / zoomLevel;
        const sh = vHeight / zoomLevel;
        const sx = (vWidth - sw) / 2;
        const sy = (vHeight - sh) / 2;
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImagePreview(dataUrl);

      // Convert Canvas to Blob -> File
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `pohon-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            setCapturedFile(file);
            formLogic.setValue("image", file as any);
            formLogic.trigger("image");
          }
          setIsCapturing(false);
          stopCamera();
          // Auto record GPS location upon capture
          handleGetLocation();
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleRetakePhoto = () => {
    setImagePreview(null);
    setCapturedFile(null);
    formLogic.setValue("image", undefined as any);
    if (activeTab === "scan" && !isDesktop) {
      startCamera();
    }
  };

  const submitHandler: SubmitHandler<ReportFormValues> = async (data) => {
    if (isDesktop) {
      alert("Pelaporan pohon rawan tumbang hanya dapat dilakukan melalui smartphone (HP).");
      return;
    }

    let fileToUpload: File | null = capturedFile;
    if (!fileToUpload && data.image) {
      if (typeof window !== "undefined" && data.image instanceof File) {
        fileToUpload = data.image;
      } else if (
        typeof window !== "undefined" &&
        data.image instanceof FileList &&
        data.image.length > 0
      ) {
        fileToUpload = data.image[0];
      } else if (Array.isArray(data.image) && data.image.length > 0) {
        fileToUpload = data.image[0];
      }
    }

    if (!fileToUpload) {
      alert("Foto kondisi pohon belum dipotret. Silakan klik 'Potret Pohon Sekarang' atau 'Pakai Foto Sampel Demo'.");
      return;
    }

    setIsSubmitting(true);
    setSubmittedReport(null);

    try {
      setSubmitStep("uploading");
      let imageUrl = imagePreview || "";
      try {
        imageUrl = await uploadReportImage(fileToUpload);
      } catch (err) {
        console.warn("[WARN] Storage upload failed, falling back to preview URL:", err);
        if (!imageUrl) {
          imageUrl = URL.createObjectURL(fileToUpload);
        }
      }

      setSubmitStep("analyzing");
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      const token = session?.access_token || "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://lapor-pohon.onrender.com";

      let aiData: any = null;
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        // Allow up to 45 seconds for Render PyTorch YOLOv8 AI inference
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const aiResponse = await fetch(`${apiUrl}/api/analyze`, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            image_url: imageUrl,
            latitude: data.latitude,
            longitude: data.longitude,
            description: data.description,
          }),
        });
        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          aiData = await aiResponse.json();
        } else {
          console.warn(`[WARN] Backend AI returned status ${aiResponse.status}, setting zero risk fallback.`);
        }
      } catch (aiErr) {
        console.warn("[WARN] Backend AI endpoint unreachable or timed out, setting zero risk fallback:", aiErr);
      }

      if (!aiData) {
        aiData = {
          risk_score: 0.0,
          canopy_volume: 0.0,
          biomass_estimate: 0.0,
          bounding_boxes: [],
          detections: 0,
          status: "no_tree_detected",
        };
      }

      setSubmitStep("saving");
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      const basePayload: any = {
        image_url: imageUrl,
        description: data.description || "Laporan Pohon Rawan Tumbang",
        location: `POINT(${data.longitude} ${data.latitude})`,
        risk_score: aiData.risk_score || 0,
        canopy_volume: aiData.canopy_volume || 0,
        biomass_estimate: aiData.biomass_estimate || 0,
        bounding_box: aiData.bounding_boxes || [],
        status: "pending",
      };

      if (user?.id) {
        basePayload.user_id = user.id;
      }

      const { error: dbError } = await supabaseClient
        .from("reports")
        .insert(basePayload);

      if (dbError) {
        console.error(`[ERROR] DB Insert error: ${dbError.message}`);

        if (dbError.message.includes("user_id")) {
          delete basePayload.user_id;
          const { error: retryError } = await supabaseClient
            .from("reports")
            .insert(basePayload);

          if (retryError) {
            console.error(`[ERROR] Retry DB Insert error: ${retryError.message}`);
            alert(`[Gagal Simpan Database] ${retryError.message}`);
          }
        } else {
          alert(`[Gagal Simpan Database] ${dbError.message}`);
        }
      }

      setSubmittedReport({
        imageUrl,
        boundingBoxes: aiData.bounding_boxes || [],
        riskScore: aiData.risk_score || 0,
        canopyVolume: aiData.canopy_volume || 0,
        biomassEstimate: aiData.biomass_estimate || 0,
        detections: aiData.detections || 0,
      });

      formLogic.reset();
      setCapturedFile(null);
      setLocationSuccess(false);
      // Automatically refresh history for Tab 2 and parent Dashboard count
      fetchReportHistory();
      onReportSubmitted?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak terduga pada sistem.";
      console.error(`[ERROR] Submit report error: ${errorMessage}`);
      alert(`[Info] Memproses laporan: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setSubmitStep("idle");
    }
  };

  const onInvalidHandler = (errors: any) => {
    console.warn("[WARN] Validation errors:", errors);
    if (errors.image) {
      alert("Foto kondisi pohon belum dipotret. Silakan klik tombol 'Potret Pohon Sekarang'.");
    } else if (errors.latitude || errors.longitude) {
      alert("Koordinat lokasi GPS belum terdeteksi. Silakan klik 'Deteksi Lokasi Otomatis'.");
    } else {
      alert("Mohon lengkapi data lokasi dan foto sebelum mengirim laporan.");
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 font-sans">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Container Utama Formulir & Tab ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/5 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 pb-3.5 sm:pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-[#19382B] text-[#e3f4d7] flex items-center justify-center shadow-xs shrink-0">
            <Tree size={22} weight="fill" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              Pemindai AI & LaporPohon
            </h2>
            <p className="text-[11px] sm:text-xs text-[#111111]/60">
              Foto pohon rawan di sekitarmu atau cek status laporanmu di sini.
            </p>
          </div>
        </div>

        {/* ── Tab Switcher Berdampingan (Ala Login / Register) ── */}
        <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("scan");
              if (imagePreview) setImagePreview(null);
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === "scan"
              ? "bg-[#19382B] text-white shadow-xs"
              : "text-[#111111]/60 hover:text-[#111111]"
              }`}
          >
            <Camera size={16} weight="bold" />
            <span>Kamera</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("progress");
              stopCamera();
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === "progress"
              ? "bg-[#19382B] text-white shadow-xs"
              : "text-[#111111]/60 hover:text-[#111111]"
              }`}
          >
            <ChartLineUp size={16} weight="bold" />
            <span>Laporan Saya</span>
          </button>
        </div>

        {/* ── TAB 1: PEMINDAIAN KAMERA LIVE ── */}
        {activeTab === "scan" && (
          submittedReport ? (
            /* Result AI Inspection Card */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pt-1"
            >
              {/* Header Hasil */}
              <div className="bg-[#19382B] text-white rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, #3E6B54 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#88d937] text-[#19382B] flex items-center justify-center shadow-xs">
                      <CheckCircle size={22} weight="fill" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                        Laporan Berhasil Dianalisis!
                      </h3>
                      <p className="text-xs text-white/80">
                        Hasil deteksi otomatis AI YOLOv8 & estimasi kayu sirkular
                      </p>
                    </div>
                  </div>

                  {/* Risk Badge */}
                  {(() => {
                    const riskLevel = getRiskLevel(submittedReport.riskScore);
                    const config = riskLevelConfig[riskLevel];
                    const displayScore =
                      submittedReport.riskScore <= 1
                        ? Math.round(submittedReport.riskScore * 100)
                        : Math.round(submittedReport.riskScore);
                    return (
                      <div
                        className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs shadow-xs ${config.bgColor} ${config.textColor}`}
                      >
                        <ShieldWarning size={16} weight="fill" />
                        <span>{config.label} ({displayScore}/100)</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Case 0 Trees Detected Warning */}
              {submittedReport.detections === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-center space-y-3">
                  <WarningCircle size={36} weight="fill" className="text-amber-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#111111]">
                      Objek Pohon Tidak Terdeteksi dalam Foto
                    </h4>
                    <p className="text-xs text-[#111111]/70 leading-relaxed max-w-md mx-auto">
                      Sistem AI YOLOv8 tidak menemukan objek pohon rawan tumbang pada foto ini. Silakan pastikan tajuk dan batang pohon terlihat jelas dengan pencahayaan memadai.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedReport(null);
                      setImagePreview(null);
                      setCapturedFile(null);
                      startCamera();
                    }}
                    className="bg-[#19382B] text-[#e3f4d7] px-5 py-2.5 rounded-full text-xs font-bold shadow-xs hover:bg-[#234A39] transition-all"
                  >
                    Potret Ulang Foto Pohon
                  </button>
                </div>
              ) : (
                <>
                  {/* Bounding Box Image Visualizer */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#111111]/50">
                      Visualisasi Deteksi Objek ({submittedReport.detections} Objek Terdeteksi)
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-black/5 bg-[#ecefe6]/40 p-2">
                      <TreeImageWithBoundingBox
                        imageUrl={submittedReport.imageUrl}
                        boundingBoxes={submittedReport.boundingBoxes}
                      />
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#f8f9f5] border border-black/5 p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                        Skor Risiko AI
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#19382B]">
                        {submittedReport.riskScore <= 1
                          ? Math.round(submittedReport.riskScore * 100)
                          : Math.round(submittedReport.riskScore)}{" "}
                        <span className="text-xs font-normal text-[#111111]/50">/ 100</span>
                      </p>
                    </div>

                    <div className="bg-[#f8f9f5] border border-black/5 p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                        Estimasi Volume Kanopi
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#19382B]">
                        {submittedReport.canopyVolume} <span className="text-xs font-normal text-[#111111]/50">m³</span>
                      </p>
                    </div>

                    <div className="bg-[#f8f9f5] border border-black/5 p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                        Estimasi Biomassa Kayu
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#19382B]">
                        {submittedReport.biomassEstimate} <span className="text-xs font-normal text-[#111111]/50">kg</span>
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReport(null);
                    setImagePreview(null);
                    setCapturedFile(null);
                    startCamera();
                  }}
                  className="flex-1 bg-[#19382B] text-white hover:bg-[#234A39] py-3 rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Camera size={16} weight="bold" />
                  <span>Potret & Lapor Pohon Lain</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReport(null);
                    setImagePreview(null);
                    setCapturedFile(null);
                    setActiveTab("progress");
                  }}
                  className="flex-1 bg-[#ecefe6] text-[#19382B] hover:bg-[#e1e6d7] py-3 rounded-full text-xs font-bold transition-all border border-black/5 flex items-center justify-center gap-2"
                >
                  <ChartLineUp size={16} weight="bold" />
                  <span>Lihat Di Laporan Saya</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={formLogic.handleSubmit(submitHandler, onInvalidHandler)}
              className="space-y-5 sm:space-y-6"
            >
              {/* Case A: User Accesses from Desktop / Laptop (Notice Banner) */}
              {isDesktop ? (
                <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-[#19382B]/10 text-[#19382B] flex items-center justify-center mx-auto shadow-xs">
                    <DeviceMobile size={30} weight="fill" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-[#19382B] text-white px-3 py-1 rounded-full">
                      📱 Khusus Perangkat Mobile (HP)
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#111111]">
                      Fitur Kamera Pemindai Hanya Tersedia di Smartphone
                    </h3>
                    <p className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                      Untuk memastikan akurasi posisi GPS dan pengambilan foto kondisi pohon rawan tumbang secara langsung di lapangan, silakan buka aplikasi web ini melalui peramban ponsel (mobile browser) kamu.
                    </p>
                  </div>
                </div>
              ) : (
                /* Live Scanner Camera Viewfinder & Photo Capture (Mobile Only) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                      <Camera size={15} weight="bold" className="text-[#19382B]" />
                      Pemindaian Foto Pohon (Live Shoot) <span className="text-red-500">*</span>
                    </label>
                  </div>

                  {imagePreview ? (
                    /* Preview hasil potret dari kamera */
                    <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-black/10 max-h-80 flex flex-col items-center justify-center p-3">
                      <img
                        src={imagePreview}
                        alt="Hasil Potret Pohon"
                        className="max-h-72 object-contain rounded-xl shadow-xs"
                      />
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="flex items-center gap-1.5 bg-[#19382B] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs hover:bg-[#234A39] transition-all"
                        >
                          <ArrowCounterClockwise size={14} weight="bold" />
                          <span>Potret Ulang Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Jendela Bidik Kamera Live (Scanner Viewfinder) */
                    <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#19382B] min-h-[280px] sm:min-h-[340px] flex items-center justify-center shadow-md">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        className="w-full h-full object-cover min-h-[280px] sm:min-h-[340px] transition-transform duration-150 ease-out"
                        style={{
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: "center center",
                        }}
                      />

                      {/* Corner Target Reticles Overlay */}
                      <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex flex-col justify-between p-2">
                        <div className="flex justify-between">
                          <span className="w-5 h-5 border-t-2 border-l-2 border-[#88d937] rounded-tl-md" />
                          <span className="w-5 h-5 border-t-2 border-r-2 border-[#88d937] rounded-tr-md" />
                        </div>
                        <div className="flex justify-between">
                          <span className="w-5 h-5 border-b-2 border-l-2 border-[#88d937] rounded-bl-md" />
                          <span className="w-5 h-5 border-b-2 border-r-2 border-[#88d937] rounded-br-md" />
                        </div>
                      </div>

                      {/* Camera Error / Permission Fallback */}
                      {cameraError && (
                        <div className="absolute inset-0 bg-black/90 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                          <WarningCircle size={32} className="text-amber-400" weight="fill" />
                          <p className="text-xs text-white/80 max-w-xs">{cameraError}</p>
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-[#88d937] text-[#111111] px-4 py-2 rounded-full font-bold text-xs hover:bg-[#78c92a] transition-all"
                          >
                            Coba Lagi Izin Kamera
                          </button>
                        </div>
                      )}

                      {/* Redesigned Camera Action Bar: Zoom Badges + Shutter Bar */}
                      {isCameraActive && (
                        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2.5 z-20 px-4 pointer-events-none">
                          {/* 1. Informasi Zoom Minimalis (Hanya Muncul Saat Kamera Di-Zoom > 1x) */}
                          <AnimatePresence>
                            {zoomLevel > 1 && (
                              <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="pointer-events-auto bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15 text-white shadow-md"
                              >
                                <span className="text-[11px] font-bold tracking-tight text-white/95">
                                  {zoomLevel.toFixed(1)}x
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 2. Bar Tombol Utama: Zoom (-) di Kiri | Shutter Bulat di Tengah | Zoom (+) di Kanan */}
                          <div className="w-full max-w-xs flex items-center justify-between pointer-events-auto px-2">
                            {/* Icon Kaca Pembesar (-) di Kiri */}
                            <button
                              type="button"
                              onClick={handleZoomOut}
                              disabled={zoomLevel <= minZoom}
                              className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 shadow-md"
                              title="Zoom Out (-)"
                            >
                              <MagnifyingGlassMinus size={20} weight="bold" />
                            </button>

                            {/* Tombol Kamera Bulat Besar di Tengah (Shutter Button) */}
                            <button
                              type="button"
                              onClick={capturePhoto}
                              disabled={isCapturing}
                              className="w-16 h-16 rounded-full bg-white border-4 border-white/40 shadow-2xl flex items-center justify-center active:scale-90 transition-all hover:scale-105 shrink-0"
                              title="Potret Pohon"
                            >
                              {isCapturing ? (
                                <CircleNotch size={26} className="animate-spin text-[#19382B]" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-black/15 shadow-inner" />
                              )}
                            </button>

                            {/* Icon Kaca Pembesar (+) di Kanan */}
                            <button
                              type="button"
                              onClick={handleZoomIn}
                              disabled={zoomLevel >= maxZoom}
                              className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 shadow-md"
                              title="Zoom In (+)"
                            >
                              <MagnifyingGlassPlus size={20} weight="bold" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Location Selection & Map Picker (Ganti Input Manual Lat/Lng) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                  <MapPin size={15} weight="bold" className="text-[#19382B]" />
                  Titik Lokasi Pohon <span className="text-red-500">*</span>
                </label>

                <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-4 space-y-3">
                  {/* Address / Location Details Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
                        <MapPin size={13} weight="fill" className="text-[#19382B] shrink-0" />
                        <span>Alamat Terdeteksi</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#111111] leading-snug line-clamp-2">
                        {detectedAddress ? (
                          detectedAddress
                        ) : formLogic.watch("latitude") && formLogic.watch("longitude") ? (
                          `Titik Koordinat (${formLogic.watch("latitude")}, ${formLogic.watch("longitude")})`
                        ) : (
                          "Belum ada lokasi dipilih. Silakan klik Deteksi GPS Otomatis atau Pilih di Peta."
                        )}
                      </p>
                      {formLogic.watch("latitude") && formLogic.watch("longitude") && (
                        <p className="text-[11px] font-semibold text-[#19382B]">
                          GPS: {formLogic.watch("latitude")}, {formLogic.watch("longitude")}
                        </p>
                      )}
                    </div>

                    {locationSuccess && (
                      <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-700 border border-green-500/20 px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0">
                        <CheckCircle size={13} weight="fill" />
                        Lokasi Terisi
                      </span>
                    )}
                  </div>

                  {/* Dual Action Buttons: GPS Detect + Open Interactive Map Picker */}
                  <div className="flex items-center gap-2 pt-1 flex-col sm:flex-row">
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation || isDesktop}
                      className="w-full sm:flex-1 bg-[#19382B] text-white hover:bg-[#234A39] py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {isGettingLocation ? (
                        <>
                          <CircleNotch size={15} className="animate-spin text-white" />
                          <span>Mendeteksi GPS...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={15} weight="bold" />
                          <span>Deteksi GPS Otomatis</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      disabled={isDesktop}
                      className="w-full sm:flex-1 bg-white text-[#111111] hover:bg-gray-100 border border-black/10 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <MapTrifold size={15} weight="bold" className="text-[#19382B]" />
                      <span>Pilih / Ubah di Peta</span>
                    </button>
                  </div>

                  {(formLogic.formState.errors.latitude || formLogic.formState.errors.longitude) && (
                    <p className="text-red-500 text-xs font-semibold pt-1">
                      ⚠️ Silakan klik &apos;Deteksi GPS Otomatis&apos; atau &apos;Pilih di Peta&apos; untuk menentukan titik lokasi.
                    </p>
                  )}
                </div>
              </div>

              {/* Deskripsi Laporan */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                  <FileText size={15} weight="bold" className="text-[#19382B]" />
                  Catatan / Deskripsi Tambahan
                </label>

                <textarea
                  rows={3}
                  disabled={isDesktop}
                  placeholder="Contoh: Pohon mahoni miring ke arah jalan raya, dahan kering lebat..."
                  {...formLogic.register("description")}
                  className="w-full bg-[#f8f9f5] border border-black/8 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111] resize-none font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
                {formLogic.formState.errors.description && (
                  <p className="text-red-500 text-xs font-medium pl-1">
                    {formLogic.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isDesktop}
                className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99] ${isDesktop
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed shadow-none"
                  : "bg-[#19382B] hover:bg-[#234A39] text-white hover:shadow-lg disabled:opacity-60"
                  }`}
              >
                {isDesktop ? (
                  <>
                    <DeviceMobile size={18} weight="bold" />
                    <span>Pelaporan Hanya Melalui Perangkat Mobile (HP)</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                    <span>{submitStepLabels[submitStep]}</span>
                  </>
                ) : (
                  <>
                    <Sparkle size={18} weight="fill" className="text-[#88d937]" />
                    <span>Kirim & Analisis Risiko Pohon</span>
                  </>
                )}
              </button>
            </form>
          )
        )}

        {/* ── TAB 2: PROGRESS LAPORAN SAYA (MONITORING PAGE) ── */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Riwayat Perkembangan Laporan Kamu
              </p>
              <button
                type="button"
                onClick={fetchReportHistory}
                disabled={isLoadingHistory}
                className="text-xs font-semibold text-[#19382B] hover:underline flex items-center gap-1"
              >
                <ArrowCounterClockwise size={14} className={isLoadingHistory ? "animate-spin" : ""} />
                <span>Perbarui Data</span>
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-12 text-center text-xs text-[#111111]/60 flex flex-col items-center gap-2">
                <CircleNotch size={24} className="animate-spin text-[#19382B]" />
                <span>Memuat perkembangan laporan kamu...</span>
              </div>
            ) : reportHistory.length === 0 ? (
              <div className="py-10 px-4 bg-[#f8f9f5] border border-black/5 rounded-2xl text-center space-y-2">
                <Tree size={36} weight="duotone" className="text-[#19382B]/40 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-[#111111]">
                  Belum ada laporan yang kamu kirim.
                </p>
                <p className="text-[11px] text-[#111111]/50 max-w-xs mx-auto">
                  Gunakan perangkat HP kamu untuk memotret dan memindai lokasi pohon rawan tumbang.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {reportHistory.map((item) => {
                  const riskLevel = getRiskLevel(item.risk_score);
                  const riskConf = riskLevelConfig[riskLevel];
                  const st = getReportStatusConfig(item.status);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-black/5">
                          <img
                            src={item.image_url}
                            alt="Foto Laporan"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                            >
                              {st.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskConf.bgColor} ${riskConf.textColor}`}
                            >
                              Risiko:{" "}
                              {item.risk_score <= 1
                                ? Math.round(item.risk_score * 100)
                                : Math.round(item.risk_score)}
                              /100
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-[#111111] truncate max-w-xs sm:max-w-md">
                            {item.description || "Laporan Pohon Rawan Tumbang"}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-[#111111]/50 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(item.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {formatLocationDisplay(item.location)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Cancel Report (ONLY if pending) & View Detail */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {st.isPending && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            title="Batalkan Laporan Ini"
                          >
                            <Trash size={14} weight="bold" />
                            <span>Batalkan</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedHistoryItem(item)}
                          className="bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Eye size={14} weight="bold" />
                          <span>Lihat Detail AI</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal Alert Konfirmasi Pembatalan & Penghapusan Permanen Laporan ── */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-black/10 text-center"
            >
              {/* Red Warning Icon Header */}
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                <Trash size={28} weight="fill" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[#111111] tracking-tight">
                  Batalkan & Hapus Laporan?
                </h3>
                <p className="text-xs text-[#111111]/70 leading-relaxed max-w-xs mx-auto">
                  Laporan ini <strong>belum diverifikasi oleh petugas</strong>. Apakah kamu yakin ingin membatalkannya? Data laporan akan <strong>terhapus secara permanen</strong> dari sistem.
                </p>
              </div>

              {/* Card Ringkasan Laporan */}
              <div className="bg-[#f8f9f5] border border-black/8 rounded-2xl p-3.5 flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-black/5">
                  <img
                    src={deleteConfirmItem.image_url}
                    alt="Thumbnail Laporan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111111] truncate">
                    {deleteConfirmItem.description || "Laporan Pohon Rawan Tumbang"}
                  </p>
                  <p className="text-[10px] text-[#111111]/50 font-medium pt-0.5">
                    Diposting: {new Date(deleteConfirmItem.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmItem(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#111111] py-2.5 rounded-full text-xs font-bold transition-all border border-black/5"
                >
                  Kembali (Batal)
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteReport}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <CircleNotch size={16} className="animate-spin text-white" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash size={16} weight="bold" />
                      <span>Ya, Hapus Permanen</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Detail Inspeksi AI untuk Progress Item ── */}
      <AnimatePresence>
        {selectedHistoryItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#19382B] text-white flex items-center justify-center">
                    <Tree size={18} weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#111111]">
                      Detail Hasil Inspeksi AI
                    </h3>
                    <p className="text-[11px] text-[#111111]/60">
                      ID Laporan: {selectedHistoryItem.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111111] flex items-center justify-center transition-colors"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {(() => {
                  const st = getReportStatusConfig(selectedHistoryItem.status);
                  const riskLevel = getRiskLevel(selectedHistoryItem.risk_score);
                  const riskConf = riskLevelConfig[riskLevel];
                  const modalDisplayScore =
                    selectedHistoryItem.risk_score <= 1
                      ? Math.round(selectedHistoryItem.risk_score * 100)
                      : Math.round(selectedHistoryItem.risk_score);
                  return (
                    <>
                      <div
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}
                      >
                        Status: {st.label}
                      </div>
                      <div
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${riskConf.bgColor} ${riskConf.textColor}`}
                      >
                        Skor Risiko: {modalDisplayScore} / 100
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Bounding Box Image Visualizer */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#111111]/50">
                  Hasil Deteksi Bounding Box YOLOv8
                </p>
                <div className="rounded-2xl overflow-hidden border border-black/5 bg-[#ecefe6]/40 p-2">
                  <TreeImageWithBoundingBox
                    imageUrl={selectedHistoryItem.image_url}
                    boundingBoxes={selectedHistoryItem.bounding_box || []}
                  />
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#f8f9f5] border border-black/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                    Skor Risiko AI
                  </p>
                  <p className="text-lg font-extrabold text-[#19382B]">
                    {selectedHistoryItem.risk_score <= 1
                      ? Math.round(selectedHistoryItem.risk_score * 100)
                      : Math.round(selectedHistoryItem.risk_score)}{" "}
                    / 100
                  </p>
                </div>
                <div className="bg-[#f8f9f5] border border-black/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                    Volume Kanopi
                  </p>
                  <p className="text-lg font-extrabold text-[#19382B]">
                    {selectedHistoryItem.canopy_volume} m³
                  </p>
                </div>
                <div className="bg-[#f8f9f5] border border-black/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                    Biomassa Kayu
                  </p>
                  <p className="text-lg font-extrabold text-[#19382B]">
                    {selectedHistoryItem.biomass_estimate} kg
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedHistoryItem.description && (
                <div className="bg-[#f8f9f5] border border-black/5 p-3.5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                    Catatan Pelapor
                  </p>
                  <p className="text-xs text-[#111111] font-medium leading-relaxed">
                    {selectedHistoryItem.description}
                  </p>
                </div>
              )}

              <div className="pt-2 space-y-2">
                {getReportStatusConfig(selectedHistoryItem.status).isPending && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmItem(selectedHistoryItem);
                      setSelectedHistoryItem(null);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash size={16} weight="bold" />
                    <span>Batalkan &amp; Hapus Laporan Ini</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-full bg-gray-100 text-[#111111] py-2.5 rounded-full text-xs font-bold hover:bg-gray-200 transition-all"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Location Map Picker Modal (Leaflet / OpenStreetMap) */}
      <LocationMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={formLogic.watch("latitude") || -6.9932}
        initialLng={formLogic.watch("longitude") || 110.4203}
        onSelectLocation={handleLocationSelectedFromMap}
      />
    </div>
  );
};
