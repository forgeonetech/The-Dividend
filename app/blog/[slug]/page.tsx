'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Article, Comment } from '@/lib/types';
import { formatDate, formatNumber } from '@/lib/utils';
import ArticleCard from '@/components/articles/ArticleCard';
import {
    LuHeart, LuBookmark, LuShare2, LuMessageSquare, LuClock, LuEye,
    LuCalendar, LuChevronLeft
} from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function ArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    const { profile } = useAuth();

    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [moreArticles, setMoreArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [commentInput, setCommentInput] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const supabase = createClient();

                // Fetch article
                const { data: articleData } = await supabase
                    .from('articles')
                    .select('*, author:users(*), category:categories(*)')
                    .eq('slug', slug)
                    .eq('status', 'published')
                    .maybeSingle();

                if (!articleData) {
                    setLoading(false);
                    return;
                }

                setArticle(articleData);
                setLikeCount(articleData.likes || 0);

                // Increment views
                supabase.rpc('increment_views', { article_id: articleData.id }).then();

                // Record reading history
                if (profile) {
                    supabase.from('reading_history').upsert({
                        user_id: profile.id,
                        article_id: articleData.id,
                        last_read_at: new Date().toISOString(),
                    }, { onConflict: 'user_id,article_id' }).then();
                }

                // Fetch comments
                const { data: commentsData } = await supabase
                    .from('comments')
                    .select('*, user:users(*)')
                    .eq('article_id', articleData.id)
                    .order('created_at', { ascending: true });
                setComments(commentsData || []);

                // Check like/bookmark status
                if (profile) {
                    const [likeRes, bookmarkRes] = await Promise.all([
                        supabase.from('article_likes').select('id').eq('user_id', profile.id).eq('article_id', articleData.id).maybeSingle(),
                        supabase.from('bookmarks').select('id').eq('user_id', profile.id).eq('article_id', articleData.id).maybeSingle(),
                    ]);
                    setIsLiked(!!likeRes.data);
                    setIsBookmarked(!!bookmarkRes.data);
                }

                // Fetch more from author
                const { data: moreData } = await supabase
                    .from('articles')
                    .select('*, author:users(*), category:categories(*)')
                    .eq('status', 'published')
                    .eq('author_id', articleData.author_id)
                    .neq('id', articleData.id)
                    .order('created_at', { ascending: false })
                    .limit(3);
                setMoreArticles(moreData || []);
            } catch {
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [slug, profile]);

    const handleLike = async () => {
        if (!profile) { toast.error('Please sign in to like articles'); return; }
        const supabase = createClient();
        if (isLiked) {
            await supabase.from('article_likes').delete().eq('user_id', profile.id).eq('article_id', article!.id);
            setIsLiked(false);
            setLikeCount((c) => c - 1);
        } else {
            await supabase.from('article_likes').insert({ user_id: profile.id, article_id: article!.id });
            setIsLiked(true);
            setLikeCount((c) => c + 1);
        }
    };

    const handleBookmark = async () => {
        if (!profile) { toast.error('Please sign in to bookmark articles'); return; }
        const supabase = createClient();
        if (isBookmarked) {
            await supabase.from('bookmarks').delete().eq('user_id', profile.id).eq('article_id', article!.id);
            setIsBookmarked(false);
            toast.success('Removed from bookmarks');
        } else {
            await supabase.from('bookmarks').insert({ user_id: profile.id, article_id: article!.id });
            setIsBookmarked(true);
            toast.success('Added to bookmarks');
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) { toast.error('Please sign in to comment'); return; }
        if (!commentInput.trim()) return;
        setSubmitting(true);
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('comments')
                .insert({
                    article_id: article!.id,
                    user_id: profile.id,
                    content: commentInput.trim(),
                    parent_id: replyTo,
                })
                .select('*, user:users(*)')
                .single();

            if (data) {
                setComments((prev) => [...prev, data]);
                setCommentInput('');
                setReplyTo(null);
                toast.success('Comment posted');
            }
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    // Build threaded comments
    const buildThread = (list: Comment[]) => {
        const map: Record<string, Comment[]> = {};
        const roots: Comment[] = [];
        list.forEach((c) => {
            if (c.parent_id) {
                if (!map[c.parent_id]) map[c.parent_id] = [];
                map[c.parent_id].push(c);
            } else {
                roots.push(c);
            }
        });
        return { roots, map };
    };

    const { roots, map } = buildThread(comments);

    // Render article content from TipTap JSON
    const renderContent = (content: Record<string, unknown>) => {
        if (!content || !content.type) {
            return <p className="text-muted-foreground">No content available.</p>;
        }

        // If the content is HTML string stored in content.html
        if (typeof content === 'object' && content.html) {
            return <div className="article-content" dangerouslySetInnerHTML={{ __html: content.html as string }} />;
        }

        // For TipTap JSON, render recursively
        const renderNodes = (nodes: unknown[]): React.ReactNode[] => {
            return nodes.map((node: unknown, idx: number) => {
                const n = node as Record<string, unknown>;
                switch (n.type) {
                    case 'paragraph':
                        return <p key={idx}>{n.content ? renderNodes(n.content as unknown[]) : null}</p>;
                    case 'heading': {
                        const level = (n.attrs as Record<string, unknown>)?.level || 2;
                        const children = n.content ? renderNodes(n.content as unknown[]) : null;
                        if (level === 1) return <h1 key={idx}>{children}</h1>;
                        if (level === 2) return <h2 key={idx}>{children}</h2>;
                        if (level === 3) return <h3 key={idx}>{children}</h3>;
                        if (level === 4) return <h4 key={idx}>{children}</h4>;
                        if (level === 5) return <h5 key={idx}>{children}</h5>;
                        return <h6 key={idx}>{children}</h6>;
                    }
                    case 'text': {
                        let text: React.ReactNode = n.text as string;
                        const marks = n.marks as Array<Record<string, unknown>> | undefined;
                        if (marks) {
                            marks.forEach((mark) => {
                                if (mark.type === 'bold') text = <strong key={idx}>{text}</strong>;
                                if (mark.type === 'italic') text = <em key={idx}>{text}</em>;
                                if (mark.type === 'underline') text = <u key={idx}>{text}</u>;
                                if (mark.type === 'link') {
                                    const attrs = mark.attrs as Record<string, string>;
                                    text = <a key={idx} href={attrs?.href} target="_blank" rel="noopener noreferrer">{text}</a>;
                                }
                            });
                        }
                        return text;
                    }
                    case 'blockquote':
                        return <blockquote key={idx}>{n.content ? renderNodes(n.content as unknown[]) : null}</blockquote>;
                    case 'bulletList':
                        return <ul key={idx}>{n.content ? renderNodes(n.content as unknown[]) : null}</ul>;
                    case 'orderedList':
                        return <ol key={idx}>{n.content ? renderNodes(n.content as unknown[]) : null}</ol>;
                    case 'listItem':
                        return <li key={idx}>{n.content ? renderNodes(n.content as unknown[]) : null}</li>;
                    case 'image':
                        return <img key={idx} src={(n.attrs as Record<string, string>)?.src} alt={(n.attrs as Record<string, string>)?.alt || ''} />;
                    case 'horizontalRule':
                        return <hr key={idx} />;
                    case 'codeBlock':
                        return <pre key={idx}><code>{n.content ? renderNodes(n.content as unknown[]) : null}</code></pre>;
                    default:
                        return n.content ? <div key={idx}>{renderNodes(n.content as unknown[])}</div> : null;
                }
            });
        };

        return (
            <div className="article-content">
                {content.content ? renderNodes(content.content as unknown[]) : null}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="h-80 skeleton rounded-2xl mb-8" />
                <div className="h-8 w-2/3 skeleton rounded-lg mb-4" />
                <div className="h-4 w-1/3 skeleton rounded-lg mb-8" />
                <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-4 skeleton rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Article Not Found</h1>
                <p className="text-muted-foreground mb-8">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <Link href="/blog" className="px-6 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all text-sm">
                    Browse Articles
                </Link>
            </div>
        );
    }

    const categoryColor = (!article.category?.color || article.category.color === '#E97820') ? 'var(--primary)' : article.category.color;
    const isThemeColor = categoryColor === 'var(--primary)';

    return (
        <div className="relative">
            {/* Banner */}
            <div className="relative w-full h-72 sm:h-96 lg:h-[480px] overflow-hidden">
                {article.banner_url ? (
                    <img src={article.banner_url} alt={article.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <Link
                    href="/blog"
                    className="absolute top-6 left-6 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg"
                >
                    <LuChevronLeft size={16} /> Back to articles
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                {/* Article header card */}
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
                    {article.category && (
                        <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-md mb-4 ${isThemeColor ? 'text-accent-foreground' : 'text-white'}`}
                            style={{ backgroundColor: categoryColor }}
                        >
                            {article.category.name}
                        </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground leading-tight mb-4">
                        {article.title}
                    </h1>

                    {/* Author & Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            {article.author?.avatar_url ? (
                                <img src={article.author.avatar_url} alt={article.author_name || article.author.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-semibold">
                                    {(article.author_name || article.author?.name || 'A')[0]}
                                </div>
                            )}
                            <span className="font-medium text-foreground">{article.author_name || article.author?.name || 'Author'}</span>
                        </div>
                        <span className="flex items-center gap-1"><LuCalendar size={14} /> {formatDate(article.created_at)}</span>
                        <span className="flex items-center gap-1"><LuClock size={14} /> {article.read_time} min read</span>
                        <span className="flex items-center gap-1"><LuEye size={14} /> {formatNumber(article.views)} views</span>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sticky Side Actions */}
                    <aside className="hidden lg:flex flex-col items-center gap-4 sticky top-24 h-fit">
                        <button
                            onClick={handleLike}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-border'
                                }`}
                        >
                            <LuHeart size={20} className={isLiked ? 'fill-current' : ''} />
                        </button>
                        <span className="text-xs text-muted-foreground font-medium">{formatNumber(likeCount)}</span>

                        <button
                            onClick={handleBookmark}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isBookmarked ? 'bg-accent-light text-accent' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-border'
                                }`}
                        >
                            <LuBookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
                        </button>

                        <button
                            onClick={handleShare}
                            className="w-11 h-11 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-border transition-all"
                        >
                            <LuShare2 size={20} />
                        </button>

                        <a
                            href="#comments"
                            className="w-11 h-11 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground hover:bg-border transition-all"
                        >
                            <LuMessageSquare size={20} />
                        </a>
                        <span className="text-xs text-muted-foreground font-medium">{comments.length}</span>
                    </aside>

                    {/* Content */}
                    <article className="flex-1 min-w-0">
                        {renderContent(article.content)}

                        {/* Mobile Actions */}
                        <div className="flex lg:hidden items-center justify-center gap-3 py-6 border-y border-border my-8">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <LuHeart size={16} className={isLiked ? 'fill-current' : ''} /> {formatNumber(likeCount)}
                            </button>
                            <button
                                onClick={handleBookmark}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isBookmarked ? 'bg-accent-light text-accent' : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                <LuBookmark size={16} className={isBookmarked ? 'fill-current' : ''} /> Save
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground"
                            >
                                <LuShare2 size={16} /> Share
                            </button>
                        </div>

                        {/* Author Bio Card */}
                        {article.author && (
                            <div className="p-6 bg-muted/50 border border-border rounded-xl mt-8 flex flex-col sm:flex-row items-start gap-4">
                                {article.author.avatar_url ? (
                                    <img src={article.author.avatar_url} alt={article.author_name || article.author.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-lg shrink-0">
                                        {(article.author_name || article.author.name || 'A')[0]}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-foreground">{article.author_name || article.author.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{article.author.bio || 'Author at The Dividend'}</p>
                                    {profile && profile.id !== article.author.id && (
                                        <Link
                                            href={`/dashboard/messages?user=${article.author.id}`}
                                            className="text-sm text-accent font-medium hover:underline mt-2 inline-block"
                                        >
                                            Send a message →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* More from Author */}
                        {moreArticles.length > 0 && (
                            <div className="mt-12">
                                <h3 className="text-xl font-serif font-bold text-foreground mb-4">More from {article.author?.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {moreArticles.map((a) => (
                                        <ArticleCard key={a.id} article={a} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div id="comments" className="mt-12">
                            <h3 className="text-xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                                <LuMessageSquare size={20} className="text-accent" />
                                Comments ({comments.length})
                            </h3>

                            {/* Comment Input */}
                            {profile ? (
                                <form onSubmit={handleComment} className="mb-8">
                                    {replyTo && (
                                        <div className="mb-2 text-xs text-muted-foreground">
                                            Replying to a comment{' '}
                                            <button onClick={() => setReplyTo(null)} className="text-accent hover:underline">Cancel</button>
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-semibold shrink-0">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                profile.name?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                                placeholder="Share your thoughts..."
                                                rows={3}
                                                className="w-full p-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                                            />
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    type="submit"
                                                    disabled={submitting || !commentInput.trim()}
                                                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                                                >
                                                    {submitting ? 'Posting...' : 'Post Comment'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="mb-8 p-4 bg-muted/50 rounded-xl text-center">
                                    <p className="text-sm text-muted-foreground">
                                        <Link href="/login" className="text-accent hover:underline font-medium">Sign in</Link> to join the conversation
                                    </p>
                                </div>
                            )}

                            {/* Comment List */}
                            <div className="space-y-4">
                                {roots.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        replies={map[comment.id] || []}
                                        nestedMap={map}
                                        onReply={(id) => { setReplyTo(id); }}
                                        profile={profile}
                                    />
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No comments yet. Be the first to share your thoughts!
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    replies,
    nestedMap,
    onReply,
    profile,
}: {
    comment: Comment;
    replies: Comment[];
    nestedMap: Record<string, Comment[]>;
    onReply: (id: string) => void;
    profile: import('@/lib/types').User | null;
}) {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                {comment.user?.avatar_url ? (
                    <img src={comment.user.avatar_url} alt={comment.user.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-muted-foreground">{comment.user?.name?.[0] || 'U'}</span>
                )}
            </div>
            <div className="flex-1">
                <div className="bg-muted/50 border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{comment.user?.name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                </div>
                {profile && (
                    <button
                        onClick={() => onReply(comment.id)}
                        className="text-xs text-muted-foreground hover:text-accent mt-1 ml-3 transition-colors"
                    >
                        Reply
                    </button>
                )}
                {/* Nested replies */}
                {replies.length > 0 && (
                    <div className="ml-4 mt-3 space-y-3 border-l-2 border-border pl-4">
                        {replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                replies={nestedMap[reply.id] || []}
                                nestedMap={nestedMap}
                                onReply={onReply}
                                profile={profile}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
