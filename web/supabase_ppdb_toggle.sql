-- Skema pendukung untuk penambahan fitur gerbang Buka / Tutup PPDB
-- Silakan jalankan skema ini di SQL Editor Supabase Anda

ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS is_ppdb_open boolean DEFAULT true;

-- Pastikan baris pengaturan default (id = 1) ada
INSERT INTO public.settings (id, site_name, is_ppdb_open)
VALUES (1, 'Pondok Pesantren Tahfizh Qur''an Al-Usymuni', true)
ON CONFLICT (id) DO NOTHING;

-- Buka izin UPDATE & INSERT untuk kebijakan RLS (Row Level Security) pada tabel settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow update settings" ON public.settings;
CREATE POLICY "Allow update settings" ON public.settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow insert settings" ON public.settings;
CREATE POLICY "Allow insert settings" ON public.settings FOR INSERT WITH CHECK (true);
