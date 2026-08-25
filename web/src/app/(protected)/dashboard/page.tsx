import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

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

  const { count, data } = await supabase
    .from("reports")
    .select("id", { count: "exact" })
    .eq("user_id", user.id);

  const initialTotalReports = count ?? (data ? data.length : 0);
  const initialDisplayName =
    profile?.full_name || user.email?.split("@")[0] || "Pengguna";

  return (
    <DashboardClient
      initialDisplayName={initialDisplayName}
      initialTotalReports={initialTotalReports}
    />
  );
}
