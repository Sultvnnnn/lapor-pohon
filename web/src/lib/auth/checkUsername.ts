import { createClient } from "@/lib/supabase/client";

export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const supabaseClient = createClient();

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error(
      `[ERROR] Gagal memeriksa ketersediaan username: ${error.message}`,
    );
    throw new Error("[ERROR] Gagal memeriksa ketersediaan username.");
  }

  return data !== null;
};

export const getEmailByUsername = async (
  usernameOrEmail: string,
): Promise<string | null> => {
  // Kalau inputnya udah berupa email, langsung dipakai
  if (usernameOrEmail.includes("@")) {
    return usernameOrEmail;
  }

  const supabaseClient = createClient();

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("username", usernameOrEmail)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const { data: emailData, error: emailError } = await supabaseClient.rpc(
    "get_email_by_user_id",
    { user_id: data.id },
  );

  if (emailError || !emailData) {
    return null;
  }

  return emailData;
};
