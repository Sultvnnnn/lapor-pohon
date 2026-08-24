"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

export const WorkflowSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const steps = [
    {
      step: "01",
      total: "/04",
      title: "Jepret & Laporkan",
      subtitle: "Temukan pohon rawan? Foto saja pakai HP Anda. Lokasi akan terdeteksi secara otomatis.",
      pill: "1. Pelaporan",
      image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop",
    },
    {
      step: "02",
      total: "/04",
      title: "Analisis Cerdas",
      subtitle: "Sistem kami akan langsung menghitung tingkat kemiringan dan potensi bahayanya dalam hitungan detik.",
      pill: "2. Deteksi Cerdas",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop",
    },
    {
      step: "03",
      total: "/04",
      title: "Penanganan Cepat",
      subtitle: "Petugas menerima data prioritas dan langsung meluncur ke lokasi untuk melakukan penanganan.",
      pill: "3. Penanganan",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop",
    },
    {
      step: "04",
      total: "/04",
      title: "Daur Ulang & Tanam Baru",
      subtitle: "Kayu sisa disalurkan ke UMKM, dan petugas menanam bibit baru sebagai ganti pohon yang ditebang.",
      pill: "4. Daur Ulang & Tanam",
      image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop",
    },
  ];

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const centerPosition = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      if (index < steps.length) {
        const htmlChild = child as HTMLElement;
        const childCenter = htmlChild.offsetLeft + htmlChild.clientWidth / 2;
        const distance = Math.abs(centerPosition - childCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });

    setActiveIndex(closestIndex);
  };

  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const targetChild = container.children[index] as HTMLElement;
    if (targetChild) {
      const scrollLeft = targetChild.offsetLeft - (container.clientWidth - targetChild.clientWidth) / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    const newIndex = direction === "left" ? Math.max(0, activeIndex - 1) : Math.min(steps.length - 1, activeIndex + 1);
    scrollTo(newIndex);
  };

  return (
    <section id="alur" className="py-16 sm:py-24 bg-[#f8f9f5] overflow-hidden font-sans">
      <div className="w-full max-w-[1300px] mx-auto relative">

        {/* SECTION HEADER */}
        <div className="px-4 sm:px-8 lg:px-12 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-3 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block">
                Cara Kerja
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.3] sm:leading-[1.25]">
                4 Langkah Mudah <br className="hidden sm:block" />
                <span className="inline-block bg-[#ecefe6] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[#19382B] font-medium align-middle relative -top-0.5">LaporPohon.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed pb-1">
              Dari jepretan kamera hingga jadi karya. Semua proses berjalan transparan untuk keamanan bersama.
            </p>
          </motion.div>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative w-full group">

          {/* Tombol Navigasi Kiri */}
          <button
            onClick={() => scrollNav("left")}
            disabled={activeIndex === 0}
            className={`absolute left-4 sm:left-10 top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/10 flex items-center justify-center text-[#111111] hover:bg-white hover:scale-110 transition-all hidden sm:flex opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
            aria-label="Geser ke kiri"
          >
            <ArrowLeft size={20} weight="bold" />
          </button>

          {/* Tombol Navigasi Kanan */}
          <button
            onClick={() => scrollNav("right")}
            disabled={activeIndex === steps.length - 1}
            className={`absolute right-4 sm:right-10 top-[45%] -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-black/10 flex items-center justify-center text-[#111111] hover:bg-white hover:scale-110 transition-all hidden sm:flex opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed`}
            aria-label="Geser ke kanan"
          >
            <ArrowRight size={20} weight="bold" />
          </button>

          {/* Horizontal Scroll Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 lg:gap-10 py-6 sm:py-8 px-[7.5vw] sm:px-[calc(50%-160px)] lg:px-[calc(50%-200px)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center"
          >
            {steps.map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0.3, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{
                  root: scrollContainerRef,
                  margin: "0% -35% 0% -35%",
                  amount: "some"
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col w-[85vw] sm:w-[320px] lg:w-[400px] shrink-0 snap-center group/card cursor-grab active:cursor-grabbing shadow-sm border border-black/5 hover:shadow-md transition-shadow duration-300 rounded-[1.5rem] sm:rounded-[2rem] bg-white transform-gpu origin-center"
              >
                {/* Image Section */}
                <div className="relative h-[320px] sm:h-[280px] lg:h-[320px] w-full rounded-t-[1.5rem] sm:rounded-t-[2rem] overflow-hidden bg-gray-100">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-110"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Pill Tag */}
                  <div className="absolute top-5 left-5">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm">
                      {item.pill}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-5 left-5 pr-5">
                    <h3 className="text-xl sm:text-2xl font-medium text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Text Section */}
                <div className="bg-white rounded-b-[1.5rem] sm:rounded-b-[2rem] p-5 sm:p-6 flex items-start sm:items-center justify-between gap-3 border border-t-0 border-black/5">
                  <div className="flex items-baseline font-medium text-[#111111] shrink-0">
                    <span className="text-3xl sm:text-4xl leading-none">{item.step}</span>
                    <span className="text-xs sm:text-sm text-[#111111]/40 ml-1">{item.total}</span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-[#111111]/60 leading-relaxed text-right max-w-[180px] sm:max-w-[200px]">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Spacer ekstra */}
            <div className="w-[4vw] sm:w-[10vw] shrink-0" aria-hidden="true" />
          </div>

        </div>

        {/* DOTS INDICATOR */}
        <div className="flex items-center justify-center gap-2 mt-2 sm:mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${activeIndex === index
                ? "w-8 bg-[#111111]"
                : "w-2 bg-[#111111]/20 hover:bg-[#111111]/40"
                }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};