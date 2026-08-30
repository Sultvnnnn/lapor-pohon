"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tree,
  X,
  Camera,
  CircleNotch,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { uploadReportImage } from "@/lib/storageUtils";
import type { TreePlantingItem } from "./PenanamanClient";

interface CreatePlantingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: TreePlantingItem | null;
}

const speciesOptions = [
  "Bibit Mahoni",
  "Bibit Tabebuya Pink",
  "Bibit Tabebuya Kuning",
  "Bibit Trembesi",
  "Bibit Ketapang Kencana",
  "Bibit Mawar & Tanaman Hias",
];

export function CreatePlantingModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}: CreatePlantingModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [treeCount, setTreeCount] = useState<number>(2);
  const [treeSpecies, setTreeSpecies] = useState("Bibit Mahoni");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isSpeciesDropdownOpen, setIsSpeciesDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setLocationName(editingItem.location_name || "");
      setTreeCount(editingItem.tree_count || 2);
      setTreeSpecies(editingItem.tree_species || "Bibit Mahoni");
      setPreviewUrl(editingItem.image_url || null);
      setSelectedFile(null);
    } else {
      setTitle("");
      setLocationName("");
      setTreeCount(2);
      setTreeSpecies("Bibit Mahoni");
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [editingItem, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Judul kegiatan penanaman wajib diisi.");
      return;
    }
    if (!locationName.trim()) {
      setErrorMessage("Lokasi penanaman wajib diisi.");
      return;
    }
    if (!selectedFile && !previewUrl) {
      setErrorMessage("Foto dokumentasi kegiatan penanaman wajib diunggah.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let imageUrl = previewUrl || "";

      if (selectedFile) {
        const uploaded = await uploadReportImage(selectedFile);
        if (uploaded) {
          imageUrl = uploaded;
        } else {
          throw new Error("Gagal mengunggah foto kegiatan.");
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (editingItem) {
        const { error } = await supabase
          .from("tree_plantings")
          .update({
            title: title.trim(),
            location_name: locationName.trim(),
            tree_count: Number(treeCount) || 2,
            tree_species: treeSpecies.trim() || "Bibit Mahoni",
            image_url: imageUrl,
          })
          .eq("id", editingItem.id);

        if (error) {
          console.error("Update planting error:", error);
          throw new Error(error.message || "Gagal memperbarui data penanaman.");
        }
      } else {
        const { error } = await supabase.from("tree_plantings").insert({
          title: title.trim(),
          caption: null,
          location_name: locationName.trim(),
          tree_count: Number(treeCount) || 2,
          tree_species: treeSpecies.trim() || "Bibit Mahoni",
          image_url: imageUrl,
          created_by: user?.id || null,
          likes_count: 0,
        });

        if (error) {
          console.error("Insert planting error:", error);
          throw new Error(error.message || "Gagal menyimpan data penanaman.");
        }
      }

      // Reset Form State
      setTitle("");
      setLocationName("");
      setTreeCount(2);
      setSelectedFile(null);
      setPreviewUrl(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan kegiatan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-3.5 sm:p-6 pt-14 sm:pt-6 pb-6 bg-black/75 backdrop-blur-md font-sans pointer-events-auto overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white border border-black/10 rounded-[2rem] sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 overflow-y-auto max-h-[85vh] sm:max-h-[90vh] my-auto font-sans"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-black/5 pb-3 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#19382B] text-white flex items-center justify-center font-extrabold shadow-2xs shrink-0">
              <Tree size={18} weight="fill" className="text-[#88d937]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-extrabold text-[#111111] tracking-tight font-sans leading-snug truncate sm:whitespace-normal">
                {editingItem ? "Edit Dokumentasi Tanam Pohon" : "Dokumentasi Tanam Pohon"}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium font-sans truncate sm:whitespace-normal">
                {editingItem ? "Perbarui informasi penanaman pohon pengganti." : "Publikasikan kegiatan penanaman pohon baru."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ecefe6] hover:bg-gray-200 text-[#111111]/70 hover:text-[#111111] flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-1 mt-0.5"
            title="Tutup Modal"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-bold border border-red-200 font-sans">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs font-sans">
          {/* Upload Foto Preview Container */}
          <div>
            <label className="block text-xs font-extrabold text-[#111111] mb-1.5 font-sans">
              Foto Dokumentasi Kegiatan <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden border border-black/10 group bg-black/5">
                <img
                  src={previewUrl}
                  alt="Preview penanaman"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/90 text-[#111111] px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-white cursor-pointer font-sans"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 sm:h-36 border-2 border-dashed border-black/15 hover:border-[#19382B] rounded-2xl bg-[#f8f9f5] hover:bg-[#ecefe6]/50 flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-gray-500 hover:text-[#19382B] p-3"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#19382B]/10 text-[#19382B] flex items-center justify-center shrink-0">
                  <Camera size={18} weight="bold" />
                </div>
                <span className="font-extrabold text-xs text-[#111111] font-sans text-center">Klik untuk unggah foto kegiatan</span>
                <span className="text-[10px] text-gray-400 font-medium font-sans text-center">Format JPG, PNG (Maks 10MB)</span>
              </button>
            )}
          </div>

          {/* Judul Kegiatan */}
          <div>
            <label className="block text-xs font-extrabold text-[#111111] mb-1 font-sans">
              Judul Kegiatan Penanaman <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Penanaman 2 Bibit Mahoni di Taman Menteri Supeno"
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-bold text-[#111111] focus:outline-none focus:border-[#19382B] font-sans text-xs"
            />
          </div>

          {/* Grid 2 Kolom: Jumlah Pohon & Jenis Bibit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
            <div>
              <label className="block text-xs font-extrabold text-[#111111] mb-1 font-sans">
                Jumlah Pohon Ditanam <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={treeCount}
                onChange={(e) => setTreeCount(Number(e.target.value))}
                className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-extrabold text-[#19382B] focus:outline-none focus:border-[#19382B] font-sans text-xs"
              />
              <span className="text-[10px] text-gray-400 font-medium block pt-0.5 font-sans">
                Otomatis mengurangi sisa kewajiban tanam kota.
              </span>
            </div>

            {/* Custom Dropdown for Jenis Bibit Pohon */}
            <div>
              <label className="block text-xs font-extrabold text-[#111111] mb-1 font-sans">
                Jenis Bibit Pohon <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSpeciesDropdownOpen(!isSpeciesDropdownOpen)}
                  className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-bold text-[#111111] focus:outline-none focus:border-[#19382B] cursor-pointer font-sans text-xs flex items-center justify-between gap-2 shadow-2xs hover:bg-[#ecefe6]/50 transition-colors"
                >
                  <span className="truncate">{treeSpecies || "Pilih Jenis Bibit"}</span>
                  <CaretDown
                    size={14}
                    weight="bold"
                    className={`text-gray-500 transition-transform duration-200 shrink-0 ${
                      isSpeciesDropdownOpen ? "rotate-180 text-[#19382B]" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isSpeciesDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsSpeciesDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1 z-40 bg-white border border-black/10 rounded-2xl shadow-xl p-1.5 space-y-1 font-sans max-h-48 overflow-y-auto"
                      >
                        {speciesOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setTreeSpecies(option);
                              setIsSpeciesDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              treeSpecies === option
                                ? "bg-[#19382B] text-white font-extrabold"
                                : "text-[#111111] hover:bg-[#f8f9f5]"
                            }`}
                          >
                            <span>{option}</span>
                            {treeSpecies === option && (
                              <Check size={14} weight="bold" className="text-[#88d937]" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Lokasi Penanaman */}
          <div>
            <label className="block text-xs font-extrabold text-[#111111] mb-1 font-sans">
              Lokasi Penanaman <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Contoh: Taman Indonesia Kaya, Semarang Selatan"
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-semibold text-[#111111] focus:outline-none focus:border-[#19382B] font-sans text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 sm:pt-3 flex items-center gap-3 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer transition-all font-sans"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 sm:py-3 rounded-full text-xs font-extrabold bg-[#19382B] text-white hover:bg-[#234A39] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 active:scale-95 font-sans"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch size={16} className="animate-spin text-[#88d937]" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>{editingItem ? "Simpan Perubahan" : "Publikasikan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
