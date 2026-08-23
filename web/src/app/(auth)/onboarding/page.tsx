"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tree, Storefront, ArrowRight, CircleNotch, WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

type Role = "warga" | "umkm";

const roleOptions: {
  value: Role;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "warga",
    label: "Warga",
    description: "Saya ingin melaporkan kondisi pohon rawan tumbang di lingkungan saya.",
    icon: Tree,
  },
  {
    value: "umkm",
    label: "UMKM / Pengrajin",
    description: "Saya ingin mengakses katalog & distribusi sirkular biomassa limbah kayu.",
    icon: Storefront,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabaseClient = createClient();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      setErrorMessage("Sesi tidak ditemukan. Silakan masuk kembali.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabaseClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          role: selectedRole,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Pengguna",
          username:
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            `user_${user.id.slice(0, 8)}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    setIsLoading(false);

    if (error) {
      console.error(`[ERROR] Gagal menyimpan role: ${error.message}`);
      setErrorMessage(`Gagal menyimpan pilihan: ${error.message}`);
      return;
    }

    console.log(`[SUCCESS] Role berhasil diset: ${selectedRole}`);
    window.location.href = "/dashboard";
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
          Selamat Datang! 👋
        </h1>
        <p className="text-xs text-[#111111]/60">
          Pilih peran Anda untuk melanjutkan ke platform
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl px-4 py-3 flex items-center gap-2">
          <WarningCircle size={18} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-3">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedRole(option.value)}
              className={`w-full text-left p-4 rounded-2xl transition-all border flex items-start gap-3.5 relative ${
                isSelected
                  ? "border-2 border-[#0b3d2c] bg-[#0b3d2c]/5 shadow-sm"
                  : "border-gray-200 hover:border-[#0b3d2c]/40 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[#0b3d2c] text-[#e3f4d7]"
                    : "bg-[#ecefe6] text-[#0b3d2c]"
                }`}
              >
                <Icon size={22} weight={isSelected ? "fill" : "regular"} />
              </div>

              <div className="space-y-0.5 flex-1 pr-6">
                <p className="font-bold text-[#111111] text-sm">
                  {option.label}
                </p>
                <p className="text-xs text-[#111111]/60 leading-relaxed">
                  {option.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 text-[#0b3d2c]">
                  <CheckCircle size={20} weight="fill" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleConfirmRole}
        disabled={!selectedRole || isLoading}
        className="w-full bg-[#0b3d2c] hover:bg-[#15543e] text-white py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <CircleNotch size={18} className="animate-spin text-[#88d937]" />
            <span>Menyimpan...</span>
          </>
        ) : (
          <>
            <span>Lanjutkan ke Dashboard</span>
            <ArrowRight size={18} weight="bold" />
          </>
        )}
      </button>
    </div>
  );
}
