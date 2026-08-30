"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Scan, Leaf, Recycle, Tree, Storefront } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export const FeaturesSection = () => {
  const supabase = createClient();
  const [kewajibanTanam, setKewajibanTanam] = useState<number>(6);
  const [totalPlanted, setTotalPlanted] = useState<number>(0);

  useEffect(() => {
    const fetchDynamicStats = async () => {
      try {
        // Fetch total reports count from Supabase
        const { count: reportsCount } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        const count = reportsCount ?? 0;
        const computedObligation = count > 0 ? count * 2 : 6;
        setKewajibanTanam(computedObligation);

        // Fetch total trees planted from tree_plantings
        const { data: plantings } = await supabase
          .from("tree_plantings")
          .select("tree_count");

        if (plantings) {
          const sum = plantings.reduce((acc, item) => acc + (item.tree_count || 0), 0);
          setTotalPlanted(sum);
        }
      } catch (e) {
        console.error("FeaturesSection stats error:", e);
      }
    };

    fetchDynamicStats();
  }, []);

  const progressPercent = kewajibanTanam > 0
    ? Math.min(100, Math.round((totalPlanted / kewajibanTanam) * 100))
    : 0;

  return (
    <section id="fitur" className="py-16 sm:py-24 bg-white overflow-hidden font-sans border-t border-black/5">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16"
        >
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block">
              Solusi Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.3] sm:leading-[1.25]">
              Satu Laporan <br className="hidden sm:block" />
              <span className="inline-block bg-[#ecefe6] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[#19382B] font-medium align-middle relative -top-0.5">Memberi Dampak Baik</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed pb-1">
            Melindungi warga dari bahaya, menjaga kelestarian kota, dan menghidupkan ekonomi kreatif lokal.
          </p>
        </motion.div>

        {/* ASYMMETRICAL FEATURE LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">

          {/* LEFT: Tall Organic Capsule (AI Hazard Engine) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="w-full lg:w-[40%] bg-[#f8f9f5] rounded-2xl p-4 relative overflow-hidden group min-h-[480px] lg:min-h-[640px] flex flex-col justify-end border border-black/5 shadow-sm"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url('/assets/feature_tree.svg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content Bottom */}
            <div className="relative z-10 bg-white backdrop-blur-md rounded-2xl p-6 sm:p-8 m-2 shadow-sm border border-black/5">
              <div className="w-12 h-12 rounded-full bg-[#ecefe6] flex items-center justify-center mb-5">
                <Scan size={24} className="text-[#19382B]" weight="regular" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111111] mb-2 leading-tight">
                Deteksi Cerdas &amp; Cepat
              </h3>
              <p className="text-xs text-[#111111]/60 leading-relaxed mb-6">
                Tidak perlu menunggu lama. Teknologi kami langsung menganalisis risiko dan kemiringan pohon hanya dari foto yang kamu kirim.
              </p>

              <Link href="/dashboard" className="inline-flex items-center gap-2 border border-black/20 rounded-full px-5 py-2 text-xs font-bold text-[#111111] hover:bg-[#19382B] hover:text-white transition-all">
                Coba Lapor Sekarang <ArrowUpRight size={14} weight="bold" />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT: Stacked Horizontal Cards */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6 lg:gap-8">

            {/* Right Top: Dark Premium Card (#19382B) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex-1 bg-[#19382B] text-white rounded-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group shadow-sm border border-black/5"
            >
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="space-y-4 max-w-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <Storefront size={14} className="text-[#ecefe6]" weight="duotone" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ecefe6]">
                      Ekonomi Sirkular
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    Siklus Kayu Berkelanjutan
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Kami memastikan kayu tebangan tidak terbuang sia-sia, melainkan disalurkan langsung ke UMKM lokal untuk diolah menjadi karya bernilai.
                  </p>
                </div>
              </div>

              {/* Decorative icon */}
              <div className="absolute -bottom-10 -right-10 text-white/5 rotate-12 transition-transform duration-700 group-hover:rotate-0">
                <Recycle size={180} weight="fill" />
              </div>
            </motion.div>

            {/* Right Bottom: Clean Card (#ecefe6) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-1 bg-[#ecefe6] border border-black/5 rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 group shadow-sm relative overflow-hidden cursor-pointer hover:border-[#19382B]/30 transition-all"
            >
              <Link href="/penanaman" className="absolute inset-0 z-20" />
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Tree size={16} className="text-[#19382B]" weight="fill" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">
                      Transparansi Publik
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center shrink-0 group-hover:bg-[#19382B] group-hover:border-[#19382B] group-hover:text-white text-[#111111] transition-all">
                    <ArrowUpRight size={18} weight="bold" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] leading-tight">
                  Pantau Penanaman Kembali
                </h3>
                <p className="text-xs text-[#111111]/70 leading-relaxed">
                  Setiap pohon yang ditebang akan diganti dengan bibit baru. Kamu bisa memantau langsung proses penghijauan kembali kota kita.
                </p>
              </div>

              {/* Dynamic Visual Data Card (Total Laporan x 2) */}
              <div className="w-full sm:w-auto bg-white p-5 rounded-2xl shadow-sm border border-black/5 shrink-0 flex flex-col gap-4">
                <div className="flex justify-between items-end gap-8">
                  <div>
                    <span className="text-[10px] text-[#111111]/40 font-bold uppercase tracking-widest">Kewajiban Tanam</span>
                    <div className="text-2xl font-bold text-[#111111]">
                      {kewajibanTanam.toLocaleString("id-ID")} <span className="text-xs font-normal text-[#111111]/50">pohon</span>
                    </div>
                  </div>
                  <Leaf size={24} className="text-[#19382B]" weight="duotone" />
                </div>
                <div className="w-full h-2 bg-[#ecefe6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#19382B] rounded-full relative transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};