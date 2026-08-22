import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === null) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-[#ecefe6] text-[#111111] font-sans flex flex-col">
      <DashboardNavbar userEmail={user.email} userRole={profile.role} />
      <main className="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8">
        {children}
      </main>
    </div>
  );
}
