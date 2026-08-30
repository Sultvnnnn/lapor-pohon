import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DashboardNavbar,
  DashboardSidebar,
} from "@/components/dashboard/DashboardNavbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const normalizedRole = String(profile.role).toLowerCase().trim();

  return (
    <div className="min-h-screen bg-[#f8f9f5] text-[#111111] font-sans flex flex-col md:flex-row relative">
      {/* Desktop Sidebar (visible on md: 768px+) */}
      <DashboardSidebar userEmail={user.email} userRole={normalizedRole} />

      {/* Mobile Top Header */}
      <div className="md:hidden w-full sticky top-4 z-40 px-3 pt-2 pb-1 mobile-header-wrapper">
        <DashboardNavbar userEmail={user.email} userRole={normalizedRole} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 max-w-[1300px] w-full mx-auto px-3.5 sm:px-8 lg:px-12 pt-7 sm:pt-8 pb-8 sm:pb-12">
        {children}
      </main>
    </div>
  );
}
