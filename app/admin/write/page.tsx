'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { generateSlug, calculateReadTime, extractTextFromContent, optimizeImage } from '@/lib/utils';
import { LuSave, LuEye, LuGlobe, LuImage, LuStar } from 'react-icons/lu';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(() => import('@/components/admin/TipTapEditor'), { ssr: false });

function WriteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const { profile } = useAuth();
    const supabase = createClient();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [bannerUrl, setBannerUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isEditorsPick, setIsEditorsPick] = useState(false);
    const [content, setContent] = useState<Record<string, unknown>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    // Fetch categories
    useEffect(() => {
        supabase.from('categories').select('*').order('name').then(({ data }) => {
            setCategories(data || []);
        });
    }, [supabase]);

    // Load article for editing
    useEffect(() => {
        if (!editId) return;
        const loadArticle = async () => {
            const { data } = await supabase
                .from('articles')
                .select('*')
                .eq('id', editId)
                .maybeSingle();
            if (data) {
                setTitle(data.title);
                setSlug(data.slug);
                setExcerpt(data.excerpt);
                setBannerUrl(data.banner_url || '');
                setCategoryId(data.category_id || '');
                setSeoKeywords(data.seo_keywords || '');
                setIsFeatured(data.is_featured);
                setIsEditorsPick(data.is_editors_pick);
                setContent(data.content || {});
            }
        };
        loadArticle();
    }, [editId, supabase]);

    // Auto-generate slug from title
    useEffect(() => {
        if (!editId && title) {
            setSlug(generateSlug(title));
        }
    }, [title, editId]);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBanner(true);
        try {
            // Optimize image (resize & compress)
            const optimizedBlob = await optimizeImage(file);
            const path = `${Date.now()}.jpg`; // Always jpg after optimization

            const { error } = await supabase.storage.from('article_banners').upload(path, optimizedBlob, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });
            if (error) throw error;

            const { data: urlData } = supabase.storage.from('article_banners').getPublicUrl(path);
            setBannerUrl(urlData.publicUrl);
            toast.success('Banner uploaded');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload banner');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleSave = async (status: 'draft' | 'published') => {
        if (!title.trim()) { toast.error('Title is required'); return; }
        if (!profile) return;

        setSaving(true);
        try {
            const textContent = extractTextFromContent(content);
            const readTime = calculateReadTime(textContent);

            const articleData = {
                title: title.trim(),
                slug: slug || generateSlug(title),
                excerpt: excerpt.trim(),
                banner_url: bannerUrl || null,
                content,
                category_id: categoryId || null,
                read_time: readTime,
                is_featured: isFeatured,
                is_editors_pick: isEditorsPick,
                seo_keywords: seoKeywords,
                status,
                author_id: profile.id,
            };

            if (editId) {
                const { error } = await supabase.from('articles').update(articleData).eq('id', editId);
                if (error) throw error;
                toast.success(status === 'published' ? 'Article updated & published!' : 'Draft saved');

                if (status === 'published') {
                    router.push('/admin/posts');
                }
                // If draft, stay on page to continue editing
            } else {
                const { data, error } = await supabase.from('articles').insert(articleData).select().single();
                if (error) throw error;
                toast.success(status === 'published' ? 'Article published!' : 'Draft saved');

                if (status === 'draft' && data) {
                    // Switch to edit mode for the newly created draft
                    router.push(`/admin/write?edit=${data.id}`);
                } else {
                    router.push('/admin/posts');
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to save';
            toast.error(msg);
        } finally {
            setSaving(false);
        }

    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">
                    {editId ? 'Edit Article' : 'Write New Article'}
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-border text-foreground rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                    >
                        <LuSave size={14} /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                    >
                        <LuGlobe size={14} /> Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Article title..."
                            className="w-full text-2xl sm:text-3xl font-serif font-bold text-foreground bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="article-slug"
                            className="w-full h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Excerpt</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief summary of the article..."
                            rows={3}
                            className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Editor */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden tiptap-editor">
                        <TipTapEditor content={content} onChange={setContent} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Banner Image */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <LuImage size={16} className="text-accent" /> Banner Image
                        </h3>
                        {bannerUrl ? (
                            <div className="relative">
                                <img src={bannerUrl} alt="Banner" className="w-full h-40 object-cover rounded-lg" />
                                <button
                                    onClick={() => setBannerUrl('')}
                                    className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent hover:bg-accent-light/20 transition-all">
                                <LuImage size={24} className="text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground">
                                    {uploadingBanner ? 'Uploading...' : 'Click to upload'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerUpload}
                                    className="hidden"
                                    disabled={uploadingBanner}
                                />
                            </label>
                        )}
                    </div>

                    {/* Category */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* SEO Keywords */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <label className="block text-sm font-semibold text-foreground mb-2">SEO Keywords</label>
                        <input
                            type="text"
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            placeholder="investing, wealth, finance"
                            className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                <LuGlobe size={16} className="text-accent" /> Featured
                            </span>
                            <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${isFeatured ? 'bg-accent' : 'bg-border'}`} onClick={() => setIsFeatured(!isFeatured)}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${isFeatured ? 'ml-[18px]' : 'ml-0.5'}`} />
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                <LuStar size={16} className="text-yellow-500" /> Editor&apos;s Pick
                            </span>
                            <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${isEditorsPick ? 'bg-accent' : 'bg-border'}`} onClick={() => setIsEditorsPick(!isEditorsPick)}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${isEditorsPick ? 'ml-[18px]' : 'ml-0.5'}`} />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WritePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        }>
            <WriteContent />
        </Suspense>
    );
}
