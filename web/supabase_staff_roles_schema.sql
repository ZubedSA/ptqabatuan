-- Skema Tabel Struktur Peran Staf / Pengurus (Staff Roles)
-- Jalankan kode SQL ini di Supabase SQL Editor Anda!

-- 1. Buat tabel baru untuk struktur peran
CREATE TABLE IF NOT EXISTS public.staff_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan RLS (Row Level Security) jika belum diaktifkan
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- 3. Hapus policy lama jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Staff roles viewable by everyone" ON public.staff_roles;
DROP POLICY IF EXISTS "Admin can insert staff roles" ON public.staff_roles;
DROP POLICY IF EXISTS "Admin can update staff roles" ON public.staff_roles;
DROP POLICY IF EXISTS "Admin can delete staff roles" ON public.staff_roles;

-- 4. Kebijakan Hak Akses (Policies)
CREATE POLICY "Staff roles viewable by everyone" ON public.staff_roles FOR SELECT USING (true);
CREATE POLICY "Admin can insert staff roles" ON public.staff_roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update staff roles" ON public.staff_roles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete staff roles" ON public.staff_roles FOR DELETE TO authenticated USING (true);

-- 5. Masukkan data default struktur organisasi awal
INSERT INTO public.staff_roles (name, priority) VALUES
  ('Pengasuh', 1),
  ('Ketua Yayasan', 2),
  ('Sekretaris', 3),
  ('Bendahara', 4),
  ('Dewan Asatidz', 5)
ON CONFLICT (name) DO NOTHING;
