-- Tambahkan kolom excerpt pada tabel articles jika belum ada
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS excerpt text;

-- Aktifkan Row Level Security (jika belum)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 1. Hapus policy SELECT lama agar tidak tumpang tindih
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Articles viewable by everyone" ON public.articles;

-- 2. Buat policy SELECT baru:
-- Publik hanya bisa melihat artikel yang dipublikasi (is_published = true)
-- Pengguna terautentikasi (admin) bisa melihat SEMUA artikel (termasuk draft)
CREATE POLICY "Articles viewable by everyone"
  ON public.articles
  FOR SELECT
  USING (
    is_published = true OR auth.role() = 'authenticated'
  );

-- 3. Policy INSERT untuk pengguna terautentikasi
CREATE POLICY "Authenticated users can insert articles"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Policy UPDATE untuk pengguna terautentikasi
CREATE POLICY "Authenticated users can update articles"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Policy DELETE untuk pengguna terautentikasi
CREATE POLICY "Authenticated users can delete articles"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (true);
