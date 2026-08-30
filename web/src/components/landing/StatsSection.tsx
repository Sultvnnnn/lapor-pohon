"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tree, Barbell, Lightning, Plant } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export const StatsSection = () => {
  const supabase = createClient();
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [plantedCount, setPlantedCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        if (count !== null && count !== undefined) {
          setReportsCount(count);
        }

        const { data: plantings } = await supabase
          .from("tree_plantings")
          .select("tree_count");

        if (plantings) {
          const sum = plantings.reduce((acc, p) => acc + (p.tree_count || 0), 0);
          setPlantedCount(sum);
        }
      } catch (e) {}
    };

    fetchStats();
  }, []);

  const totalObligation = reportsCount > 0 ? reportsCount * 2 : 6;

  const stats = [
    {
      icon: Tree,
      value: `${reportsCount > 0 ? reportsCount.toLocaleString("id-ID") : "3"} Laporan`,
      label: "Laporan Terdaftar",
      subtext: "Dianalisis presisi oleh Sistem AI Radar Pohon",
      color: "text-[#19382B]",
      bgColor: "bg-white",
    },
    {
      icon: Barbell,
      value: "100%",
      label: "Kayu Dimanfaatkan",
      subtext: "Disalurkan ke UMKM perajin lokal",
      color: "text-[#C87443]",
      bgColor: "bg-white",
    },
    {
      icon: Lightning,
      value: "< 2 Jam",
      label: "Respon Cepat",
      subtext: "Tindakan mitigasi bahaya di lapangan",
      color: "text-amber-700",
      bgColor: "bg-white",
    },
    {
      icon: Plant,
      value: `${totalObligation.toLocaleString("id-ID")} Pohon`,
      label: "Target Pohon Pengganti",
      subtext: "Komitmen penanaman 2 bibit baru per laporan",
      color: "text-emerald-700",
      bgColor: "bg-white",
    },
  ];

  return (
    <section className="py-12 bg-white overflow-hidden relative font-sans">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="py-12 px-6 sm:px-10 lg:px-12 bg-[#19382B] text-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden relative">
          {/* Background Accent Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#3E6B54_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex flex-col justify-between font-sans"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                      <Icon size={22} className={stat.color} weight="fill" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#88d937]">
                      Data Real-time
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 font-sans">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-white/90 font-sans">{stat.label}</p>
                    <p className="text-xs text-white/70 mt-1 font-sans">{stat.subtext}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
