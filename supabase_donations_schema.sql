-- 1. Buat Tabel donation_campaigns (Program Donasi)
CREATE TABLE IF NOT EXISTS public.donation_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  target_amount numeric DEFAULT 0,
  current_amount numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel donations (Riwayat Donasi)
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.donation_campaigns(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  proof_url text,
  status text DEFAULT 'pending', -- pending, verified, rejected
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Aktifkan RLS
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 4. RLS untuk donation_campaigns
-- Publik bisa melihat program donasi yang aktif
CREATE POLICY "Public can view active campaigns" ON public.donation_campaigns FOR SELECT USING (is_active = true);
-- Admin (authenticated) bisa melihat semua program donasi
CREATE POLICY "Admin can view all campaigns" ON public.donation_campaigns FOR SELECT TO authenticated USING (true);
-- Admin bisa Insert, Update, Delete
CREATE POLICY "Admin can insert campaigns" ON public.donation_campaigns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can update campaigns" ON public.donation_campaigns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete campaigns" ON public.donation_campaigns FOR DELETE TO authenticated USING (true);

-- 5. RLS untuk donations
-- Admin bisa melihat semua data donasi
CREATE POLICY "Admin can view all donations" ON public.donations FOR SELECT TO authenticated USING (true);
-- Publik (anonim) BISA melakukan Insert donasi (mengirim form)
CREATE POLICY "Public can insert donations" ON public.donations FOR INSERT WITH CHECK (true);
-- Admin bisa meng-update donasi (untuk memverifikasi)
CREATE POLICY "Admin can update donations" ON public.donations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can delete donations" ON public.donations FOR DELETE TO authenticated USING (true);

-- 6. Trigger Otomatis Update Progress Bar (current_amount)
CREATE OR REPLACE FUNCTION update_campaign_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika status donasi diubah menjadi 'verified' (sebelumnya bukan)
  IF NEW.status = 'verified' AND OLD.status != 'verified' THEN
    UPDATE public.donation_campaigns
    SET current_amount = current_amount + NEW.amount
    WHERE id = NEW.campaign_id;
  END IF;

  -- Jika donasi yang sebelumnya 'verified' diubah/dibatalkan
  IF OLD.status = 'verified' AND NEW.status != 'verified' THEN
    UPDATE public.donation_campaigns
    SET current_amount = current_amount - OLD.amount
    WHERE id = NEW.campaign_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_donation_verified ON public.donations;
CREATE TRIGGER on_donation_verified
AFTER UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_current_amount();

-- 7. Setup Storage Bucket untuk Bukti Transfer
INSERT INTO storage.buckets (id, name, public)
VALUES ('donations', 'donations', true)
ON CONFLICT (id) DO NOTHING;

-- Hapus policy storage lama jika ada
DROP POLICY IF EXISTS "Public View Donations Storage" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Donations Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Donations Storage" ON storage.objects;

-- Publik bisa melihat bukti transfer (diperlukan untuk Admin menampilkan gambar)
CREATE POLICY "Public View Donations Storage" ON storage.objects FOR SELECT USING (bucket_id = 'donations');
-- Publik (Anonim) BISA mengunggah file ke bucket donations (karena donatur tidak login)
CREATE POLICY "Public Upload Donations Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'donations');
-- Admin BISA menghapus/update file
CREATE POLICY "Admin Delete Donations Storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'donations');
CREATE POLICY "Admin Update Donations Storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'donations');
