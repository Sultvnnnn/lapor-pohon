import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { UmkmDashboardClient } from "@/components/umkm/UmkmDashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const initialDisplayName =
    profile?.full_name || user.email?.split("@")[0] || "Pengguna";

  // Check if role is UMKM
  if (profile?.role === "umkm") {
    const { data: allReports } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    return (
      <UmkmDashboardClient
        initialDisplayName={initialDisplayName}
        initialReports={allReports || []}
      />
    );
  }

  // Otherwise default citizen view
  const { count, data } = await supabase
    .from("reports")
    .select("id", { count: "exact" })
    .eq("user_id", user.id);

  const initialTotalReports = count ?? (data ? data.length : 0);

  return (
    <DashboardClient
      initialDisplayName={initialDisplayName}
      initialTotalReports={initialTotalReports}
    />
  );
}