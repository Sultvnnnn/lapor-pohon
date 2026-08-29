"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Storefront, X } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface UmkmProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function UmkmProfileModal({
  isOpen,
  onClose,
  userEmail,
}: UmkmProfileModalProps) {
  const supabase = createClient();
  const [businessName, setBusinessName] = useState("Kerajinan Kayu Mutiara Jati");
  const [businessType, setBusinessType] = useState("Kerajinan Kayu & Ukir");
  const [phone, setPhone] = useState("0812-3456-7890");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const savedName = localStorage.getItem("umkm_business_name");
    const savedType = localStorage.getItem("umkm_business_type");
    const savedPhone = localStorage.getItem("umkm_phone");
    if (savedName) setBusinessName(savedName);
    if (savedType) setBusinessType(savedType);
    if (savedPhone) setPhone(savedPhone);

    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.business_name) {
            setBusinessName(profile.business_name);
            localStorage.setItem("umkm_business_name", profile.business_name);
          }
          if (profile.business_type) {
            setBusinessType(profile.business_type);
            localStorage.setItem("umkm_business_type", profile.business_type);
          }
          if (profile.phone_number) {
            setPhone(profile.phone_number);
            localStorage.setItem("umkm_phone", profile.phone_number);
          }
        }
      } catch (e) {
        console.log("Error loading profile in navbar", e);
      }
    };

    loadProfile();
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem("umkm_business_name", businessName);
    localStorage.setItem("umkm_business_type", businessType);
    localStorage.setItem("umkm_phone", phone);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          business_name: businessName,
          business_type: businessType,
          phone_number: phone,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.log("Upsert profile error", e);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("profile-updated"));
    }

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-black/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#19382B] text-white flex items-center justify-center font-bold shrink-0">
              <Storefront size={18} weight="fill" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                Kelola profil usaha UMKM
              </h3>
              <span className="text-[10px] text-[#19382B] font-medium block">
                {userEmail || "Identitas usaha terdaftar dinas"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#ecefe6] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#111111] mb-1">
              Nama usaha / toko UMKM
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Contoh: Kerajinan Kayu Mutiara Jati"
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-medium text-[#111111] focus:outline-none focus:border-[#19382B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] mb-1">
              Kategori / jenis produk UMKM
            </label>
            <input
              type="text"
              required
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Contoh: Kerajinan kayu &amp; ukir / mebel"
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-medium text-[#111111] focus:outline-none focus:border-[#19382B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#111111] mb-1">
              Nomor WhatsApp / telepon usaha
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              className="w-full bg-[#f8f9f5] border border-black/10 rounded-xl px-3.5 py-2.5 font-medium text-[#111111] focus:outline-none focus:border-[#19382B]"
            />
          </div>

          {savedSuccess && (
            <div className="bg-[#ecefe6] text-[#19382B] p-3 rounded-xl font-bold text-center text-xs border border-black/5">
              Profil usaha berhasil disimpan.
            </div>
          )}

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-xs font-bold border border-black/15 bg-white hover:bg-gray-100 text-[#111111] cursor-pointer transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#19382B] text-white hover:bg-[#234A39] shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan profil usaha"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
