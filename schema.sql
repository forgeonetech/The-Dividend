-- ============================================
-- THE DIVIDEND — Database Schema
-- ============================================
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Supabase Auth handles auth.users; this is a public profiles table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#E97820',
  icon TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ARTICLES TABLE
-- ============================================
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

-- ============================================
-- ARTICLE TAGS (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================
-- ARTICLE LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.article_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================
-- BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'article', 'comment', 'message', 'purchase')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- READING HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- CATEGORIES policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ARTICLES policies
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (
  status = 'published' OR author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors can insert articles" ON public.articles FOR INSERT WITH CHECK (
  auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin'))
);
CREATE POLICY "Authors can update own articles" ON public.articles FOR UPDATE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authors can delete own articles" ON public.articles FOR DELETE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- TAGS policies
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admin can manage tags" ON public.tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ARTICLE_TAGS policies
CREATE POLICY "Article tags are viewable by everyone" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Authors can manage article tags" ON public.article_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.articles WHERE id = article_id AND author_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- COMMENTS policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments or admin" ON public.comments FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- BOOKMARKS policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ARTICLE LIKES policies
CREATE POLICY "Likes are viewable by everyone" ON public.article_likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON public.article_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.article_likes FOR DELETE USING (auth.uid() = user_id);

-- BOOKS policies
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admin can manage books" ON public.books FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- PURCHASES policies
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can update purchases" ON public.purchases FOR UPDATE USING (true);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- MESSAGES policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- READING HISTORY policies
CREATE POLICY "Users can view own reading history" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reading history" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading history" ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('article_banners', 'article_banners', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('category_images', 'category_images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book_covers', 'book_covers', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('user_avatars', 'user_avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('article_content_images', 'article_content_images', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access for article banners" ON storage.objects FOR SELECT USING (bucket_id = 'article_banners');
CREATE POLICY "Admin upload article banners" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'article_banners' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin delete article banners" ON storage.objects FOR DELETE USING (
  bucket_id = 'article_banners' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access for category images" ON storage.objects FOR SELECT USING (bucket_id = 'category_images');
CREATE POLICY "Admin upload category images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'category_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access for book covers" ON storage.objects FOR SELECT USING (bucket_id = 'book_covers');
CREATE POLICY "Admin upload book covers" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'book_covers' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read access for user avatars" ON storage.objects FOR SELECT USING (bucket_id = 'user_avatars');
CREATE POLICY "Users upload own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user_avatars' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Public read access for content images" ON storage.objects FOR SELECT USING (bucket_id = 'article_content_images');
CREATE POLICY "Admin upload content images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'article_content_images' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar_url, provider, provider_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'provider_id', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment views function
CREATE OR REPLACE FUNCTION public.increment_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles SET views = views + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment post_count on categories
CREATE OR REPLACE FUNCTION public.update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published' THEN
    UPDATE public.categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status != 'published' THEN
    UPDATE public.categories SET post_count = post_count - 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
    UPDATE public.categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_article_change ON public.articles;
CREATE TRIGGER on_article_change
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_category_post_count();

-- Update article likes count
CREATE OR REPLACE FUNCTION public.update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET likes = likes + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET likes = likes - 1 WHERE id = OLD.article_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_article_like_change ON public.article_likes;
CREATE TRIGGER on_article_like_change
  AFTER INSERT OR DELETE ON public.article_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_article_likes_count();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SEED CATEGORIES
-- ============================================
INSERT INTO public.categories (name, slug, description, color, icon) VALUES
  ('Investing', 'investing', 'Long-term investment strategies and insights', '#E97820', '📈'),
  ('Personal Finance', 'personal-finance', 'Managing your money wisely', '#2563EB', '💰'),
  ('Wealth Building', 'wealth-building', 'Building generational wealth', '#059669', '🏗️'),
  ('Systems & Strategy', 'systems-strategy', 'Frameworks for financial thinking', '#7C3AED', '⚙️'),
  ('Mindset', 'mindset', 'Psychology of money and success', '#DC2626', '🧠'),
  ('Book Reviews', 'book-reviews', 'Reviews of essential financial literature', '#CA8A04', '📚'),
  ('Market Analysis', 'market-analysis', 'Analysis and commentary on market trends', '#0891B2', '📊')
ON CONFLICT (name) DO NOTHING;
