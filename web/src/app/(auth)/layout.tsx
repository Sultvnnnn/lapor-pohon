import Link from "next/link";
import { Tree } from "@phosphor-icons/react/dist/ssr";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#ecefe6] text-[#111111] font-sans flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0b3d2c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#88d937]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#0b3d2c] text-[#e3f4d7] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Tree size={22} weight="fill" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#111111]">
              LaporPohon
            </span>
          </Link>
        </div>

        {children}
      </div>

      {/* Footer copyright */}
      <p className="mt-8 text-xs text-[#111111]/50 text-center relative z-10">
        &copy; {new Date().getFullYear()} LaporPohon Semarang. Selaras & Berkelanjutan.
      </p>
    </div>
  );
}
