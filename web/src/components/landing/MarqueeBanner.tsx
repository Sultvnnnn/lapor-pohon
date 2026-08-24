"use client";

import { motion } from "framer-motion";
import { ArrowsClockwise } from "@phosphor-icons/react";

export const MarqueeBanner = () => {
  const items = [
    "Cegah Pohon Tumbang di Lingkungan Kamu",
    "Deteksi Risiko Otomatis Berbasis AI YOLOv8",
    "Pemanfaatan Kayu Tebangan untuk UMKM Lokal",
    "Audit Penanaman Kembali Pohon Pengganti yang Transparan",
  ];

  return (
    <div className="w-full bg-[#DDD9FE] text-[#111111] py-4 overflow-hidden my-12 border-y border-[#111111]/10">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25,
        }}
        className="flex items-center gap-8 whitespace-nowrap w-max"
      >
        {/* Double array for seamless infinite scroll */}
        {[...items, ...items, ...items, ...items].map((text, i) => (
          <div key={i} className="flex items-center gap-6 font-semibold text-sm sm:text-base tracking-tight">
            <span>{text}</span>
            <ArrowsClockwise size={18} className="text-[#111111]/60 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
