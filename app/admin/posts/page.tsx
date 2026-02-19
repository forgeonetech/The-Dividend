'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import { LuSquarePen, LuTrash2, LuEye, LuStar, LuGlobe, LuFileText } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function AdminPostsPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('articles')
                .select('*, author:users(*), category:categories(*)')
                .order('created_at', { ascending: false });
            setArticles(data || []);
        } catch { setArticles([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchArticles(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this article?')) return;
        try {
            const supabase = createClient();
            await supabase.from('articles').delete().eq('id', id);
            setArticles((prev) => prev.filter((a) => a.id !== id));
            toast.success('Article deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const toggleFeatured = async (article: Article) => {
        try {
            const supabase = createClient();
            await supabase.from('articles').update({ is_featured: !article.is_featured }).eq('id', article.id);
            setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, is_featured: !a.is_featured } : a));
            toast.success(article.is_featured ? 'Unfeatured' : 'Featured');
        } catch { toast.error('Failed to update'); }
    };

    const toggleEditorsPick = async (article: Article) => {
        try {
            const supabase = createClient();
            await supabase.from('articles').update({ is_editors_pick: !article.is_editors_pick }).eq('id', article.id);
            setArticles((prev) => prev.map((a) => a.id === article.id ? { ...a, is_editors_pick: !a.is_editors_pick } : a));
            toast.success(article.is_editors_pick ? 'Removed from picks' : 'Added to picks');
        } catch { toast.error('Failed to update'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">Posts</h1>
                <Link
                    href="/admin/write"
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all"
                >
                    <LuSquarePen size={16} /> New Post
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuFileText size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
                    <p className="text-sm text-muted-foreground">Create your first article</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider">Title</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider hidden sm:table-cell">Status</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider hidden md:table-cell">Views</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articles.map((article) => (
                                    <tr key={article.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground truncate max-w-xs">{article.title}</p>
                                                <p className="text-xs text-muted-foreground">{article.category?.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${article.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                                }`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">
                                            {formatNumber(article.views)}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                                            {formatDate(article.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => toggleFeatured(article)}
                                                    className={`p-1.5 rounded-lg transition-all ${article.is_featured ? 'text-accent bg-accent-light' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                    title="Toggle featured"
                                                >
                                                    <LuGlobe size={14} />
                                                </button>
                                                <button
                                                    onClick={() => toggleEditorsPick(article)}
                                                    className={`p-1.5 rounded-lg transition-all ${article.is_editors_pick ? 'text-yellow-500 bg-yellow-50' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                    title="Toggle editor's pick"
                                                >
                                                    <LuStar size={14} />
                                                </button>
                                                <Link href={`/blog/${article.slug}`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all" title="Preview">
                                                    <LuEye size={14} />
                                                </Link>
                                                <Link href={`/admin/write?edit=${article.id}`} className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                                                    <LuSquarePen size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-red-50 transition-all"
                                                    title="Delete"
                                                >
                                                    <LuTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
