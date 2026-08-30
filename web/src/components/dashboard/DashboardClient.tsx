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
      {/* ── 1. Header Minimalis (Welcome Text) ── */}
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
            Mari bantu jaga lingkungan dengan melaporkan pohon berisiko di sekitarmu
          </p>
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
