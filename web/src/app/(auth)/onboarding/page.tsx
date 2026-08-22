"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "warga" | "umkm";

const roleOptions: { value: Role; label: string; description: string }[] = [
  {
    value: "warga",
    label: "Warga",
    description: "Saya ingin melaporkan kondisi pohon di sekitar saya",
  },
  {
    value: "umkm",
    label: "UMKM",
    description: "Saya ingin mengakses katalog biomassa kayu",
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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Selamat Datang!</h1>
        <p className="text-sm text-gray-500">
          Pilih peran Anda untuk melanjutkan
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 text-sm rounded px-3 py-2">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedRole(option.value)}
            className={`w-full text-left border rounded-lg p-4 transition ${
              selectedRole === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <p className="font-semibold">{option.label}</p>
            <p className="text-sm text-gray-500">{option.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirmRole}
        disabled={!selectedRole || isLoading}
        className="w-full bg-blue-500 text-white rounded px-3 py-2 disabled:opacity-50"
      >
        {isLoading ? "Menyimpan..." : "Lanjutkan"}
      </button>
    </div>
  );
}
