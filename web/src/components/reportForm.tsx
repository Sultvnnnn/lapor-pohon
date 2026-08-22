"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  uploading: "Mengunggah foto...",
  analyzing: "Menganalisis pohon dengan AI...",
  saving: "Menyimpan laporan...",
};

export const reportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submittedReport, setSubmittedReport] =
    useState<SubmittedReport | null>(null);

  const supabaseClient = createClient();

  // init logic form
  const formLogic = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      description: "",
    },
  });

  // main function for handling the data transmission flow
  const submitHandler: SubmitHandler<ReportFormValues> = async (data) => {
    setIsSubmitting(true);
    setSubmittedReport(null);

    try {
      setSubmitStep("uploading");
      //! upload foto ke Supabase Storage
      const imageUrl = await uploadReportImage(data.image[0]);

      //! kirim data ke backend
      setSubmitStep("analyzing");

      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        throw new Error(
          "[ERROR] Sesi login tidak ditemukan. Silakan login ulang.",
        );
      }

      const aiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/analyze-tree`,
        {
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
        },
      );

      if (!aiResponse.ok) {
        throw new Error(
          `[ERROR] Layanan AI merespons dengan status: ${aiResponse.status}`,
        );
      }

      const aiData = await aiResponse.json();
      console.log(
        `[SUCCESS] Menerima metrik AI:\n${JSON.stringify(aiData, null, 2)}`,
      );

      //! save all data ke table 'reports' di Supabase
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
        console.error(
          `[ERROR] Gagal menyimpan laporan ke pangkalan data: ${dbError.message}`,
        );
        throw new Error("[ERROR] Failed to save the report to the database.");
      }

      // simpan hasil untuk ditampilkan as preview
      setSubmittedReport({
        imageUrl,
        boundingBoxes: aiData.bounding_boxes,
        riskScore: aiData.risk_score,
        canopyVolume: aiData.canopy_volume,
        biomassEstimate: aiData.biomass_estimate,
        detections: aiData.detections,
      });

      formLogic.reset();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak terduga pada sistem.";
      console.error(
        `[ERROR] Terjadi kesalahan kritis saat memproses formulir: ${errorMessage}`,
      );
      alert(
        "[ERROR] An unexpected error occurred while submitting the report. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setSubmitStep("idle");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      <form
        onSubmit={formLogic.handleSubmit(submitHandler)}
        className="space-y-4 border rounded p-4"
      >
        <div>
          <label htmlFor="image">[INFO] Foto Pohon</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            {...formLogic.register("image")}
            className="block w-full"
          />
          {formLogic.formState.errors.image && (
            <p className="text-red-500 text-sm">
              {formLogic.formState.errors.image.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="latitude">[INFO] Latitude</label>
          <input
            id="latitude"
            type="number"
            step="any"
            {...formLogic.register("latitude")}
            className="block w-full border"
          />
          {formLogic.formState.errors.latitude && (
            <p className="text-red-500 text-sm">
              {formLogic.formState.errors.latitude.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="longitude">[INFO] Longitude</label>
          <input
            id="longitude"
            type="number"
            step="any"
            {...formLogic.register("longitude")}
            className="block w-full border"
          />
          {formLogic.formState.errors.longitude && (
            <p className="text-red-500 text-sm">
              {formLogic.formState.errors.longitude.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description">[INFO] Deskripsi Laporan</label>
          <textarea
            id="description"
            {...formLogic.register("description")}
            className="block w-full border"
          />
          {formLogic.formState.errors.description && (
            <p className="text-red-500 text-sm">
              {formLogic.formState.errors.description.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isSubmitting ? submitStepLabels[submitStep] : "Kirim Laporan"}
        </button>
      </form>

      {submittedReport &&
        (() => {
          const riskLevel = getRiskLevel(submittedReport.riskScore);
          const config = riskLevelConfig[riskLevel];

          return (
            <div className="border rounded p-4 space-y-3">
              <h3 className="font-semibold">[INFO] Hasil Analisis AI</h3>

              <TreeImageWithBoundingBox
                imageUrl={submittedReport.imageUrl}
                boundingBoxes={submittedReport.boundingBoxes}
                alt="Foto pohon yang baru dilaporkan"
              />

              <div
                className={`rounded px-3 py-2 border ${config.bgColor} ${config.borderColor}`}
              >
                <span className={`font-semibold ${config.textColor}`}>
                  {config.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="border rounded p-2">
                  <p className="text-gray-500">Volume Kanopi</p>
                  <p className="font-semibold">
                    {submittedReport.canopyVolume.toFixed(2)} m³
                  </p>
                </div>
                <div className="border rounded p-2">
                  <p className="text-gray-500">Estimasi Biomassa</p>
                  <p className="font-semibold">
                    {submittedReport.biomassEstimate.toFixed(2)} kg
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                {submittedReport.detections} objek pohon terdeteksi
              </p>
            </div>
          );
        })()}
    </div>
  );
};
