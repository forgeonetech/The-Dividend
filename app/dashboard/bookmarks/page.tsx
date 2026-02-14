'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Bookmark } from '@/lib/types';
import ArticleCard from '@/components/articles/ArticleCard';
import { LuBookmark } from 'react-icons/lu';

export default function BookmarksPage() {
    const { profile } = useAuth();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;
        const fetch = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('bookmarks')
                    .select('*, article:articles(*, author:users(*), category:categories(*))')
                    .eq('user_id', profile.id)
                    .order('created_at', { ascending: false });
                setBookmarks(data || []);
            } catch {
                setBookmarks([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [profile]);

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Bookmarks</h1>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-72 skeleton rounded-xl" />
                    ))}
                </div>
            ) : bookmarks.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuBookmark size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No bookmarks yet</h3>
                    <p className="text-sm text-muted-foreground">Save articles you want to read later</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookmarks.map((b) =>
                        b.article ? <ArticleCard key={b.id} article={b.article} /> : null
                    )}
                </div>
            )}
        </div>
    );
}
