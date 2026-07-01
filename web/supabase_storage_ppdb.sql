-- 1. Buat bucket baru bernama 'ppdb_documents' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('ppdb_documents', 'ppdb_documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus policy lama (jika ada) agar tidak tumpang tindih
DROP POLICY IF EXISTS "PPDB Public Access" ON storage.objects;
DROP POLICY IF EXISTS "PPDB Anon Upload" ON storage.objects;
DROP POLICY IF EXISTS "PPDB Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "PPDB Admin Delete" ON storage.objects;

-- 3. Policy: Semua orang bisa melihat file di bucket 'ppdb_documents'
CREATE POLICY "PPDB Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'ppdb_documents' );

-- 4. Policy: Semua orang (anonim) bisa mengunggah file
CREATE POLICY "PPDB Anon Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'ppdb_documents' );

-- 5. Policy: Hanya pengguna login (Admin) yang bisa memperbarui file
CREATE POLICY "PPDB Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'ppdb_documents' );

-- 6. Policy: Hanya pengguna login (Admin) yang bisa menghapus file
CREATE POLICY "PPDB Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'ppdb_documents' );
