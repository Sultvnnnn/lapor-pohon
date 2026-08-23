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
  Recycle,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

import { reportSchema, ReportFormValues } from "@/lib/validations/reportSchema";
import { uploadReportImage } from "@/lib/storageUtils";
import { createClient } from "@/lib/supabase/client";
import { TreeImageWithBoundingBox } from "@/components/TreeImageWithBoundingBox";
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
  location: string;
  risk_score: number;
  canopy_volume: number;
  biomass_estimate: number;
  bounding_box: BoundingBox[] | null;
  status: "pending" | "in_progress" | "resolved" | string;
};

type SubmitStep = "idle" | "uploading" | "analyzing" | "saving";
type TabMode = "scan" | "progress";

const submitStepLabels: Record<SubmitStep, string> = {
  idle: "",
  uploading: "Mengunggah foto laporan ke cloud...",
  analyzing: "Menganalisis bahaya & volume dengan AI YOLOv8...",
  saving: "Menyimpan data laporan ke database...",
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "⏳ Menunggu Verifikasi",
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-500/20",
  },
  in_progress: {
    label: "🚜 Dalam Penanganan DLH",
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20",
  },
  resolved: {
    label: "♻️ Pemanfaatan Sirkular Selesai",
    bg: "bg-[#88d937]/20",
    text: "text-[#19382B]",
    border: "border-[#88d937]/40",
  },
};

