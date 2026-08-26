import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AdminDashboardClient,
  AdminReportItem,
} from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch user profile and verify 'admin' role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    console.warn(
      `[SECURITY WARN] Unauthorized access attempt to /admin by user ${user.id} with role '${profile?.role}'`
    );
    redirect("/dashboard");
  }

  // 3. Fetch all reports across all users for admin executive control
  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ERROR] Admin page fetching reports failed:", error.message);
  }

  return (
    <AdminDashboardClient
      initialReports={(reports as AdminReportItem[]) || []}
      adminDisplayName={profile.full_name || "Administrator Utama DLH"}
      adminEmail={user.email || ""}
    />
  );
}
