"use client";

import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  rotation: string;
  translate: string;
  zIndex: string;
  badge: {
    position: string;
    rotate: string;
  };
}

export const TeamSection = () => {
  const team: TeamMember[] = [
    {
      name: "Mayang Putri Mutiara",
      role: "Frontend Developer",
      image: "/assets/mayang.svg",
      rotation: "-rotate-6",
      translate: "translate-y-4 sm:translate-y-6",
      zIndex: "z-10",
      badge: {
        position: "-top-7 -left-1 sm:-top-8 sm:-left-8",
        rotate: "-rotate-3",
      },
    },
    {
      name: "Sultan Abdul Fatah",
      role: "AI & System Engineer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
      rotation: "rotate-0",
      translate: "translate-y-0",
      zIndex: "z-20",
      badge: {
        position: "-top-9 left-1/2 -translate-x-1/2",
        rotate: "rotate-1",
      },
    },
    {
      name: "Sahrul Solihin",
      role: "Fullstack Developer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
      rotation: "rotate-6",
      translate: "translate-y-6 sm:translate-y-8",
      zIndex: "z-10",
      badge: {
        position: "-bottom-3 -right-1 sm:-bottom-4 sm:-right-8",
        rotate: "rotate-3",
      },
    },
  ];

  return (
    <section
      id="tim"
      className="relative py-16 sm:py-24 overflow-hidden bg-[#f8f9f5] border-t border-black/5 font-sans"
    >
      {/* Subtle background grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #19382B 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col items-center">

        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center text-center space-y-3 mb-12 sm:mb-16"
        >
          <span className="text-[11px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-[#ecefe6] text-[#111111] inline-block">
            Tim Pengembang
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#111111] leading-[1.3] sm:leading-[1.25]">
            Meet <span className="inline-block bg-[#ecefe6] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[#19382B] font-medium align-middle relative -top-0.5">the Team</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#111111]/60 max-w-md leading-relaxed">
            Mahasiswa Institut Teknologi Tangerang Selatan (DSDC ANFORCOM 2026)
          </p>
        </motion.div>

        {/* ── DESKTOP VIEW: Fan Stacked Cards (100% Original Desktop) ── */}
        <div className="hidden sm:flex relative items-end justify-center w-full mb-10 pt-4">
          <div className="flex items-end justify-center gap-0">
            {team.map((member: TeamMember, index: number) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40, rotate: index === 0 ? -8 : index === 2 ? 8 : 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                whileHover={{ scale: 1.06, rotate: 0, zIndex: 50, y: -8 }}
                className={`
                  relative group cursor-pointer shrink-0
                  w-[190px] md:w-[230px]
                  h-[260px] md:h-[310px]
                  rounded-2xl
                  bg-white p-3
                  shadow-sm border border-black/10
                  transition-all duration-500
                  transform ${member.rotation} ${member.translate} ${member.zIndex}
                  -mx-4 md:-mx-5
                `}
              >
                {/* Floating badge */}
                <div
                  className={`
                    absolute ${member.badge.position} ${member.badge.rotate}
                    z-30 pointer-events-none
                    bg-white/95 backdrop-blur-md
                    px-4 py-2
                    rounded-full
                    shadow-sm border border-black/10
                    whitespace-nowrap
                    transition-transform duration-300 group-hover:scale-105
                  `}
                >
                  <div className="text-[11px] font-bold text-[#19382B]">
                    {member.role}
                  </div>
                  <div className="text-[9px] text-[#19382B]/60 font-medium mt-0.5">
                    {member.name.split(" ")[0]} {member.name.split(" ")[1]?.charAt(0)}.
                  </div>
                </div>

                {/* Photo */}
                <div className="w-full h-full rounded-2xl overflow-hidden bg-[#ecefe6]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── MOBILE VIEW: Vertical Card Stack (Khusus Layar HP < 640px) ── */}
        <div className="flex sm:hidden flex-col items-center gap-8 w-full mb-8 pt-2">
          {team.map((member: TeamMember, index: number) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer w-[220px] h-[280px] rounded-2xl bg-white p-2.5 shadow-sm border border-black/10 transition-all duration-500"
            >
              {/* Floating badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/10 whitespace-nowrap text-center">
                <div className="text-[10px] font-bold text-[#19382B]">{member.role}</div>
                <div className="text-[8.5px] text-[#19382B]/60 font-medium mt-0.5">{member.name}</div>
              </div>

              {/* Photo */}
              <div className="w-full h-full rounded-2xl overflow-hidden bg-[#ecefe6]">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MEMBER NAMES ROW (100% Original Desktop) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 mt-6 sm:mt-8"
        >
          {team.map((member: TeamMember, i: number) => (
            <div key={member.name} className="flex items-center gap-2 sm:gap-3">
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-[#19382B]/15" />}
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm font-bold text-[#19382B]">{member.name}</div>
                <div className="text-[10px] sm:text-xs text-[#19382B]/60 font-medium">{member.role}</div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};