export const ReportForm = () => {
  const [activeTab, setActiveTab] = useState<TabMode>("scan");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Desktop Detection State
  const [isDesktop, setIsDesktop] = useState(false);

  // User Reports History
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ReportHistoryItem | null>(null);

  // Camera Live Shoot States & Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const supabaseClient = createClient();

  const formLogic = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      description: "",
    },
  });

  // Detect Desktop Device vs Mobile
  useEffect(() => {
    const checkDevice = () => {
      const isTouch =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsDesktop(!isMobileUA && !isTouch);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch Report History for Progress Tab
  const fetchReportHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      if (!user) return;

      const { data, error } = await supabaseClient
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReportHistory(data as ReportHistoryItem[]);
      }
    } catch (err) {
      console.error("[ERROR] Fetching report history failed:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "progress") {
      fetchReportHistory();
    }
  }, [activeTab]);

  // Start Camera Stream
  const startCamera = async () => {
    if (isDesktop) return; // Don't start camera on desktop
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

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("[ERROR] Accessing camera failed:", err);
      setCameraError(
        "Kamera HP tidak dapat diakses. Pastikan izin kamera telah diaktifkan."
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

  // Manage Camera Life Cycle
  useEffect(() => {
    if (activeTab === "scan" && !isDesktop && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, isDesktop, imagePreview]);

  // Auto-get Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Fitur lokasi tidak didukung oleh peramban Anda.");
      return;
    }

    setIsGettingLocation(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        formLogic.setValue("latitude", lat as any);
        formLogic.setValue("longitude", lng as any);
        formLogic.trigger(["latitude", "longitude"]);

        setIsGettingLocation(false);
        setLocationSuccess(true);
      },
      (error) => {
        console.error("[ERROR] Geolocation error:", error.message);
        alert(
          "Gagal mengambil lokasi GPS. Silakan pastikan izin lokasi diaktifkan di HP Anda."
        );
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImagePreview(dataUrl);

      // Convert Canvas to Blob -> File for form logic
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const capturedFile = new File([blob], `pohon-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(capturedFile);
            formLogic.setValue("image", dataTransfer.files as any);
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

    setIsSubmitting(true);
    setSubmittedReport(null);

    try {
      setSubmitStep("uploading");
      const imageUrl = await uploadReportImage(data.image[0]);

      setSubmitStep("analyzing");
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const aiResponse = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(
          `Layanan AI merespons dengan status: ${aiResponse.status}`
        );
      }

      const aiData = await aiResponse.json();

      setSubmitStep("saving");
      const { error: dbError } = await supabaseClient.from("reports").insert({
        image_url: imageUrl,
        description: data.description,
        location: `POINT(${data.longitude} ${data.latitude})`,
        risk_score: aiData.risk_score,
        canopy_volume: aiData.canopy_volume,
        biomass_estimate: aiData.biomass_estimate,
        bounding_box: aiData.bounding_boxes,
        status: "pending",
      });

      if (dbError) {
        console.error(`[ERROR] DB Insert failed: ${dbError.message}`);
        throw new Error("Gagal menyimpan laporan ke basis data.");
      }

      setSubmittedReport({
        imageUrl,
        boundingBoxes: aiData.bounding_boxes,
        riskScore: aiData.risk_score,
        canopyVolume: aiData.canopy_volume,
        biomassEstimate: aiData.biomass_estimate,
        detections: aiData.detections,
      });

      formLogic.reset();
      setLocationSuccess(false);
      // Automatically refresh history for Tab 2
      fetchReportHistory();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak terduga pada sistem.";
      console.error(`[ERROR] Submit report error: ${errorMessage}`);
      alert(`[Gagal Memproses Laporan] ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setSubmitStep("idle");
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
              Pemindai AI & Progress LaporPohon
            </h2>
            <p className="text-[11px] sm:text-xs text-[#111111]/60">
              Lakukan pemindaian kamera live via HP atau pantau perkembangan laporan Anda
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
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === "scan"
                ? "bg-[#19382B] text-white shadow-xs"
                : "text-[#111111]/60 hover:text-[#111111]"
            }`}
          >
            <Camera size={16} weight="bold" />
            <span>Pemindaian Kamera Live</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("progress");
              stopCamera();
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === "progress"
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
                    return (
                      <div
                        className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-xs shadow-xs ${config.bgColor} ${config.textColor}`}
                      >
                        <ShieldWarning size={16} weight="fill" />
                        <span>{config.label} ({submittedReport.riskScore}/100)</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

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
                    {submittedReport.riskScore} <span className="text-xs font-normal text-[#111111]/50">/ 100</span>
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedReport(null);
                    setImagePreview(null);
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
              onSubmit={formLogic.handleSubmit(submitHandler)}
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
                  <p className="text-xs text-[#111111]/70 leading-relaxed">
                    Untuk memastikan akurasi posisi GPS real-time dan keandalan foto kondisi pohon terkini di lokasi, pelaporan dilakukan secara langsung dari HP Anda.
                  </p>
                </div>
                <div className="pt-2 border-t border-black/5 text-[11px] text-[#111111]/50 font-medium">
                  💡 <em>Anda dapat menggunakan layar komputer ini untuk memantau perkembangan seluruh laporan pada Tab <strong>Laporan Saya</strong>.</em>
                </div>
              </div>
            ) : (
              /* Case B: User Accesses from Mobile Device (Live Scanner Camera Viewfinder) */
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                  <Camera size={15} weight="bold" className="text-[#19382B]" />
                  Pemindaian Foto Pohon (Live Shoot) <span className="text-red-500">*</span>
                </label>

                {imagePreview ? (
                  /* Preview hasil potret dari kamera */
                  <div className="relative rounded-2xl overflow-hidden bg-black/5 border border-black/10 max-h-80 flex flex-col items-center justify-center p-2">
                    <img
                      src={imagePreview}
                      alt="Hasil Potret Pohon"
                      className="max-h-72 object-contain rounded-xl"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleRetakePhoto}
                        className="flex items-center gap-1.5 bg-[#19382B] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xs hover:bg-[#234A39] transition-all"
                      >
                        <ArrowCounterClockwise size={14} weight="bold" />
                        <span>Potret Ulang</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Jendela Bidik Kamera Live (Scanner Viewfinder) */
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#19382B] min-h-[300px] sm:min-h-[340px] flex items-center justify-center shadow-md">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover min-h-[300px] sm:min-h-[340px]"
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

                    {/* HUD Live Scanner Label */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span>KAMERA POHON LIVE</span>
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

                    {/* Capture Button Bar */}
                    {isCameraActive && (
                      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center z-10 px-4">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCapturing}
                          className="bg-[#19382B] hover:bg-[#234A39] text-white px-6 py-3 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-2 border border-white/20 active:scale-95"
                        >
                          {isCapturing ? (
                            <CircleNotch size={18} className="animate-spin text-[#88d937]" />
                          ) : (
                            <Camera size={18} weight="fill" className="text-[#88d937]" />
                          )}
                          <span>Potret Pohon Sekarang</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Location Inputs & GPS Auto-detect */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                  <MapPin size={15} weight="bold" className="text-[#19382B]" />
                  Koordinat Lokasi (GPS) <span className="text-red-500">*</span>
                </label>

                {!isDesktop && (
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-[#19382B] hover:text-[#234A39] bg-[#ecefe6] hover:bg-[#e1e6d7] px-3.5 py-1.5 rounded-full transition-colors disabled:opacity-50 border border-black/5"
                  >
                    {isGettingLocation ? (
                      <>
                        <CircleNotch size={14} className="animate-spin text-[#19382B]" />
                        <span>Mendeteksi GPS...</span>
                      </>
                    ) : locationSuccess ? (
                      <>
                        <CheckCircle size={14} weight="fill" className="text-green-600" />
                        <span>Lokasi Terisi!</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={14} weight="bold" />
                        <span>Deteksi Lokasi Otomatis</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <input
                    type="number"
                    step="any"
                    disabled={isDesktop}
                    placeholder="Latitude (Contoh: -6.9932)"
                    {...formLogic.register("latitude", { valueAsNumber: true })}
                    className="w-full bg-[#f8f9f5] border border-black/8 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {formLogic.formState.errors.latitude && (
                    <p className="text-red-500 text-xs font-medium pt-1 pl-2">
                      {formLogic.formState.errors.latitude.message}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    step="any"
                    disabled={isDesktop}
                    placeholder="Longitude (Contoh: 110.4203)"
                    {...formLogic.register("longitude", { valueAsNumber: true })}
                    className="w-full bg-[#f8f9f5] border border-black/8 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111] disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  {formLogic.formState.errors.longitude && (
                    <p className="text-red-500 text-xs font-medium pt-1 pl-2">
                      {formLogic.formState.errors.longitude.message}
                    </p>
                  )}
                </div>
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
              className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99] ${
                isDesktop
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
        ))}

        {/* ── TAB 2: 📊 PROGRESS LAPORAN SAYA (MONITORING PAGE) ── */}
        {activeTab === "progress" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#111111]/70">
                Riwayat Perkembangan Laporan Anda
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
                <span>Memuat perkembangan laporan Anda...</span>
              </div>
            ) : reportHistory.length === 0 ? (
              <div className="py-10 px-4 bg-[#f8f9f5] border border-black/5 rounded-2xl text-center space-y-2">
                <Tree size={36} weight="duotone" className="text-[#19382B]/40 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-[#111111]">
                  Belum ada laporan yang Anda kirim.
                </p>
                <p className="text-[11px] text-[#111111]/50 max-w-xs mx-auto">
                  Gunakan perangkat HP Anda untuk memotret dan memindai lokasi pohon rawan tumbang.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {reportHistory.map((item) => {
                  const riskLevel = getRiskLevel(item.risk_score);
                  const riskConf = riskLevelConfig[riskLevel];
                  const st = statusConfig[item.status] || statusConfig["pending"];

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
                              Risiko: {item.risk_score}/100
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
                              {item.location.replace("POINT(", "").replace(")", "")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Inspection Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryItem(item)}
                        className="self-end sm:self-center bg-[#19382B] text-white hover:bg-[#234A39] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                      >
                        <Eye size={14} weight="bold" />
                        <span>Lihat Detail AI</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
                  const st =
                    statusConfig[selectedHistoryItem.status] ||
                    statusConfig["pending"];
                  const riskLevel = getRiskLevel(selectedHistoryItem.risk_score);
                  const riskConf = riskLevelConfig[riskLevel];
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
                        Skor Risiko: {selectedHistoryItem.risk_score} / 100
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
                    {selectedHistoryItem.risk_score} / 100
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-full bg-[#19382B] text-white py-2.5 rounded-full text-xs font-bold hover:bg-[#234A39] transition-all"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
