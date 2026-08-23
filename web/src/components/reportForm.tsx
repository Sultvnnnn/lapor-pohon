"use client";

import { useState, useRef, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadSimple,
  MapPin,
  Sparkle,
  CircleNotch,
  CheckCircle,
  Tree,
  FileText,
  ShieldWarning,
  Scales,
  Camera,
  ArrowCounterClockwise,
  WarningCircle,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

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

type SubmitStep = "idle" | "uploading" | "analyzing" | "saving";
type InputMode = "camera" | "upload";

const submitStepLabels: Record<SubmitStep, string> = {
  idle: "",
  uploading: "Mengunggah foto laporan ke cloud...",
  analyzing: "Menganalisis bahaya & volume dengan AI YOLOv8...",
  saving: "Menyimpan data laporan ke database...",
};

export const ReportForm = () => {
  const [inputMode, setInputMode] = useState<InputMode>("camera");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

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

  // Start Camera Stream
  const startCamera = async () => {
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
        "Kamera tidak dapat diakses. Pastikan izin kamera aktif atau gunakan mode 'Unggah Foto Galeri'."
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

  // Effect to manage camera stream when switching tabs
  useEffect(() => {
    if (inputMode === "camera" && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [inputMode, imagePreview]);

  // Capture Photo from Camera Frame
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
        },
        "image/jpeg",
        0.9
      );
    }
  };

  const handleRetakePhoto = () => {
    setImagePreview(null);
    formLogic.setValue("image", undefined as any);
    if (inputMode === "camera") {
      startCamera();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      formLogic.setValue("image", files as any);
      formLogic.trigger("image");
    }
  };

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
          "Gagal mengambil lokasi GPS. Silakan isi koordinat secara manual."
        );
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitHandler: SubmitHandler<ReportFormValues> = async (data) => {
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
      setImagePreview(null);
      setLocationSuccess(false);
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

      {/* ── Container Utama Formulir ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/5 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 pb-3.5 sm:pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-[#19382B] text-[#e3f4d7] flex items-center justify-center shadow-xs shrink-0">
            <Tree size={22} weight="fill" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              Pemindai AI & Lapor Pohon
            </h2>
            <p className="text-[11px] sm:text-xs text-[#111111]/60">
              Potret langsung atau unggah foto untuk analisis bahaya & volume sirkular
            </p>
          </div>
        </div>

        {/* ── Tab Switcher Mode Input (Berdampingan Ala Login/Register) ── */}
        <div className="bg-[#ecefe6] p-1 rounded-full flex gap-1 border border-black/5 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setInputMode("camera");
              if (imagePreview) setImagePreview(null);
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              inputMode === "camera"
                ? "bg-[#19382B] text-white shadow-xs"
                : "text-[#111111]/60 hover:text-[#111111]"
            }`}
          >
            <Camera size={16} weight="bold" />
            <span>Pemindai Kamera Live</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInputMode("upload");
              stopCamera();
            }}
            className={`flex-1 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              inputMode === "upload"
                ? "bg-[#19382B] text-white shadow-xs"
                : "text-[#111111]/60 hover:text-[#111111]"
            }`}
          >
            <UploadSimple size={16} weight="bold" />
            <span>Unggah Foto Galeri</span>
          </button>
        </div>

        <form
          onSubmit={formLogic.handleSubmit(submitHandler)}
          className="space-y-5 sm:space-y-6"
        >
          {/* ── MODE 1: Kamera Live Scanner Viewfinder ── */}
          {inputMode === "camera" && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                <Camera size={15} weight="bold" className="text-[#19382B]" />
                Pemindahan Foto Pohon <span className="text-red-500">*</span>
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
                        onClick={() => setInputMode("upload")}
                        className="bg-[#88d937] text-[#111111] px-4 py-2 rounded-full font-bold text-xs hover:bg-[#78c92a] transition-all"
                      >
                        Beralih ke Unggah Foto Galeri
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

          {/* ── MODE 2: Unggah Foto Galeri (Drag & Drop) ── */}
          {inputMode === "upload" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                <UploadSimple size={15} weight="bold" className="text-[#19382B]" />
                Foto Kondisi Pohon <span className="text-red-500">*</span>
              </label>

              <div className="relative border-2 border-dashed border-gray-200 hover:border-[#19382B]/50 rounded-2xl p-4 transition-colors bg-[#ecefe6]/20">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden max-h-64 flex items-center justify-center bg-black/5">
                    <img
                      src={imagePreview}
                      alt="Preview Pohon"
                      className="max-h-64 object-contain rounded-xl"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full font-medium">
                      Klik untuk mengganti foto
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#19382B]/10 text-[#19382B] flex items-center justify-center mx-auto">
                      <UploadSimple size={24} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#111111]">
                        Pilih atau tarik foto pohon dari galeri
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#111111]/50">
                        Format PNG, JPG, JPEG (Maks. 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {formLogic.formState.errors.image && (
            <p className="text-red-500 text-xs font-medium pl-1">
              {formLogic.formState.errors.image.message?.toString()}
            </p>
          )}

          {/* Location Inputs & GPS Auto-detect */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                <MapPin size={15} weight="bold" className="text-[#19382B]" />
                Koordinat Lokasi (GPS) <span className="text-red-500">*</span>
              </label>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (Contoh: -6.9932)"
                  {...formLogic.register("latitude", { valueAsNumber: true })}
                  className="w-full bg-[#f8f9f5] border border-black/8 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111]"
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
                  placeholder="Longitude (Contoh: 110.4203)"
                  {...formLogic.register("longitude", { valueAsNumber: true })}
                  className="w-full bg-[#f8f9f5] border border-black/8 rounded-full px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111]"
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
              placeholder="Contoh: Pohon mahoni miring ke arah jalan raya, dahan kering lebat..."
              {...formLogic.register("description")}
              className="w-full bg-[#f8f9f5] border border-black/8 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#19382B] focus:bg-white transition-all text-[#111111] resize-none font-medium"
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
            disabled={isSubmitting}
            className="w-full bg-[#19382B] hover:bg-[#234A39] text-white py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            {isSubmitting ? (
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
      </div>

      {/* ── Hasil Inspeksi AI (Hasil Analisis Laporan) ── */}
      {submittedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-black/5 shadow-md space-y-6"
        >
          {/* Header Hasil */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#88d937]/30 text-[#19382B] flex items-center justify-center shadow-xs">
                <CheckCircle size={22} weight="fill" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#111111] tracking-tight">
                  Hasil Inspeksi AI YOLOv8
                </h3>
                <p className="text-xs text-[#111111]/60">
                  Laporan berhasil dikirim & dianalisis secara otomatis
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

          {/* Bounding Box Image Visualizer */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#111111]/50">
              Deteksi Detil Pohon ({submittedReport.detections} Objek Terdeteksi)
            </p>
            <div className="rounded-2xl overflow-hidden border border-black/5 bg-[#ecefe6]/40 p-2">
              <TreeImageWithBoundingBox
                imageUrl={submittedReport.imageUrl}
                boundingBoxes={submittedReport.boundingBoxes}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#f8f9f5] border border-black/5 p-4 rounded-2xl space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                Skor Risiko Bahaya
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
        </motion.div>
      )}
    </div>
  );
};
