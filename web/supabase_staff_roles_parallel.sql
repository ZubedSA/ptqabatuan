-- Migrasi Basis Data: Tambah Kolom is_parallel di tabel staff_roles
-- Jalankan kode SQL ini di Supabase SQL Editor Anda!

-- 1. Tambah kolom is_parallel ke tabel staff_roles jika belum ada
ALTER TABLE public.staff_roles 
ADD COLUMN IF NOT EXISTS is_parallel boolean DEFAULT false;
