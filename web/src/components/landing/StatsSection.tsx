"use client";

import { motion } from "framer-motion";
import { Tree, Barbell, Lightning, Plant } from "@phosphor-icons/react";

export const StatsSection = () => {
  const stats = [
    {
      icon: Tree,
      value: "1,240+",
      label: "Laporan Terverifikasi",
      subtext: "Dianalisis presisi oleh AI YOLOv8",
      color: "text-[#19382B]",
      bgColor: "bg-white",
    },
    {
      icon: Barbell,
      value: "18.5 Ton",
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
      value: "2,480+",
      label: "Pohon Pengganti",
      subtext: "Komitmen penanaman bibit baru",
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
                  className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex flex-col justify-between"
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
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-white/90">{stat.label}</p>
                    <p className="text-xs text-white/70 mt-1">{stat.subtext}</p>
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
