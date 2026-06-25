-- 1. Buat Tabel educational_programs
CREATE TABLE IF NOT EXISTS public.educational_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon_name text DEFAULT 'BookOpen',
  image_url text,
  features jsonb DEFAULT '[]'::jsonb, -- Array of strings for target pembelajaran
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan RLS
ALTER TABLE public.educational_programs ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Publik bisa melihat semua program
CREATE POLICY "Public can view programs" ON public.educational_programs FOR SELECT USING (true);
-- Admin (authenticated) bisa melakukan operasi CRUD
CREATE POLICY "Admin can insert programs" ON public.educational_programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update programs" ON public.educational_programs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete programs" ON public.educational_programs FOR DELETE TO authenticated USING (true);

-- 4. Setup Storage Bucket untuk Cover Image Program
INSERT INTO storage.buckets (id, name, public)
VALUES ('programs', 'programs', true)
ON CONFLICT (id) DO NOTHING;

-- Hapus policy storage lama jika ada
DROP POLICY IF EXISTS "Public View Programs Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Programs Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Programs Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Programs Storage" ON storage.objects;

-- RLS Storage
CREATE POLICY "Public View Programs Storage" ON storage.objects FOR SELECT USING (bucket_id = 'programs');
CREATE POLICY "Admin Upload Programs Storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'programs');
CREATE POLICY "Admin Delete Programs Storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'programs');
CREATE POLICY "Admin Update Programs Storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'programs');

-- Memaksa Supabase memperbarui schema cache
NOTIFY pgrst, 'reload schema';
