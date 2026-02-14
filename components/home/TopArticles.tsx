'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import ArticleCard from '@/components/articles/ArticleCard';
import { LuTrendingUp } from 'react-icons/lu';

export default function TopArticles() {
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
                    .order('created_at', { ascending: false })
                    .limit(6);
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
                    <LuTrendingUp className="text-accent" size={22} />
                    <h2 className="text-2xl font-serif font-bold text-foreground">Top Articles</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 skeleton rounded-xl" />
                    ))}
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
        return (
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <LuTrendingUp className="text-accent" size={22} />
                    <h2 className="text-2xl font-serif font-bold text-foreground">Top Articles</h2>
                </div>
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg">No articles published yet</p>
                    <p className="text-sm mt-1">Check back soon for insightful content</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <LuTrendingUp className="text-accent" size={22} />
                    <h2 className="text-2xl font-serif font-bold text-foreground">Top Articles</h2>
                </div>
                <a href="/blog" className="text-sm text-accent hover:text-accent-hover font-medium transition-colors">
                    View all →
                </a>
            </div>

            {/* Featured article + grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {articles.length > 0 && (
                    <ArticleCard article={articles[0]} variant="featured" />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {articles.slice(1, 5).map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            </div>
        </section>
    );
}
