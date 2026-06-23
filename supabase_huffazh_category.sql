-- Tambahkan kolom category ke tabel public.huffazh
ALTER TABLE public.huffazh 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Kategori Pertama' NOT NULL;
