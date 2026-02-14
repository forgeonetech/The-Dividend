'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Article, Category } from '@/lib/types';
import ArticleCard from '@/components/articles/ArticleCard';
import { LuSearch, LuFilter, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { PAGE_SIZE, SORT_OPTIONS } from '@/lib/constants';

function BlogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const [searchInput, setSearchInput] = useState(search);

    const updateParams = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            if (key !== 'page') params.set('page', '1');
            router.push(`/blog?${params.toString()}`);
        },
        [searchParams, router]
    );

    // Fetch categories
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.from('categories').select('*').order('name');
                setCategories(data || []);
            } catch {
                setCategories([]);
            }
        };
        fetchCats();
    }, []);

    // Fetch articles
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                let query = supabase
                    .from('articles')
                    .select('*, author:users(*), category:categories(*)', { count: 'exact' })
                    .eq('status', 'published');

                if (search) {
                    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
                }

                if (categorySlug) {
                    const cat = categories.find((c) => c.slug === categorySlug);
                    if (cat) query = query.eq('category_id', cat.id);
                }

                switch (sort) {
                    case 'trending':
                        query = query.order('likes', { ascending: false });
                        break;
                    case 'most_read':
                        query = query.order('views', { ascending: false });
                        break;
                    default:
                        query = query.order('created_at', { ascending: false });
                }

                const from = (page - 1) * PAGE_SIZE;
                query = query.range(from, from + PAGE_SIZE - 1);

                const { data, count: totalCount } = await query;
                setArticles(data || []);
                setCount(totalCount || 0);
            } catch {
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [search, categorySlug, sort, page, categories]);

    const totalPages = Math.ceil(count / PAGE_SIZE);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams('search', searchInput);
    };

    return (
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Articles</h1>
                <p className="text-muted-foreground">Explore thoughtful insights on investing, wealth building, and financial clarity.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 p-4 bg-muted/50 rounded-xl border border-border">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </form>

                {/* Category Filter */}
                <div className="relative">
                    <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <select
                        value={categorySlug}
                        onChange={(e) => updateParams('category', e.target.value)}
                        className="h-10 pl-9 pr-8 bg-card border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Sort */}
                <select
                    value={sort}
                    onChange={(e) => updateParams('sort', e.target.value)}
                    className="h-10 px-4 bg-card border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-muted-foreground mb-6">
                    {count} {count === 1 ? 'article' : 'articles'} found
                    {search && <> for &ldquo;<span className="text-foreground font-medium">{search}</span>&rdquo;</>}
                    {categorySlug && <> in <span className="text-foreground font-medium">{categories.find(c => c.slug === categorySlug)?.name}</span></>}
                </p>
            )}

            {/* Articles Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 skeleton rounded-xl" />
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <LuSearch size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Try adjusting your search or filter to find what you&apos;re looking for.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => updateParams('page', String(page - 1))}
                        disabled={page <= 1}
                        className="p-2 rounded-lg bg-muted text-foreground hover:bg-border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <LuChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => updateParams('page', String(i + 1))}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                    ? 'bg-accent text-white'
                                    : 'bg-muted text-foreground hover:bg-border'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => updateParams('page', String(page + 1))}
                        disabled={page >= totalPages}
                        className="p-2 rounded-lg bg-muted text-foreground hover:bg-border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <LuChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function BlogPage() {
    return (
        <Suspense fallback={
            <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="h-10 w-48 skeleton rounded-lg mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-72 skeleton rounded-xl" />
                    ))}
                </div>
            </div>
        }>
            <BlogContent />
        </Suspense>
    );
}
