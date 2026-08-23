"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";

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

const submitStepLabels: Record<SubmitStep, string> = {
  idle: "",
  uploading: "Mengunggah foto laporan ke cloud...",
  analyzing: "Menganalisis bahaya & volume dengan AI YOLOv8...",
  saving: "Menyimpan data laporan ke database...",
};

export const ReportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const supabaseClient = createClient();

  const formLogic = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      description: "",
    },
  });

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
        alert("Gagal mengambil lokasi GPS. Silakan isi koordinat secara manual.");
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
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Container Utama Formulir */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-black/5 shadow-xs space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 pb-3.5 sm:pb-4 border-b border-gray-100">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0b3d2c] text-[#e3f4d7] flex items-center justify-center shadow-xs shrink-0">
            <Tree size={20} weight="fill" className="sm:hidden" />
            <Tree size={22} weight="fill" className="hidden sm:block" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
              Formulir Laporan Pohon Rawan Tumbang
            </h2>
            <p className="text-[11px] sm:text-xs text-[#111111]/60">
              Unggah foto lokasi & koordinat untuk dideteksi oleh AI
            </p>
          </div>
        </div>

        <form onSubmit={formLogic.handleSubmit(submitHandler)} className="space-y-5 sm:space-y-6">
          {/* Upload Foto */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <UploadSimple size={15} weight="bold" className="text-[#0b3d2c]" />
              Foto Kondisi Pohon <span className="text-red-500">*</span>
            </label>

            <div className="relative border-2 border-dashed border-gray-200 hover:border-[#0b3d2c]/50 rounded-2xl p-4 transition-colors bg-[#ecefe6]/20">
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
                <div className="text-center py-5 sm:py-6 space-y-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0b3d2c]/10 text-[#0b3d2c] flex items-center justify-center mx-auto">
                    <UploadSimple size={22} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#111111]">
                      Pilih atau tarik foto pohon ke sini
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#111111]/50">
                      Format PNG, JPG, JPEG (Maks. 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {formLogic.formState.errors.image && (
              <p className="text-red-500 text-xs font-medium pl-1">
                {formLogic.formState.errors.image.message?.toString()}
              </p>
            )}
          </div>

          {/* Location Inputs & GPS Auto-detect */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
                <MapPin size={15} weight="bold" className="text-[#0b3d2c]" />
                Koordinat Lokasi (GPS) <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-[#0b3d2c] hover:text-[#19382B] bg-[#ecefe6] hover:bg-[#e1e6d7] px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
              >
                {isGettingLocation ? (
                  <>
                    <CircleNotch size={14} className="animate-spin" />
                    Deteksi GPS...
                  </>
                ) : locationSuccess ? (
                  <>
                    <CheckCircle size={14} weight="fill" className="text-green-600" />
                    Lokasi Terisi!
                  </>
                ) : (
                  <>
                    <MapPin size={14} weight="bold" />
                    Deteksi Lokasi Otomatis
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (Contoh: -6.9932)"
                  {...formLogic.register("latitude", { valueAsNumber: true })}
                  className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
                />
                {formLogic.formState.errors.latitude && (
                  <p className="text-red-500 text-xs font-medium pt-1">
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
                  className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111]"
                />
                {formLogic.formState.errors.longitude && (
                  <p className="text-red-500 text-xs font-medium pt-1">
                    {formLogic.formState.errors.longitude.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Laporan */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <FileText size={15} weight="bold" className="text-[#0b3d2c]" />
              Deskripsi / Catatan Tambahan
            </label>

            <textarea
              rows={3}
              placeholder="Contoh: Pohon mahoni miring ke arah jalan raya, dahan kering cukup lebat..."
              {...formLogic.register("description")}
              className="w-full bg-[#ecefe6]/30 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0b3d2c] focus:bg-white transition-all text-[#111111] resize-none"
            />
            {formLogic.formState.errors.description && (
              <p className="text-red-500 text-xs font-medium">
                {formLogic.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0b3d2c] hover:bg-[#15543e] text-white py-3.5 px-6 rounded-2xl text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group"
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

      {/* Panel Hasil Analisis AI */}
      {submittedReport &&
        (() => {
          const riskLevel = getRiskLevel(submittedReport.riskScore);
          const config = riskLevelConfig[riskLevel];

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#0b3d2c]/10 shadow-lg space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#88d937]/20 text-[#0b3d2c] flex items-center justify-center">
                    <Sparkle size={22} weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#111111]">
                      Hasil Analisis AI LaporPohon
                    </h3>
                    <p className="text-xs text-[#111111]/60">
                      Deteksi risiko & estimasi biomassa otomatis
                    </p>
                  </div>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
                >
                  {config.label}
                </div>
              </div>

              {/* Bounding Box Visualizer */}
              <div className="rounded-2xl overflow-hidden bg-black/5 p-2 border border-black/5 flex justify-center">
                <TreeImageWithBoundingBox
                  imageUrl={submittedReport.imageUrl}
                  boundingBoxes={submittedReport.boundingBoxes}
                  alt="Foto pohon terdeteksi"
                />
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#ecefe6]/40 border border-black/5 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 font-medium">
                    <ShieldWarning size={16} className="text-[#0b3d2c]" />
                    Tingkat Risiko
                  </div>
                  <p className="text-lg font-bold text-[#111111]">
                    {(submittedReport.riskScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-[11px] text-[#111111]/50">
                    Skor potensial rawan tumbang
                  </p>
                </div>

                <div className="bg-[#ecefe6]/40 border border-black/5 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 font-medium">
                    <Tree size={16} className="text-[#0b3d2c]" />
                    Volume Kanopi
                  </div>
                  <p className="text-lg font-bold text-[#111111]">
                    {submittedReport.canopyVolume.toFixed(2)} m³
                  </p>
                  <p className="text-[11px] text-[#111111]/50">
                    Estimasi cakupan tajuk pohon
                  </p>
                </div>

                <div className="bg-[#ecefe6]/40 border border-black/5 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#111111]/60 font-medium">
                    <Scales size={16} className="text-[#0b3d2c]" />
                    Estimasi Biomassa
                  </div>
                  <p className="text-lg font-bold text-[#111111]">
                    {submittedReport.biomassEstimate.toFixed(2)} kg
                  </p>
                  <p className="text-[11px] text-[#111111]/50">
                    Potensi limbah kayu sirkular
                  </p>
                </div>
              </div>

              <div className="bg-[#0b3d2c]/5 border border-[#0b3d2c]/10 rounded-2xl p-4 flex items-center justify-between text-xs text-[#111111]/80">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-[#0b3d2c]" />
                  Laporan Anda berhasil dicatat dan sedang dalam antrean verifikasi petugas.
                </span>
                <span className="font-semibold text-[#0b3d2c]">
                  {submittedReport.detections} Objek Terdeteksi
                </span>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default ReportForm;
