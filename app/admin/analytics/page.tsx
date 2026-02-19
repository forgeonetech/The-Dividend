'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatNumber } from '@/lib/utils';
import { LuChartBar, LuEye, LuFileText, LuBookmark, LuTrendingUp } from 'react-icons/lu';

interface ArticleStat {
    title: string;
    slug: string;
    views: number;
    bookmark_count: number;
}

export default function AdminAnalyticsPage() {
    const [topArticles, setTopArticles] = useState<ArticleStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalViews, setTotalViews] = useState(0);
    const [totalArticles, setTotalArticles] = useState(0);
    const [totalBookmarks, setTotalBookmarks] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const supabase = createClient();

                // Top articles by views
                const { data: articles } = await supabase
                    .from('articles')
                    .select('title, slug, views')
                    .order('views', { ascending: false })
                    .limit(10);

                const { count: articlesCount } = await supabase.from('articles').select('id', { count: 'exact', head: true });
                const { count: bookmarksCount } = await supabase.from('bookmarks').select('id', { count: 'exact', head: true });

                const arts = (articles || []).map((a) => ({
                    title: a.title,
                    slug: a.slug,
                    views: a.views || 0,
                    bookmark_count: 0,
                }));

                const tv = arts.reduce((sum, a) => sum + a.views, 0);

                setTopArticles(arts);
                setTotalViews(tv);
                setTotalArticles(articlesCount || 0);
                setTotalBookmarks(bookmarksCount || 0);
            } catch {
                // leave defaults
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                            <LuEye size={16} />
                        </div>
                        <span className="text-xs text-muted-foreground">Total Views</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{loading ? '—' : formatNumber(totalViews)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center">
                            <LuFileText size={16} />
                        </div>
                        <span className="text-xs text-muted-foreground">Articles</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{loading ? '—' : formatNumber(totalArticles)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center">
                            <LuBookmark size={16} />
                        </div>
                        <span className="text-xs text-muted-foreground">Bookmarks</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">{loading ? '—' : formatNumber(totalBookmarks)}</p>
                </div>
            </div>

            {/* Top Articles */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LuTrendingUp size={18} className="text-accent" /> Top Articles by Views
                </h2>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}
                    </div>
                ) : topArticles.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No articles to analyze yet</p>
                ) : (
                    <div className="space-y-2">
                        {topArticles.map((article, index) => (
                            <div key={article.slug} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{article.title}</p>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <LuEye size={14} /> {formatNumber(article.views)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
