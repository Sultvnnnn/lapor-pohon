import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DashboardNavbar,
  DashboardSidebar,
} from "@/components/dashboard/DashboardNavbar";

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
    <div className="min-h-screen bg-[#ecefe6] text-[#111111] font-sans flex flex-col md:flex-row relative">
      {/* Desktop Sidebar (visible on md: 768px+) */}
      <DashboardSidebar userEmail={user.email} userRole={profile.role} />

      {/* Mobile Top Header (sticky on top-4, identical to landing page) */}
      <div className="md:hidden w-full sticky top-4 z-50 pt-2 pb-1">
        <DashboardNavbar userEmail={user.email} userRole={profile.role} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-[1300px] w-full mx-auto px-3 sm:px-8 lg:px-12 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
