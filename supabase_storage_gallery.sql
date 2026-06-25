-- 1. Buat bucket baru bernama 'galeri' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('galeri', 'galeri', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus policy lama (jika ada) agar tidak tumpang tindih
DROP POLICY IF EXISTS "Gallery Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Admin Delete" ON storage.objects;

-- 3. Policy: Semua orang bisa melihat file di bucket 'galeri'
CREATE POLICY "Gallery Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'galeri' );

-- 4. Policy: Hanya pengguna login (Admin) yang bisa mengunggah file
CREATE POLICY "Gallery Admin Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'galeri' );

-- 5. Policy: Hanya pengguna login (Admin) yang bisa memperbarui file
CREATE POLICY "Gallery Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'galeri' );

-- 6. Policy: Hanya pengguna login (Admin) yang bisa menghapus file
CREATE POLICY "Gallery Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'galeri' );
