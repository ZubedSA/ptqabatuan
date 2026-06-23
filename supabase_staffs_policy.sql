-- Skema Tambahan RLS Policy untuk Tabel staffs di Supabase

-- Kebijakan RLS (Policy) untuk INSERT, UPDATE, dan DELETE pada tabel staffs:
-- Catatan: Pastikan RLS sudah aktif pada tabel ini (sudah diaktifkan di skema utama).

-- 1. Kebijakan untuk INSERT
CREATE POLICY "Authenticated users can insert staffs" 
  ON public.staffs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 2. Kebijakan untuk UPDATE
CREATE POLICY "Authenticated users can update staffs" 
  ON public.staffs 
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- 3. Kebijakan untuk DELETE
CREATE POLICY "Authenticated users can delete staffs" 
  ON public.staffs 
  FOR DELETE 
  TO authenticated 
  USING (true);
