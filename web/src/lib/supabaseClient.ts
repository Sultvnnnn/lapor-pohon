import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[ERROR] Missing Supabase environment variables. Please check your .env.local file.",
  );
  throw new Error(
    "[ERROR] Gagal menginisialisasi klien basis data. Variabel lingkungan tidak ditemukan.",
  );
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

console.log("[SUCCESS] Supabase client initialized successfully.");
