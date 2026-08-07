"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportSchema, ReportFormValues } from "@/lib/validations/reportSchema";
import { uploadReportImage } from "@/lib/storageUtils";
import { supabaseClient } from "@/lib/supabaseClient";

export const reportForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      console.info("[INFO] Memulai proses unggah foto pelaporan ke server.");

      //! upload foto ke Supabase Storage
      const imageUrl = await uploadReportImage(data.image[0]);

      //! kirim data ke backend
      console.info("[INFO] Mengirim URL image ke backend.");
      const aiResponse = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

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
      console.info("[INFO] Menyimpan data pelaporan dan metrik AI");
      const { error: dbError } = await supabaseClient.from("reports").insert({
        image_url: imageUrl,
        description: data.description,
        location: `POINT(${data.longitude} ${data.latitude})`,
        risk_score: aiData.risk_score,
        canopy_volume: aiData.canopy_volume,
        biomass_estimate: aiData.biomass_estimate,
        status: "pending",
      });

      if (dbError) {
        console.error(
          `[ERROR] Gagal menyimpan laporan ke pangkalan data: ${dbError.message}`,
        );
        throw new Error("[ERROR] Failed to save the report to the database.");
      }

      console.log("[SUCCESS] Laporan pohon berhasil diproses dan disimpan.");
      alert("[SUCCESS] Laporan Anda berhasil dikirim!");

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
    }
  };

  return (
    <form
      onSubmit={formLogic.handleSubmit(submitHandler)}
      className="space-y-4 max-w-md mx-auto p-4 border rounded"
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
        {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
      </button>
    </form>
  );
};
