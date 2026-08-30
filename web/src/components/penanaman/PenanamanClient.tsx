"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tree,
  Heart,
  MapPin,
  Plus,
  X,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { CreatePlantingModal } from "./CreatePlantingModal";

export interface TreePlantingItem {
  id: string;
  title: string;
  caption?: string;
  location_name: string;
  tree_count: number;
  tree_species: string;
  image_url: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

interface PenanamanClientProps {
  initialPlantings: TreePlantingItem[];
  totalReportsCount?: number;
}

export function PenanamanClient({
  initialPlantings,
  totalReportsCount = 0,
}: PenanamanClientProps) {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [plantings, setPlantings] = useState<TreePlantingItem[]>(initialPlantings);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [dynamicReportsCount, setDynamicReportsCount] = useState<number>(totalReportsCount);

  // Lightbox, Menu, & Admin Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TreePlantingItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TreePlantingItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Local device liked postings tracking
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("liked_tree_plantings");
      if (saved) {
        setLikedIds(new Set(JSON.parse(saved)));
      }
    } catch (e) {}

    const checkAdminAndStats = async () => {
      try {
        // Fetch total reports count dynamically if not provided
        const { count } = await supabase
          .from("reports")
          .select("*", { count: "exact", head: true });

        if (count !== null && count !== undefined && count > 0) {
          setDynamicReportsCount(count);
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (profile && String(profile.role).toLowerCase().trim() === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (e) {}
    };

    checkAdminAndStats();
  }, []);

  const fetchPlantings = async () => {
    try {
      const { data } = await supabase
        .from("tree_plantings")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setPlantings(data as TreePlantingItem[]);
      }
    } catch (e) {
      console.error("Fetch plantings error:", e);
    }
  };

  // Confirm delete planting item (Admin Only)
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("tree_plantings")
        .delete()
        .eq("id", deletingItem.id);

      if (error) {
        throw error;
      }

