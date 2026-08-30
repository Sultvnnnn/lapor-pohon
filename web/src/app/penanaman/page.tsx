import { createClient } from "@/lib/supabase/server";
import { PenanamanClient, TreePlantingItem } from "@/components/penanaman/PenanamanClient";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function PenanamanPage() {
  const supabase = await createClient();

  // 1. Fetch total count of all reports for target tree planting calculation (Total Laporan x 2)
  const { count: totalReportsCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  let totalReports = totalReportsCount ?? 0;
  if (!totalReports) {
    const { data: allReports } = await supabase
      .from("reports")
      .select("id");
    totalReports = allReports ? allReports.length : 0;
  }

  // 2. Fetch initial tree plantings posts (100% Public Query)
  const { data: plantingsData } = await supabase
    .from("tree_plantings")
    .select("*")
    .order("created_at", { ascending: false });

  const initialPlantings: TreePlantingItem[] = plantingsData
    ? (plantingsData as TreePlantingItem[])
    : [];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans flex flex-col justify-between selection:bg-[#19382B] selection:text-white">
      {/* Public Landing Page Top Navbar */}
      <Navbar />

      {/* Main Public Tree Planting Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16 z-10">
        <PenanamanClient
          initialPlantings={initialPlantings}
          totalReportsCount={totalReports}
        />
      </main>

      {/* Public Landing Page Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
