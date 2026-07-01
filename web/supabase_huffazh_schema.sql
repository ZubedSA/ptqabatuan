-- Skema Tabel Huffazh Santri untuk Supabase

-- 1. Buat Tabel public.huffazh
CREATE TABLE IF NOT EXISTS public.huffazh (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  class_or_status text NOT NULL,
  memorized_juz integer NOT NULL DEFAULT 30 CHECK (memorized_juz >= 1 AND memorized_juz <= 30),
  photo text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.huffazh ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS (Policy)
-- Publik dapat melihat/membaca data huffazh
CREATE POLICY "Huffazh viewable by everyone" 
  ON public.huffazh 
  FOR SELECT 
  USING (true);

-- Admin terautentikasi dapat melakukan operasi INSERT, UPDATE, dan DELETE
CREATE POLICY "Authenticated users can insert huffazh" 
  ON public.huffazh 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update huffazh" 
  ON public.huffazh 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete huffazh" 
  ON public.huffazh 
  FOR DELETE 
  TO authenticated 
  USING (true);
