import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UmkmClaimsClient } from "@/components/umkm/UmkmClaimsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function KlaimPage() {
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

  const initialDisplayName =
    profile?.full_name || user.email?.split("@")[0] || "Pengguna UMKM";

  return (
    <UmkmClaimsClient initialDisplayName={initialDisplayName} userId={user.id} />
  );
}
