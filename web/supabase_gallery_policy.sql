-- Aktifkan Row Level Security (jika belum)
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- 1. Hapus policy SELECT lama agar tidak tumpang tindih
DROP POLICY IF EXISTS "Gallery viewable by everyone" ON public.gallery;

-- 2. Buat policy SELECT baru: Semua orang bisa melihat galeri
CREATE POLICY "Gallery viewable by everyone"
  ON public.gallery
  FOR SELECT
  USING (true);

-- 3. Policy INSERT untuk pengguna terautentikasi (Admin)
CREATE POLICY "Authenticated users can insert gallery"
  ON public.gallery
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Policy UPDATE untuk pengguna terautentikasi (Admin)
CREATE POLICY "Authenticated users can update gallery"
  ON public.gallery
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Policy DELETE untuk pengguna terautentikasi (Admin)
CREATE POLICY "Authenticated users can delete gallery"
  ON public.gallery
  FOR DELETE
  TO authenticated
  USING (true);
