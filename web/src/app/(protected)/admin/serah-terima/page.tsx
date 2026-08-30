import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSerahTerimaClient } from "@/components/admin/AdminSerahTerimaClient";

export default async function AdminSerahTerimaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial biomass_catalogs with joined reports data
  let catalogs: any[] = [];
  try {
    const { data: catData } = await supabase
      .from("biomass_catalogs")
      .select(`
        *,
        reports (*),
        profiles:claimed_by (full_name)
      `)
      .order("created_at", { ascending: false });

    const { data: repData } = await supabase
      .from("reports")
      .select("*")
      .or("claimed_by_name.neq.null,status.eq.completed")
      .order("created_at", { ascending: false });

    const catMap = new Map<string, any>();
    (catData || []).forEach((c) => {
      if (c.report_id) catMap.set(c.report_id, c);
      if (c.id) catMap.set(c.id, c);
    });

    const merged: any[] = [];
    (catData || []).forEach((c) => {
      const isDone = c.handover_status === "COMPLETED" || c.status === "sold_out" || c.reports?.status === "completed";

      merged.push({
        ...c,
        handover_status: isDone ? "COMPLETED" : (c.handover_status || "WAITING_PICKUP"),
        status: isDone ? "sold_out" : (c.status || "claimed"),
      });
    });

    (repData || []).forEach((r) => {
      if (!catMap.has(r.id)) {
        const isDone = r.status === "completed" || r.handover_status === "COMPLETED";

        merged.push({
          id: r.id,
          report_id: r.id,
          wood_type: r.tree_type || "Pohon kayu olahan dinas",
          volume_kg: r.biomass_estimate ? Number(r.biomass_estimate) : 120.0,
          status: isDone ? "sold_out" : "claimed",
          claimed_by_name: r.claimed_by_name || "UMKM terdaftar",
          created_at: r.created_at,
          updated_at: r.created_at,
          reports: r,
          claim_ticket_code: `KLM-2026-TRM-${r.id.slice(0, 4).toUpperCase()}`,
          handover_status: isDone ? "COMPLETED" : "WAITING_PICKUP",
        });
      }
    });

    catalogs = merged;
  } catch {
    catalogs = [];
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] p-4 sm:p-6 lg:p-8 font-sans">
      <AdminSerahTerimaClient initialCatalogs={catalogs} adminEmail={user.email || ""} />
    </div>
  );
}