      setDeletingItem(null);
      await fetchPlantings();
    } catch (e: any) {
      console.error("Delete error:", e);
      alert(e.message || "Gagal menghapus data penanaman.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Target Kewajiban Tanam = Total Laporan x 2
  const targetKewajiban = dynamicReportsCount > 0 ? dynamicReportsCount * 2 : 6;
  const totalPlanted = plantings.reduce((sum, item) => sum + (item.tree_count || 0), 0);
  const progressPercent = targetKewajiban > 0
    ? Math.min(100, Math.round((totalPlanted / targetKewajiban) * 100))
    : 100;

  // Filter logic
  const filteredPlantings = plantings.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.location_name.toLowerCase().includes(query) ||
      item.tree_species.toLowerCase().includes(query) ||
      (item.caption && item.caption.toLowerCase().includes(query))
    );
  });

  // Like Button Handler (Tanpa Animasi Bouncing)
  const handleToggleLike = async (item: TreePlantingItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isLiked = likedIds.has(item.id);
    const newSet = new Set(likedIds);
    let newCount = item.likes_count || 0;

    if (isLiked) {
      newSet.delete(item.id);
      newCount = Math.max(0, newCount - 1);
    } else {
      newSet.add(item.id);
      newCount += 1;
    }

    setLikedIds(newSet);
    try {
      localStorage.setItem("liked_tree_plantings", JSON.stringify(Array.from(newSet)));
    } catch (e) {}

    setPlantings((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, likes_count: newCount } : p))
    );

    try {
      await supabase
        .from("tree_plantings")
        .update({ likes_count: newCount })
        .eq("id", item.id);
    } catch (e) {}
  };

  // Exact Indonesian Timestamp Formatter: e.g., "30 Ags 2026 18:36"
  const formatDateTimestamp = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const monthsShort = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
      ];
      const month = monthsShort[date.getMonth()];
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div
      className="w-full max-w-[720px] mx-auto space-y-8 sm:space-y-10 font-sans selection:bg-[#19382B] selection:text-white pt-0"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── 1. Centered Editorial Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-xl mx-auto pt-0 font-sans"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight font-sans">
          Penanaman <span className="font-serif italic font-medium text-[#19382B]">Kembali</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#111111]/70 leading-relaxed font-medium max-w-lg mx-auto font-sans px-2">
          Pantau langsung dokumentasi kegiatan penanaman pohon. Setiap 1 laporan pohon ditangani akan diganti dengan 2 bibit baru.
        </p>

        {/* ── 2. Minimalist Progress Bar (Dynamic Total Reports x 2) ── */}
        <div className="w-full max-w-md mx-auto space-y-2 pt-4 text-left font-sans px-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-extrabold text-[#111111] font-sans">
              Progres penanaman
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-[#19382B] font-sans">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Track & Dark Green Fill */}
          <div className="w-full h-2 bg-[#f0f2eb] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#19382B] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Progress Footer: Ditanam: N / Total Kewajiban (Semua Laporan x 2) */}
          <div className="text-right text-xs text-gray-500 font-medium pt-0.5 font-sans">
            Ditanam: <strong className="text-[#111111] font-bold">{totalPlanted.toLocaleString("id-ID")} / {targetKewajiban.toLocaleString("id-ID")} pohon</strong>
          </div>
        </div>

        {/* ── 3. Search Bar & Admin Add Data Button (Sejajar 1 Baris) ── */}
        <div className="pt-2 flex flex-row items-center justify-center gap-2.5 w-full max-w-md mx-auto font-sans px-1">
          {/* Search Pill */}
          <div className="relative flex-1 min-w-0 bg-[#f8f9f5] border border-black/10 rounded-full p-1.5 pl-4 pr-1.5 flex items-center justify-between gap-1.5 focus-within:border-[#19382B] focus-within:bg-white transition-all shadow-2xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau penanaman..."
              className="w-full bg-transparent text-xs font-semibold text-[#111111] placeholder:text-[#111111]/40 focus:outline-none font-sans min-w-0"
            />
            <div className="w-7 h-7 rounded-full bg-[#111111] text-[#ecefe6] flex items-center justify-center shrink-0 shadow-2xs">
              <MagnifyingGlass size={13} weight="bold" />
            </div>
          </div>

          {/* Admin Add Posting Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreateModalOpen(true);
              }}
              className="bg-[#19382B] hover:bg-[#234A39] text-white px-4 sm:px-5 py-2.5 rounded-full text-xs font-extrabold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-black/5 shrink-0 font-sans"
            >
              <Plus size={14} weight="bold" className="text-[#88d937]" />
              <span>Posting</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ── 4. Single-Column Centered Feed (100% Mobile Responsive) ── */}
      <div className="w-full space-y-8 sm:space-y-10 pt-2 font-sans">
        {filteredPlantings.length === 0 ? (
          <div className="bg-[#f8f9f5] border border-black/8 rounded-3xl p-12 text-center space-y-3 shadow-2xs w-full font-sans">
            <div className="w-12 h-12 rounded-full bg-[#ecefe6] text-[#19382B] flex items-center justify-center mx-auto shadow-2xs">
              <Tree size={24} weight="fill" />
            </div>
            <p className="text-xs text-gray-500 font-medium leading-relaxed font-sans">
              {searchQuery ? "Tidak ada kegiatan penanaman yang cocok dengan kata kunci." : "Belum ada dokumentasi penanaman saat ini."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 sm:gap-10 w-full font-sans">
            {filteredPlantings.map((item) => {
              const isLiked = likedIds.has(item.id);
              const formattedDate = formatDateTimestamp(item.created_at);
              const isMenuOpen = activeMenuId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-[720px] relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-black/10 transition-all duration-500 group flex flex-col justify-end bg-[#19382B] aspect-[4/5] sm:aspect-[3/4] font-sans"
                >
                  {/* Full Photo Background Container */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Gradient Overlay for High-Contrast Text Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

                  {/* ── TOP ROW FLOATING GLASS BADGES ── */}
                  <div className="absolute top-4 left-4 right-4 sm:top-5 sm:left-5 sm:right-5 z-20 flex items-center justify-between gap-2 font-sans">
                    {/* Top-Left Floating Glass Pill Badge: "+N Pohon Ditanam" */}
                    <div className="bg-black/35 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 shadow-md flex items-center gap-1.5 truncate max-w-[60%] sm:max-w-none">
                      <span>+{item.tree_count} Pohon Ditanam</span>
                    </div>

                    {/* Top-Right Floating Controls (Love + Admin 3-Dots Menu) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 relative">
                      {/* Top-Right Glass Heart & Likes Count Pill Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(item, e)}
                        className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-full backdrop-blur-md border flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold transition-all cursor-pointer active:scale-95 ${
                          isLiked
                            ? "bg-red-500/90 text-white border-red-400"
                            : "bg-black/35 hover:bg-black/50 text-white border-white/25"
                        }`}
                        title="Suka / Apresiasi"
                      >
                        <Heart
                          size={17}
                          weight={isLiked ? "fill" : "bold"}
                          className="text-white"
                        />
                        <span>{item.likes_count || 0}</span>
                      </button>

                      {/* Admin 3-Dots Menu Trigger Button */}
                      {isAdmin && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : item.id);
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md border border-white/25 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                            title="Opsi Admin"
                          >
                            <DotsThreeVertical size={18} weight="bold" />
                          </button>

                          {/* Admin Dropdown Popup Menu */}
                          <AnimatePresence>
                            {isMenuOpen && (
                              <>
                                {/* Click outside backdrop */}
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                  }}
                                />

                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-11 sm:top-12 z-40 bg-[#111111]/90 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-1.5 shadow-2xl w-36 space-y-1 font-sans"
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setEditingItem(item);
                                      setIsCreateModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/15 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <PencilSimple size={15} weight="bold" className="text-[#88d937]" />
                                    <span>Edit Data</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setDeletingItem(item);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Trash size={15} weight="bold" />
                                    <span>Hapus Data</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── BOTTOM OVERLAID TEXT DIRECTLY ON PHOTO (RESPONSIVE) ── */}
                  <div className="relative z-20 p-4 sm:p-7 space-y-2.5 text-white font-sans">
                    <div className="space-y-1">
                      {/* Main Title Overlaid on Photo */}
                      <h3 className="text-xl sm:text-3xl font-black text-white leading-snug drop-shadow-md tracking-tight font-sans line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Location Subtitle Overlaid on Photo */}
                      <p className="text-xs sm:text-sm text-white/85 font-semibold flex items-center gap-1.5 drop-shadow-xs font-sans truncate">
                        <MapPin size={15} weight="bold" className="text-[#88d937] shrink-0" />
                        <span className="truncate">{item.location_name}</span>
                      </p>
                    </div>

                    {/* Meta Badges Row: Species & Timestamp Sitting Side-by-Side Flexibly */}
                    <div className="flex flex-row items-center justify-between gap-2 pt-1 font-sans text-xs w-full">
                      {/* Species Badge */}
                      <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20 font-bold shadow-xs flex items-center gap-1.5 text-[11px] sm:text-xs truncate min-w-0 flex-1 max-w-[60%] sm:max-w-none">
                        <Tree size={13} weight="fill" className="text-[#88d937] shrink-0" />
                        <span className="truncate">{item.tree_species || "Bibit Trembesi"}</span>
                      </span>

                      {/* Timestamp Badge */}
                      <span className="bg-black/30 backdrop-blur-md text-white/90 px-3.5 py-1 rounded-full border border-white/15 text-[10px] sm:text-[11px] font-semibold shrink-0 font-sans tracking-wide">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Create / Edit Planting Modal */}
      {isAdmin && (
        <CreatePlantingModal
          isOpen={isCreateModalOpen}
          editingItem={editingItem}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={fetchPlantings}
        />
      )}

      {/* Admin Delete Confirmation Modal */}
      {mounted && deletingItem && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md font-sans">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-black/10">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
                <Trash size={24} weight="bold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#111111] tracking-tight font-sans">Hapus Dokumentasi?</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed font-sans">
                  Data penanaman &ldquo;{deletingItem.title}&rdquo; akan dihapus secara permanen.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer transition-all font-sans"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-full text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 font-sans"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Lightbox Zoom Modal */}
      {mounted && zoomImage && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-sans">
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setZoomImage(null)}
            />
            <div className="relative z-10 w-full max-w-4xl">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="absolute -top-12 right-0 sm:-right-12 z-20 w-10 h-10 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={24} weight="bold" />
              </button>
              <img
                src={zoomImage}
                alt="Diperbesar"
                className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/15"
              />
            </div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}