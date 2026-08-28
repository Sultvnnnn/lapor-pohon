-- ====================================================================
-- SCRIPT SOLUSI ENUM & MIGRASI SUPABASE SQL EDITOR - LAPORPOHON
-- Jalankan skrip ini di Dashboard Supabase > SQL Editor
-- untuk mengonversi status ke TEXT, RLS Policy, dan kolom baru
-- ====================================================================

-- ── 1. UBAH TIPE KOLOM STATUS MENJADI TEXT (MENGATASI ERROR ENUM REPORT_STATUS) ──
ALTER TABLE public.reports 
ALTER COLUMN status TYPE TEXT USING status::text;

ALTER TABLE public.reports 
ALTER COLUMN status SET DEFAULT 'pending';

-- ── 2. TAMBAH KOLOM BARU PADA TABEL REPORTS ──
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS admin_note TEXT;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS proof_image_url TEXT;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS claimed_by_name TEXT;

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS tree_type TEXT;

-- ── 3. ATUR ROW LEVEL SECURITY (RLS) POLICY ──
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3a. Policy SELECT (Melihat semua laporan)
DROP POLICY IF EXISTS "Allow select for authenticated" ON public.reports;
CREATE POLICY "Allow select for authenticated"
ON public.reports FOR SELECT
TO authenticated
USING (true);

-- 3b. Policy UPDATE (Memperbarui status/catatan/foto bukti laporan)
DROP POLICY IF EXISTS "Allow update for authenticated" ON public.reports;
CREATE POLICY "Allow update for authenticated"
ON public.reports FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3c. Policy INSERT (Membuat laporan baru)
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.reports;
CREATE POLICY "Allow insert for authenticated"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3d. Policy DELETE (Menghapus laporan)
DROP POLICY IF EXISTS "Allow delete for authenticated" ON public.reports;
CREATE POLICY "Allow delete for authenticated"
ON public.reports FOR DELETE
TO authenticated
USING (true);

-- ── 4. HAK AKSES PERMISSION TOKENS ──
GRANT ALL ON TABLE public.reports TO authenticated;
GRANT ALL ON TABLE public.reports TO anon;
GRANT ALL ON TABLE public.reports TO service_role;

-- ── 5. MUAT ULANG CACHE SKEMA POSTGREST SUPABASE ──
NOTIFY pgrst, 'reload schema';
