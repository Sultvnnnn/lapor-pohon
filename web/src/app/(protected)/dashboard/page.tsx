"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReportForm } from "@/components/reportForm";
import {
  Tree,
  Sparkle,
  CheckCircle,
  Camera,
  Recycle,
  DeviceMobile,
  ChartLineUp,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState<string>("Pengguna");
  const [totalReports, setTotalReports] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTotalReports = async (userId: string) => {
    const { count } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setTotalReports(count ?? 0);
  };

  const fetchDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        setDisplayName(
          profile?.full_name || user.email?.split("@")[0] || "Pengguna"
        );

        await fetchTotalReports(user.id);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReportSubmitted = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      fetchTotalReports(user.id);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 pt-2 sm:pt-4 font-sans">
      {/* ── 1. Welcome Banner (Mewah & Bertekstur Radial Dot Grid) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-r from-[#19382B] via-[#234A39] to-[#19382B] text-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-9 shadow-sm relative overflow-hidden"
      >
        {/* Radial Dot Grid Texture Overlay (Acuan DESIGN.md) */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3E6B54 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#88d937] border border-white/10 shadow-xs">
              <Sparkle size={14} weight="fill" />
              <span>Sistem Pemindai Pohon AI & Sirkularitas</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Halo, {displayName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Gunakan perangkat HP Anda untuk memotret lokasi pohon rawan tumbang secara live di lokasi, atau pantau perkembangan laporan Anda melalui Tab <strong>Laporan Saya</strong>.
            </p>
          </div>

          {/* Quick Counter Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#88d937] text-[#19382B] flex items-center justify-center shadow-xs">
              <Tree size={26} weight="fill" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                Total Laporan
              </p>
              <p className="text-2xl font-extrabold text-white">
                {isLoading ? "..." : totalReports} <span className="text-xs font-semibold text-[#88d937]">Laporan</span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Decorative Graphic Element */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden sm:block"
        >
          <Tree size={260} weight="fill" />
        </motion.div>
      </motion.div>

      {/* ── 2. Main Grid Content (Formulir Scanner Kamera & Progress Laporan) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (7 cols): Report Form (Live Scan / Progress Tabs) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6"
        >
          <ReportForm onReportSubmitted={handleReportSubmitted} />
        </motion.div>

        {/* Right Column (5 cols): Guidelines & Workflow Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Card 1: Tips Pemindaian HP & Monitoring Desktop */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/5 shadow-xs space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-2xl bg-[#19382B]/10 text-[#19382B] flex items-center justify-center shrink-0 shadow-xs">
                <DeviceMobile size={19} weight="fill" />
              </div>
              <h3 className="font-bold text-[#111111] text-sm sm:text-base tracking-tight">
                Alur Pelaporan & Monitoring
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-[#111111]/70 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle size={17} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>
                  <strong>Lapor dari HP di Lokasi:</strong> Buka web LaporPohon di smartphone, potret pohon rawan tumbang secara live. Lokasi GPS direkam secara otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={17} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>
                  <strong>Pantau Progress di HP/Desktop:</strong> Buka Tab <em>Laporan Saya</em> untuk melihat status verifikasi DLH & pemanfaatan kayu sirkular.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={17} weight="fill" className="text-[#19382B] shrink-0 mt-0.5" />
                <span>
                  <strong>Deteksi Presisi AI:</strong> Sistem AI YOLOv8 langsung menganalisis tingkat kerawanan dan estimasi volume kayu sirkular.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Alur Sirkular LaporPohon */}
          <div className="bg-[#19382B] text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 relative overflow-hidden">
            {/* Texture background overlay */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #3E6B54 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-9 h-9 rounded-2xl bg-[#88d937]/20 text-[#88d937] flex items-center justify-center shrink-0 shadow-xs">
                  <Recycle size={19} weight="fill" />
                </div>
                <h3 className="font-bold text-white text-sm sm:text-base tracking-tight">
                  Alur Sirkular LaporPohon
                </h3>
              </div>

              <div className="space-y-4 text-xs text-white/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#19382B] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Deteksi AI Risk Score</p>
                    <p className="text-[11px] text-white/70">
                      Sistem mendeteksi kerapuhan dan potensi pohon rawan tumbang.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#19382B] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Verifikasi & Penanganan DLH</p>
                    <p className="text-[11px] text-white/70">
                      Petugas melakukan tindak lanjut perapihan / penebangan pohon berisiko.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#19382B] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Penyaluran ke UMKM Kayu</p>
                    <p className="text-[11px] text-white/70">
                      Limbah hasil penebangan diolah kembali menjadi produk kayu bernilai tinggi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
