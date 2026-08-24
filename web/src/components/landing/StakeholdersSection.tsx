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
      role: "Pelapor & Pemantau",
      description: "Cukup pakai HP untuk melaporkan pohon rawan tumbang di sekitarmu, lalu pantau status penanganannya secara langsung.",
      hoverClass: "hover:bg-[#ecefe6]",
      pillClass: "group-hover:bg-[#19382B] group-hover:text-white",
      icon: <User size={28} className="text-[#111111]" weight="duotone" />,
      href: "/dashboard",
    },
    {
      number: "02",
      title: "Dinas Lingkungan & Kota",
      role: "Eksekutor Cepat",
      description: "Menerima laporan yang sudah diurutkan berdasarkan tingkat bahaya, sehingga tim bisa langsung menindak dan melakukan penanaman kembali.",
      hoverClass: "hover:bg-[#19382B] hover:text-white",
      pillClass: "group-hover:bg-[#88d937] group-hover:text-[#111111]",
      icon: <Buildings size={28} className="text-[#111111] group-hover:text-white transition-colors" weight="duotone" />,
      isDark: true,
      href: "/login",
    },
    {
      number: "03",
      title: "UMKM & Perajin Kayu",
      role: "Penggerak Ekonomi",
      description: "Memanfaatkan kayu sisa tebangan menjadi bahan baku kerajinan. Lingkungan bersih, ekonomi kreatif pun terbantu.",
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.3] sm:leading-[1.25]">
              Kolaborasi Warga, <br className="hidden sm:block" />
              <span className="inline-block bg-[#ecefe6] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[#19382B] font-medium align-middle relative -top-0.5">Pemerintah &amp; UMKM.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed pb-1">
            Menyatukan kepedulian warga, aksi cepat pemerintah, dan kreativitas UMKM untuk kota yang lebih aman dan berdaya.
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
              className={`group flex flex-col md:flex-row md:items-center justify-between py-6 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 border-b border-black/10 transition-all duration-500 cursor-pointer sm:hover:px-8 ${item.hoverClass}`}
            >

              {/* Kiri: Nomor, Ikon, & Judul Utama */}
              <div className="flex items-center gap-3.5 sm:gap-6 md:gap-10 mb-4 md:mb-0">
                <span className={`text-xs sm:text-base font-bold shrink-0 transition-colors ${item.isDark ? 'text-black/30 group-hover:text-white/70' : 'text-black/30 group-hover:text-black/60'}`}>
                  {item.number}
                </span>

                <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
                  {/* Ikon Bulat */}
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border border-black/10 flex items-center justify-center shrink-0 group-hover:scale-90 group-hover:rotate-6 transition-transform duration-500 bg-white shadow-sm ${item.isDark ? 'group-hover:bg-white/10 group-hover:text-white group-hover:border-white/20' : ''}`}>
                    {item.icon}
                  </div>

                  {/* Judul Stakeholder */}
                  <div>
                    <h3 className={`text-base sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#111111] group-hover:tracking-normal transition-all duration-500 ${item.isDark ? 'group-hover:text-white' : ''}`}>
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Kanan: Deskripsi, Peran Pill, & Panah */}
              <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-8 md:gap-12 w-full md:w-auto pt-3 md:pt-0">

                {/* Deskripsi & Peran */}
                <div className="flex flex-col md:items-end gap-2 sm:gap-3 max-w-sm">
                  <span className={`self-start md:self-end text-[9px] sm:text-xs font-bold uppercase tracking-widest bg-white border border-black/10 text-[#111111] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-colors duration-500 shadow-sm ${item.pillClass} ${item.isDark ? 'group-hover:bg-white/20 group-hover:text-white group-hover:border-white/30' : ''}`}>
                    {item.role}
                  </span>

                  <p className={`text-[11px] sm:text-[13px] text-[#111111]/70 md:text-right leading-relaxed transition-colors duration-500 ${item.isDark ? 'group-hover:text-white/70' : ''}`}>
                    {item.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/10 flex items-center justify-center bg-white text-[#111111] sm:-translate-x-4 sm:opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 shrink-0 ${item.isDark ? 'group-hover:bg-white group-hover:text-[#19382B]' : ''}`}>
                  <ArrowUpRight size={16} weight="bold" />
                </div>
              </div>

            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};