-- Migration: Menambahkan kolom image_url dan images untuk multi-foto pada tabel donation_campaigns
-- Jalankan skrip ini di SQL Editor Supabase jika kolom belum ada.

DO $$ 
BEGIN
  -- Tambah kolom image_url jika belum ada (URL gambar cover utama)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_campaigns' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.donation_campaigns ADD COLUMN image_url text;
  END IF;

  -- Tambah kolom images jika belum ada (Array JSON untuk menyimpan banyak foto dari Google Drive)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'donation_campaigns' AND column_name = 'images'
  ) THEN
    ALTER TABLE public.donation_campaigns ADD COLUMN images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Memaksa Supabase memperbarui schema cache
NOTIFY pgrst, 'reload schema';
