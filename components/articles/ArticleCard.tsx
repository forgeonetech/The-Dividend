'use client';

import Link from 'next/link';
import type { Article } from '@/lib/types';
import { formatDate, formatNumber, truncateText } from '@/lib/utils';
import { LuBookmark, LuClock, LuEye, LuHeart } from 'react-icons/lu';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ArticleCardProps {
    article: Article;
    variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
    const { profile } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (!profile) return;
        const supabase = createClient();
        supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', profile.id)
            .eq('article_id', article.id)
            .maybeSingle()
            .then(({ data }) => {
                if (data) setIsBookmarked(true);
            });
    }, [profile, article.id]);

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!profile) {
            toast.error('Please sign in to bookmark articles');
            return;
        }
        const supabase = createClient();
        if (isBookmarked) {
            await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('article_id', article.id);
            setIsBookmarked(false);
            toast.success('Removed from bookmarks');
        } else {
            await supabase.from('bookmarks').insert({ user_id: profile.id, article_id: article.id });
            setIsBookmarked(true);
            toast.success('Added to bookmarks');
        }
    };

    const categoryColor = article.category?.color || '#E97820';

    if (variant === 'horizontal') {
        return (
            <Link href={`/blog/${article.slug}`} className="group flex gap-4 p-4 rounded-xl hover:bg-muted transition-all">
                <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {article.banner_url && (
                        <img src={article.banner_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {article.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: categoryColor }}>
                            {article.category.name}
                        </span>
                    )}
                    <h3 className="font-serif font-semibold text-foreground text-sm sm:text-base mt-0.5 leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {article.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><LuClock size={12} /> {article.read_time} min</span>
                        <span className="flex items-center gap-1"><LuEye size={12} /> {formatNumber(article.views)}</span>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'compact') {
        return (
            <Link href={`/blog/${article.slug}`} className="group flex gap-3 items-start">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                    {article.banner_url && (
                        <img src={article.banner_url} alt={article.title} className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                        {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(article.created_at)}</p>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/blog/${article.slug}`} className="group block">
            <div className={`bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 ${variant === 'featured' ? 'md:flex' : ''}`}>
                {/* Image */}
                <div className={`relative overflow-hidden bg-muted ${variant === 'featured' ? 'md:w-1/2 h-48 md:h-auto' : 'h-48'}`}>
                    {article.banner_url ? (
                        <img
                            src={article.banner_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-light to-muted">
                            <span className="text-4xl font-serif font-bold text-accent/30">D</span>
                        </div>
                    )}
                    {/* Category badge */}
                    {article.category && (
                        <span
                            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-md text-white"
                            style={{ backgroundColor: categoryColor }}
                        >
                            {article.category.name}
                        </span>
                    )}
                    {/* Bookmark button */}
                    <button
                        onClick={toggleBookmark}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isBookmarked
                            ? 'bg-accent text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-accent'
                            }`}
                    >
                        <LuBookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                    </button>
                </div>

                {/* Content */}
                <div className={`p-5 ${variant === 'featured' ? 'md:w-1/2 md:p-6 flex flex-col justify-center' : ''}`}>
                    <h3 className={`font-serif font-semibold text-foreground leading-snug group-hover:text-accent transition-colors ${variant === 'featured' ? 'text-xl md:text-2xl' : 'text-lg'
                        }`}>
                        {article.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-2">
                        {truncateText(article.excerpt || '', 120)}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            {article.author?.avatar_url ? (
                                <img src={article.author.avatar_url} alt={article.author_name || article.author.name} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-semibold">
                                    {(article.author_name || article.author?.name || 'A')[0]}
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">
                                {article.author_name || article.author?.name || 'Author'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><LuClock size={12} /> {article.read_time}m</span>
                            <span className="flex items-center gap-1"><LuHeart size={12} /> {formatNumber(article.likes)}</span>
                            <span className="flex items-center gap-1"><LuEye size={12} /> {formatNumber(article.views)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
