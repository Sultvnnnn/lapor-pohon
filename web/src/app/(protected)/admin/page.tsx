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

  // 3. Fetch all reports & profiles across all users for admin executive control
  const { data: rawReports, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ERROR] Admin page fetching reports failed:", error.message);
  }

  // Fetch profiles to map names server-side safely without schema cache relation dependency
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email");

  const profileMap = new Map<string, { full_name: string; email: string }>();
  if (profiles) {
    profiles.forEach((p) => {
      profileMap.set(p.id, { full_name: p.full_name || "", email: p.email || "" });
    });
  }

  const reports = (rawReports || []).map((r) => {
    const prof = profileMap.get(r.user_id);
    return {
      ...r,
      reporter_name: prof?.full_name || r.reporter_name || "",
      reporter_email: prof?.email || r.reporter_email || "",
      profiles: prof || null,
    };
  });

  return (
    <AdminDashboardClient
      initialReports={(reports as AdminReportItem[]) || []}
      adminDisplayName={profile.full_name || "Administrator Utama DLH"}
      adminEmail={user.email || ""}
    />
  );
}
