"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReportForm } from "@/components/reportForm";
import { motion } from "framer-motion";

interface DashboardClientProps {
  initialDisplayName: string;
  initialTotalReports: number;
}

export const DashboardClient = ({
  initialDisplayName,
  initialTotalReports,
}: DashboardClientProps) => {
  const supabase = createClient();
  const [displayName] = useState<string>(initialDisplayName);
  const [totalReports, setTotalReports] = useState<number>(initialTotalReports);

  const fetchTotalReports = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      setTotalReports(0);
      return;
    }

    const { count, data } = await supabase
      .from("reports")
      .select("id", { count: "exact" })
      .eq("user_id", user.id);

    const total = count ?? (data ? data.length : 0);
    setTotalReports(total);
  };

  const handleReportSubmitted = async () => {
    setTotalReports((prev) => prev + 1);
    fetchTotalReports();
  };

  return (
    <div
      className="max-w-[1000px] w-full mx-auto space-y-8 sm:space-y-12 pb-16 pt-2 sm:pt-6 px-1 sm:px-4 font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── 1. Header Minimalis & Stats (Welcome Text Kiri, 2 Card Putih Kanan) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8"
      >
        {/* Teks Sapaan Ramah & Natural */}
        <div className="space-y-1.5 min-w-0 max-w-md">
          <h1 className="text-3xl sm:text-4xl lg:text-[2rem] font-semibold tracking-tight text-[#111111] leading-tight">
            Halo, <span className="font-serif italic font-medium text-[#0b3d2c]">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#111111]/60 leading-relaxed font-medium">
            Foto pohon yang berisiko di sekitarmu, lalu pantau status penanganannya di sini
          </p>
        </div>

        {/* Metrik Info Cepat (Card Putih Bersih di Pinggir Kanan) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-3 sm:gap-4 shrink-0 md:ml-auto">
          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[130px] sm:min-w-[145px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40 mb-1">
              Total Laporan
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#19382B] tracking-tight">
                {totalReports}
              </span>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[130px] sm:min-w-[145px] shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]/40 mb-1">
              Pohon Pengganti
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#19382B] tracking-tight">
                {totalReports * 2}
              </span>
              <span className="text-xs font-semibold text-[#111111]/40">
                Bibit
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Fokus Utama: Kamera & Tabel (ReportForm dengan Leaflet Map Picker) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full relative z-10"
      >
        <ReportForm onReportSubmitted={handleReportSubmitted} />
      </motion.div>
    </div>
  );
};
