'use client';


import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Book, Category } from '@/lib/types';
import BookCard from '@/components/bookstore/BookCard';
import { LuSearch, LuFilter, LuBookOpen } from 'react-icons/lu';

function BookstoreContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const [searchInput, setSearchInput] = useState(search);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase.from('categories').select('*').order('name');
                setCategories(data || []);
            } catch { setCategories([]); }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const supabase = createClient();

                // Featured
                const { data: featured } = await supabase
                    .from('books')
                    .select('*, category:categories(*)')
                    .eq('is_featured', true)
                    .order('created_at', { ascending: false })
                    .limit(4);
                setFeaturedBooks(featured || []);

                // All books
                let query = supabase.from('books').select('*, category:categories(*)');

                if (search) {
                    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
                }
                if (categorySlug) {
                    const cat = categories.find(c => c.slug === categorySlug);
                    if (cat) query = query.eq('category_id', cat.id);
                }

                const { data } = await query.order('created_at', { ascending: false });
                setBooks(data || []);
            } catch { setBooks([]); }
            finally { setLoading(false); }
        };
        fetchBooks();
    }, [search, categorySlug, categories]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        router.push(`/bookstore?${params.toString()}`);
    };

    return (
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Bookstore</h1>
                <p className="text-muted-foreground">Curated books to enrich your financial knowledge</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </form>
                <div className="relative">
                    <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <select
                        value={categorySlug}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams.toString());
                            if (e.target.value) params.set('category', e.target.value);
                            else params.delete('category');
                            router.push(`/bookstore?${params.toString()}`);
                        }}
                        className="h-10 pl-9 pr-8 bg-card border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Featured Books */}
            {featuredBooks.length > 0 && !search && !categorySlug && (
                <section className="mb-12">
                    <h2 className="text-xl font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                        <LuBookOpen className="text-accent" size={20} /> Featured Books
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {featuredBooks.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </section>
            )}

            {/* All Books */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] skeleton rounded-xl" />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <LuBookOpen size={24} className="text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No books found</h3>
                    <p className="text-sm text-muted-foreground">Check back soon for new additions to our collection.</p>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-serif font-bold text-foreground mb-4">All Books</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {books.map((book) => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function BookstorePage() {
    return (
        <Suspense fallback={
            <div className="max-w-[var(--max-width)] mx-auto px-4 py-12">
                <div className="h-10 w-48 skeleton rounded-lg mb-8" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="aspect-[3/4] skeleton rounded-xl" />
                    ))}
                </div>
            </div>
        }>
            <BookstoreContent />
        </Suspense>
    );
}
