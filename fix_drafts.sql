-- Securely check and create the articles table and ensure draft support exists
DO $$ 
BEGIN
    -- 1. Ensure the articles table exists
    CREATE TABLE IF NOT EXISTS public.articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        banner_url TEXT,
        excerpt TEXT DEFAULT '',
        content JSONB DEFAULT '{}',
        author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
        read_time INTEGER NOT NULL DEFAULT 1,
        views INTEGER NOT NULL DEFAULT 0,
        likes INTEGER NOT NULL DEFAULT 0,
        is_featured BOOLEAN NOT NULL DEFAULT FALSE,
        is_editors_pick BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
        seo_keywords TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- 2. Ensure RLS is enabled
    ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

    -- 3. Ensure policies allow authors to see their own drafts
    -- Drop existing policy to ensure clean slate or avoid conflicts if defined differently
    DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
    DROP POLICY IF EXISTS "Authors can insert articles" ON public.articles;
    DROP POLICY IF EXISTS "Authors can update own articles" ON public.articles;
    DROP POLICY IF EXISTS "Authors can delete own articles" ON public.articles;

    -- Re-create policies
    -- View: Everyone sees published. Authors/Admins see everything (including drafts).
    CREATE POLICY "Articles visibility" ON public.articles FOR SELECT USING (
        status = 'published' 
        OR author_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- Insert: Authors and Admins can insert
    CREATE POLICY "Authors can insert articles" ON public.articles FOR INSERT WITH CHECK (
        auth.uid() = author_id 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- Update: Authors and Admins can update their own articles
    CREATE POLICY "Authors can update own articles" ON public.articles FOR UPDATE USING (
        auth.uid() = author_id 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- Delete: Authors and Admins can delete
    CREATE POLICY "Authors can delete own articles" ON public.articles FOR DELETE USING (
        auth.uid() = author_id 
        OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

END $$;
