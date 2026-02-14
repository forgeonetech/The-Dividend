'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import ArticleCard from '@/components/articles/ArticleCard';
import { LuStar } from 'react-icons/lu';

export default function EditorsPicks() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('articles')
                    .select('*, author:users(*), category:categories(*)')
                    .eq('status', 'published')
                    .eq('is_editors_pick', true)
                    .order('created_at', { ascending: false })
                    .limit(4);
                setArticles(data || []);
            } catch {
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <LuStar className="text-accent" size={22} />
                    <h2 className="text-2xl font-serif font-bold text-foreground">Editor&apos;s Picks</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-72 skeleton rounded-xl" />
                    ))}
                </div>
            </section>
        );
    }

    if (articles.length === 0) return null;

    return (
        <section>
            <div className="flex items-center gap-2 mb-6">
                <LuStar className="text-accent" size={22} />
                <h2 className="text-2xl font-serif font-bold text-foreground">Editor&apos;s Picks</h2>
            </div>
            <div className="p-6 bg-accent-light/50 border border-accent/10 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </section>
    );
}
