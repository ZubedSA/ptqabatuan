CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    thumbnail TEXT,
    category TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Atur Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policy untuk mengizinkan semua orang (publik) untuk SELECT (membaca) berita
CREATE POLICY "Allow public read access on news"
ON public.news
FOR SELECT
USING (true);

-- Policy untuk mengizinkan admin (authenticated) untuk INSERT, UPDATE, DELETE
CREATE POLICY "Allow authenticated users to insert news"
ON public.news
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update news"
ON public.news
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete news"
ON public.news
FOR DELETE
TO authenticated
USING (true);
