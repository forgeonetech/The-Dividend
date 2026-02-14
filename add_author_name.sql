-- 1. Add author_name column to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 2. Function to automatically sync author_name from public.users on insert/update
CREATE OR REPLACE FUNCTION public.sync_article_author_name()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
BEGIN
    SELECT name INTO user_full_name FROM public.users WHERE id = NEW.author_id;
    
    -- Format to title case (e.g. "john doe" -> "John Doe")
    -- PostgreSQL's initcap function does exactly this
    NEW.author_name := initcap(user_full_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger to run before insert or update on articles
DROP TRIGGER IF EXISTS trg_sync_article_author_name ON public.articles;
CREATE TRIGGER trg_sync_article_author_name
    BEFORE INSERT OR UPDATE OF author_id ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.sync_article_author_name();

-- 4. Backfill existing articles
UPDATE public.articles a
SET author_name = initcap(u.name)
FROM public.users u
WHERE a.author_id = u.id;
