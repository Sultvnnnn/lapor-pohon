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
    const { data, error } = await supabase
      .from("biomass_catalogs")
      .select(`
        *,
        reports (*),
        profiles:claimed_by (full_name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      catalogs = data;
    }
  } catch {
    catalogs = [];
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] p-4 sm:p-6 lg:p-8 font-sans">
      <AdminSerahTerimaClient initialCatalogs={catalogs} adminEmail={user.email || ""} />
    </div>
  );
}
