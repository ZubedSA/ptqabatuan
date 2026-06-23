-- Skema Database untuk Website PP Al-Usymuni Batuan

-- 1. Table USERS (Extended Profile for Admin/Staff)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- 2. Table ARTICLES
CREATE TABLE public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  thumbnail text,
  category text NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table GALLERY
CREATE TABLE public.gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table PROGRAMS
CREATE TABLE public.programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  features jsonb DEFAULT '[]'::jsonb
);

-- 5. Table STAFFS (Dewan Asatidz & Pengurus)
CREATE TABLE public.staffs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  position text NOT NULL,
  photo text
);

-- 6. Table TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  photo text
);

-- 7. Table PPDB
CREATE TABLE public.ppdb (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  parent_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  documents jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Table DONATIONS
CREATE TABLE public.donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program_name text NOT NULL,
  target_amount numeric DEFAULT 0,
  collected_amount numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Table SETTINGS
CREATE TABLE public.settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL,
  logo text,
  address text,
  phone text,
  email text,
  CHECK (id = 1) -- Ensures only one row exists
);

-- 10. Table CONTACT_MESSAGES
CREATE TABLE public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) Policies
-- Atur public read access untuk semua tabel publik
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.articles FOR SELECT USING (is_published = true);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery viewable by everyone" ON public.gallery FOR SELECT USING (true);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Programs viewable by everyone" ON public.programs FOR SELECT USING (true);

ALTER TABLE public.staffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staffs viewable by everyone" ON public.staffs FOR SELECT USING (true);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials viewable by everyone" ON public.testimonials FOR SELECT USING (true);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations viewable by everyone" ON public.donations FOR SELECT USING (is_active = true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON public.settings FOR SELECT USING (true);

-- PPDB Policy: Anyone can insert, but only admin can view/update
ALTER TABLE public.ppdb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit PPDB" ON public.ppdb FOR INSERT WITH CHECK (true);

-- Contact Policy: Anyone can insert
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages FOR INSERT WITH CHECK (true);
