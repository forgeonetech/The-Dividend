'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { ReadingHistory } from '@/lib/types';
import ArticleCard from '@/components/articles/ArticleCard';
import { LuHistory } from 'react-icons/lu';

export default function ReadingHistoryPage() {
    const { profile } = useAuth();
    const [history, setHistory] = useState<ReadingHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;
        const fetch = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('reading_history')
                    .select('*, article:articles(*, author:users(*), category:categories(*))')
                    .eq('user_id', profile.id)
                    .order('last_read_at', { ascending: false })
                    .limit(20);
                setHistory(data || []);
            } catch { setHistory([]); }
            finally { setLoading(false); }
        };
        fetch();
    }, [profile]);

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Reading History</h1>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 skeleton rounded-xl" />)}
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuHistory size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No reading history</h3>
                    <p className="text-sm text-muted-foreground">Articles you read will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {history.map((h) => h.article ? <ArticleCard key={h.id} article={h.article} /> : null)}
                </div>
            )}
        </div>
    );
}
