-- ====================================================================
-- SCRIPT TABEL BIOMASS_CATALOGS & SUPABASE MIGRATION - LAPORPOHON
-- Jalankan skrip ini di Dashboard Supabase > SQL Editor
-- ====================================================================

-- ── 1. BUAT TYPE BIOMASS_STATUS JIKA BELUM ADA ──
DO $$ BEGIN
    CREATE TYPE public.biomass_status AS ENUM ('available', 'claimed', 'sold_out');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ── 2. BUAT TABEL BIOMASS_CATALOGS ──
CREATE TABLE IF NOT EXISTS public.biomass_catalogs (
  id uuid not null default gen_random_uuid (),
  report_id uuid null,
  wood_type text not null default 'Pohon Kayu Olahan',
  volume_kg double precision not null default 100.0,
  status public.biomass_status not null default 'available'::biomass_status,
  claimed_by uuid null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint biomass_catalogs_pkey primary key (id),
  constraint biomass_catalogs_claimed_by_fkey foreign KEY (claimed_by) references profiles (id) on delete set null,
  constraint biomass_catalogs_report_id_fkey foreign KEY (report_id) references reports (id) on delete CASCADE
);

-- ── 3. ATUR ROW LEVEL SECURITY (RLS) POLICY UNTUK BIOMASS_CATALOGS ──
ALTER TABLE public.biomass_catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for all authenticated users" ON public.biomass_catalogs;
CREATE POLICY "Allow select for all authenticated users"
ON public.biomass_catalogs FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.biomass_catalogs;
CREATE POLICY "Allow update for authenticated users"
ON public.biomass_catalogs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.biomass_catalogs;
CREATE POLICY "Allow insert for authenticated users"
ON public.biomass_catalogs FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.biomass_catalogs;
CREATE POLICY "Allow delete for authenticated users"
ON public.biomass_catalogs FOR DELETE
TO authenticated
USING (true);

-- ── 4. GRANT PERMISSION TOKENS ──
GRANT ALL ON TABLE public.biomass_catalogs TO authenticated;
GRANT ALL ON TABLE public.biomass_catalogs TO anon;
GRANT ALL ON TABLE public.biomass_catalogs TO service_role;

-- ── 5. UPDATE SKEMA TABEL BIOMASS_CATALOGS (KLAIM & SERAH TERIMA UMKM) ──
ALTER TABLE public.biomass_catalogs 
ADD COLUMN IF NOT EXISTS claimed_by_name TEXT,
ADD COLUMN IF NOT EXISTS claimed_by_business_name TEXT,
ADD COLUMN IF NOT EXISTS claimed_by_business_type TEXT,
ADD COLUMN IF NOT EXISTS claimed_by_phone TEXT,
ADD COLUMN IF NOT EXISTS claim_ticket_code TEXT,
ADD COLUMN IF NOT EXISTS handover_status TEXT DEFAULT 'WAITING_PICKUP',
ADD COLUMN IF NOT EXISTS handover_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS handover_notes TEXT,
ADD COLUMN IF NOT EXISTS diameter_cm DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS length_m DOUBLE PRECISION;

-- ── 6. UPDATE SKEMA TABEL REPORTS (FALLBACK COMPATIBILITY) ──
ALTER TABLE public.reports 
ALTER COLUMN status TYPE TEXT USING status::text;

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

ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS handover_status TEXT DEFAULT 'WAITING_PICKUP';

-- ── 7. ATUR RLS POLICY UNTUK TABEL PROFILES (PULL USERNAME & FULL_NAME) ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for authenticated users" ON public.profiles;
CREATE POLICY "Allow select for authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- ── 8. MUAT ULANG CACHE SKEMA POSTGREST SUPABASE ──
NOTIFY pgrst, 'reload schema';
