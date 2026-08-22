import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/reportForm";
import {
  ShieldWarning,
  Tree,
  Scales,
  Sparkle,
  CheckCircle,
  Camera,
  MapPinLine,
  Recycle,
} from "@phosphor-icons/react/dist/ssr";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch count of existing reports for user or overall summary
  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user?.id || "")
    .maybeSingle();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0b3d2c] via-[#15543e] to-[#0b3d2c] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-[#88d937]">
            <Sparkle size={14} weight="fill" />
            Sistem Deteksi AI & Distribusi Sirkular
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {displayName}! 👋
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Selamat datang di Dashboard LaporPohon. Laporkan lokasi pohon rawan tumbang di sekitar Anda untuk pencegahan bahaya dini dan pemanfaatan kayu sirkular.
          </p>
        </div>

        {/* Decorative Graphic Element */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Tree size={260} weight="fill" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/50">
              Total Laporan
            </p>
            <p className="text-2xl font-extrabold text-[#111111]">
              {totalReports ?? 0}
            </p>
            <p className="text-[11px] text-[#111111]/60">Laporan di pangkalan data</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0b3d2c]/10 text-[#0b3d2c] flex items-center justify-center">
            <Tree size={24} weight="duotone" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/50">
              Model AI Active
            </p>
            <p className="text-2xl font-extrabold text-[#111111]">YOLOv8</p>
            <p className="text-[11px] text-[#88d937] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistem AI Siap
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldWarning size={24} weight="duotone" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/50">
              Cakupan Wilayah
            </p>
            <p className="text-2xl font-extrabold text-[#111111]">Semarang</p>
            <p className="text-[11px] text-[#111111]/60">Jawa Tengah</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <MapPinLine size={24} weight="duotone" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/50">
              Mitra UMKM
            </p>
            <p className="text-2xl font-extrabold text-[#111111]">Sirkular</p>
            <p className="text-[11px] text-[#111111]/60">Pemanfaatan Kayu</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#88d937]/30 text-[#0b3d2c] flex items-center justify-center">
            <Recycle size={24} weight="duotone" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Report Form & Inspection Output */}
        <div className="lg:col-span-7 space-y-6">
          <ReportForm />
        </div>

        {/* Right Column (5 cols): Guidelines, Workflow & Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Panduan Pengambilan Foto */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-[#0b3d2c]/10 text-[#0b3d2c] flex items-center justify-center">
                <Camera size={20} weight="fill" />
              </div>
              <h3 className="font-bold text-[#111111] text-base">
                Tips Foto Pohon Presisi
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-[#111111]/70 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle size={16} weight="fill" className="text-[#0b3d2c] shrink-0 mt-0.5" />
                <span>
                  <strong>Ambil sudut utuh:</strong> Pastikan batang dan tajuk pohon terlihat jelas dari jarak yang memadai.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={16} weight="fill" className="text-[#0b3d2c] shrink-0 mt-0.5" />
                <span>
                  <strong>Pencahayaan memadai:</strong> Hindari foto yang terlalu gelap atau membelakangi cahaya (*backlight*).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle size={16} weight="fill" className="text-[#0b3d2c] shrink-0 mt-0.5" />
                <span>
                  <strong>Aktifkan GPS HP:</strong> Gunakan tombol <em>Deteksi Lokasi Otomatis</em> agar titik koordinat akurat.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Alur Pemrosesan Laporan */}
          <div className="bg-[#0b3d2c] text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-[#88d937]/20 text-[#88d937] flex items-center justify-center">
                <Recycle size={20} weight="fill" />
              </div>
              <h3 className="font-bold text-white text-base">
                Alur Sirkular LaporPohon
              </h3>
            </div>

            <div className="space-y-4 text-xs text-white/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#0b3d2c] flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Deteksi AI Risk Score</p>
                  <p className="text-[11px] text-white/70">
                    Sistem mendeteksi kerapuhan dan potensi pohon rawan tumbang.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#0b3d2c] flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Verifikasi & Penanganan DLH</p>
                  <p className="text-[11px] text-white/70">
                    Petugas melakukan tindak lanjut perapihan / penebangan pohon berisiko.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#88d937] text-[#0b3d2c] flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Penyaluran ke UMKM Kayu</p>
                  <p className="text-[11px] text-white/70">
                    Limbah hasil penebangan diolah kembali menjadi produk kayu bernilai tinggi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
