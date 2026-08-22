"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, User, Buildings, Storefront } from "@phosphor-icons/react";

interface StakeholderItem {
  number: string;
  title: string;
  role: string;
  description: string;
  hoverClass: string;
  pillClass: string;
  icon: React.ReactNode;
  isDark?: boolean;
  href: string;
}

export const StakeholdersSection = () => {
  const stakeholders: StakeholderItem[] = [
    {
      number: "01",
      title: "Masyarakat & Warga Kota",
      role: "Mata & Pelapor Utama",
      description: "Melaporkan pohon berisiko di lingkungan sekitar secara praktis melalui HP, dan memantau respon penanganan oleh petugas.",
      hoverClass: "hover:bg-[#ecefe6]",
      pillClass: "group-hover:bg-[#19382B] group-hover:text-white",
      icon: <User size={28} className="text-[#111111]" weight="duotone" />,
      href: "/lapor",
    },
    {
      number: "02",
      title: "Dinas Pertamanan & Kota",
      role: "Pengelola & Eksekutor",
      description: "Menerima urutan laporan berdasarkan prioritas risiko AI, menerjunkan tim pemangkasan, dan menjalankan program tanam kembali.",
      hoverClass: "hover:bg-[#19382B] hover:text-white",
      pillClass: "group-hover:bg-[#88d937] group-hover:text-[#111111]",
      icon: <Buildings size={28} className="text-[#111111] group-hover:text-white transition-colors" weight="duotone" />,
      isDark: true,
      href: "/login",
    },
    {
      number: "03",
      title: "UMKM & Perajin Kayu",
      role: "Penerima Manfaat Kayu",
      description: "Menerima pasokan kayu sisa tebangan secara terukur sebagai bahan baku gratis/terjangkau untuk produk kerajinan bernilai jual tinggi.",
      hoverClass: "hover:bg-[#ecefe6]",
      pillClass: "group-hover:bg-[#19382B] group-hover:text-white",
      icon: <Storefront size={28} className="text-[#111111]" weight="duotone" />,
      href: "/register",
    },
  ];

  return (
    <section id="ekosistem" className="py-20 sm:py-32 bg-white font-sans border-t border-black/5">
      <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 sm:mb-24"
        >
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block">
              Pihak Terlibat
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.1]">
              Sinergi Warga, <br className="hidden sm:block" />
              <span className="inline-block bg-[#ecefe6] px-4 py-1 rounded-full text-[#19382B] font-medium">Pemerintah &amp; UMKM</span> Kota.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed pb-1">
            Menghubungkan masyarakat, dinas kota, dan UMKM dalam satu rantai saling menguntungkan untuk keselamatan dan ekonomi lokal.
          </p>
        </motion.div>

        {/* INTERACTIVE STAKEHOLDER LIST */}
        <div className="border-t border-black/10 flex flex-col">
          {stakeholders.map((item: StakeholderItem, index: number) => (
            <motion.a
              key={item.title}
              href={item.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group flex flex-col md:flex-row md:items-center justify-between py-10 sm:py-12 border-b border-black/10 transition-all duration-500 cursor-pointer sm:hover:px-8 ${item.hoverClass}`}
            >

              {/* Kiri: Nomor, Ikon, & Judul Utama */}
              <div className="flex items-center gap-6 sm:gap-10 mb-6 md:mb-0">
                <span className="text-sm sm:text-base font-bold text-black/20 shrink-0 group-hover:text-black/60 transition-colors">
                  {item.number}
                </span>

                <div className="flex items-center gap-5 sm:gap-8">
                  {/* Ikon Bulat */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-black/10 flex items-center justify-center shrink-0 group-hover:scale-90 group-hover:rotate-6 transition-transform duration-500 bg-white shadow-sm ${item.isDark ? 'group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20' : ''}`}>
                    {item.icon}
                  </div>

                  {/* Judul Stakeholder */}
                  <div>
                    <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111111] group-hover:tracking-normal transition-all duration-500 ${item.isDark ? 'group-hover:text-white' : ''}`}>
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kanan: Deskripsi, Peran Pill, & Panah */}
              <div className="flex items-center justify-between md:justify-end gap-8 sm:gap-12 pl-20 sm:pl-0 w-full md:w-auto">

                {/* Deskripsi & Peran */}
                <div className="flex flex-col md:items-end gap-3 max-w-sm">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white border border-black/10 text-[#111111] px-4 py-1.5 rounded-full transition-colors duration-500 shadow-sm ${item.pillClass} ${item.isDark ? 'group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30' : ''}`}>
                    {item.role}
                  </span>

                  <p className={`text-xs sm:text-[13px] text-[#111111]/60 md:text-right leading-relaxed transition-colors duration-500 ${item.isDark ? 'group-hover:text-white/70' : ''}`}>
                    {item.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className={`w-10 h-10 rounded-full border border-black/10 flex items-center justify-center bg-white text-[#111111] sm:-translate-x-4 sm:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shrink-0 ${item.isDark ? 'group-hover:bg-white group-hover:text-[#19382B]' : ''}`}>
                  <ArrowUpRight size={18} weight="bold" />
                </div>
              </div>

            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};