-- Comprehensive cleanup and policy setup for all storage buckets
DO $$ 
BEGIN
    -- 1. Ensure buckets exist and are public
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('article_banners', 'article_banners', true, null, null) 
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = null;

    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('category_images', 'category_images', true, null, null) 
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = null;

    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('book_covers', 'book_covers', true, null, null) 
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = null;

    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('user_avatars', 'user_avatars', true, null, null) 
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = null;

    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES ('article_content_images', 'article_content_images', true, null, null) 
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = null;

    -- 2. Drop ALL existing policies on storage.objects to start fresh and avoid conflicts
    -- We use a loop to drop them dynamically if needed, but explicit drops are safer to read
    DROP POLICY IF EXISTS "Public read access for article banners" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload article banners" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated upload article banners" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete article banners" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update article banners" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for category images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload category images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update category images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete category images" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for book covers" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload book covers" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update book covers" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete book covers" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for article content images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin upload article content images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin update article content images" ON storage.objects;
    DROP POLICY IF EXISTS "Admin delete article content images" ON storage.objects;

    DROP POLICY IF EXISTS "Public read access for user avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

    -- 3. Create fresh policies

    -- ARTICLE BANNERS
    CREATE POLICY "Public read access for article banners" ON storage.objects FOR SELECT USING (bucket_id = 'article_banners');
    -- Allow any authenticated user to upload/update (temporary looseness for debugging upload issues)
    CREATE POLICY "Authenticated upload article banners" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'article_banners' AND auth.role() = 'authenticated'
    );
    CREATE POLICY "Authenticated update article banners" ON storage.objects FOR UPDATE USING (
        bucket_id = 'article_banners' AND auth.role() = 'authenticated'
    );
    CREATE POLICY "Authenticated delete article banners" ON storage.objects FOR DELETE USING (
        bucket_id = 'article_banners' AND auth.role() = 'authenticated'
    );

    -- CATEGORY IMAGES (Strict Admin)
    CREATE POLICY "Public read access for category images" ON storage.objects FOR SELECT USING (bucket_id = 'category_images');
    CREATE POLICY "Admin upload category images" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'category_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin update category images" ON storage.objects FOR UPDATE USING (
        bucket_id = 'category_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin delete category images" ON storage.objects FOR DELETE USING (
        bucket_id = 'category_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- BOOK COVERS (Strict Admin)
    CREATE POLICY "Public read access for book covers" ON storage.objects FOR SELECT USING (bucket_id = 'book_covers');
    CREATE POLICY "Admin upload book covers" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'book_covers' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin update book covers" ON storage.objects FOR UPDATE USING (
        bucket_id = 'book_covers' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin delete book covers" ON storage.objects FOR DELETE USING (
        bucket_id = 'book_covers' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- ARTICLE CONTENT IMAGES (Strict Admin)
    CREATE POLICY "Public read access for article content images" ON storage.objects FOR SELECT USING (bucket_id = 'article_content_images');
    CREATE POLICY "Admin upload article content images" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'article_content_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin update article content images" ON storage.objects FOR UPDATE USING (
        bucket_id = 'article_content_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
    CREATE POLICY "Admin delete article content images" ON storage.objects FOR DELETE USING (
        bucket_id = 'article_content_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

    -- USER AVATARS (Auth User Own)
    CREATE POLICY "Public read access for user avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user_avatars');
    
    CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
        bucket_id = 'user_avatars' AND (name LIKE (auth.uid() || '/%'))
    );
    
    CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
        bucket_id = 'user_avatars' AND (name LIKE (auth.uid() || '/%'))
    );
    
    CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
        bucket_id = 'user_avatars' AND (name LIKE (auth.uid() || '/%'))
    );

END $$;
