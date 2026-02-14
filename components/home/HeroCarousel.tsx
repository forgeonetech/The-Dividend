'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Article } from '@/lib/types';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function HeroCarousel() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('articles')
                    .select('*, author:users(*), category:categories(*)')
                    .eq('is_featured', true)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(5);
                setArticles(data || []);
            } catch {
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const next = useCallback(() => {
        if (articles.length === 0) return;
        setCurrent((prev) => (prev + 1) % articles.length);
    }, [articles.length]);

    const prev = useCallback(() => {
        if (articles.length === 0) return;
        setCurrent((prev) => (prev - 1 + articles.length) % articles.length);
    }, [articles.length]);

    // Auto-rotate
    useEffect(() => {
        if (articles.length <= 1) return;
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [articles.length, next]);

    if (loading) {
        return (
            <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] bg-muted rounded-2xl overflow-hidden skeleton" />
        );
    }

    if (articles.length === 0) {
        return (
            <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] bg-gradient-to-br from-accent/5 via-transparent to-accent/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <span className="text-4xl font-serif font-bold text-accent">D</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-4">
                    Invest in Your <span className="text-accent">Mind</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mb-8">
                    Long-form insights on investing, wealth building, and financial clarity. Your journey to financial wisdom starts here.
                </p>
                <div className="flex gap-3">
                    <Link
                        href="/blog"
                        className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all text-sm"
                    >
                        Read Articles
                    </Link>
                    <Link
                        href="/bookstore"
                        className="px-6 py-3 bg-muted hover:bg-border text-foreground rounded-xl font-medium transition-all text-sm"
                    >
                        Browse Books
                    </Link>
                </div>
            </div>
        );
    }

    const currentArticle = articles[current];
    const categoryColor = currentArticle?.category?.color || '#E97820';

    return (
        <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden group">
            {/* Background Image */}
            {articles.map((article, idx) => (
                <div
                    key={article.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    {article.banner_url ? (
                        <img
                            src={article.banner_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
            ))}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-14 z-10">
                <div className="max-w-2xl animate-fade-in-up" key={current}>
                    {currentArticle?.category && (
                        <span
                            className="inline-block px-3 py-1 text-xs font-semibold rounded-md text-white mb-4"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {currentArticle.category.name}
                        </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight mb-3">
                        {currentArticle?.title}
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-lg line-clamp-2">
                        {currentArticle?.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/blog/${currentArticle?.slug}`}
                            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-all text-sm"
                        >
                            Read Article
                        </Link>
                        <Link
                            href="/bookstore"
                            className="px-6 py-2.5 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white rounded-lg font-medium transition-all text-sm border border-white/20"
                        >
                            Browse Books
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {articles.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        aria-label="Previous slide"
                    >
                        <LuChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        aria-label="Next slide"
                    >
                        <LuChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Dots */}
            {articles.length > 1 && (
                <div className="absolute bottom-4 right-6 sm:right-10 lg:right-14 flex items-center gap-2 z-10">
                    {articles.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === current ? 'bg-accent w-6' : 'bg-white/40 w-1.5 hover:bg-white/60'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
