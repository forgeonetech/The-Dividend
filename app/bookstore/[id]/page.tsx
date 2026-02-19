'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Book } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { LuChevronLeft, LuShoppingCart, LuStar, LuBookOpen } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { profile } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [alreadyPurchased, setAlreadyPurchased] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('books')
                    .select('*, category:categories(*)')
                    .eq('id', params.id as string)
                    .maybeSingle();
                setBook(data);

                // Check if already purchased
                if (profile && data) {
                    const { data: purchase } = await supabase
                        .from('purchases')
                        .select('id')
                        .eq('user_id', profile.id)
                        .eq('book_id', data.id)
                        .eq('status', 'success')
                        .maybeSingle();
                    setAlreadyPurchased(!!purchase);
                }
            } catch {
                setBook(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [params.id, profile]);

    const handlePurchase = async () => {
        if (!profile) {
            toast.error('Please sign in to purchase');
            router.push('/login');
            return;
        }
        setPurchasing(true);
        try {
            const res = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: book!.id,
                    email: profile.email,
                    amount: book!.price * 100, // kobo
                }),
            });
            const data = await res.json();
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                toast.error('Failed to initialize payment');
            }
        } catch {
            toast.error('Payment initialization failed');
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 aspect-[3/4] skeleton rounded-xl" />
                    <div className="flex-1 space-y-4">
                        <div className="h-8 w-2/3 skeleton rounded-lg" />
                        <div className="h-4 w-1/3 skeleton rounded" />
                        <div className="h-4 w-full skeleton rounded" />
                        <div className="h-4 w-full skeleton rounded" />
                        <div className="h-4 w-2/3 skeleton rounded" />
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Book Not Found</h1>
                <p className="text-muted-foreground mb-8">This book doesn&apos;t exist or has been removed.</p>
                <Link href="/bookstore" className="px-6 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all text-sm">
                    Browse Bookstore
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <Link href="/bookstore" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors">
                <LuChevronLeft size={16} /> Back to Bookstore
            </Link>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                {/* Cover */}
                <div className="w-full md:w-80 shrink-0">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-lg">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 p-6">
                                <LuBookOpen size={48} className="text-accent/30 mb-3" />
                                <span className="text-base font-serif text-accent/50 text-center">{book.title}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                    {book.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 inline-block">
                            {book.category.name}
                        </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2">{book.title}</h1>
                    <p className="text-muted-foreground mb-4">by <span className="text-foreground font-medium">{book.author}</span></p>

                    {/* Rating placeholder */}
                    <div className="flex items-center gap-1 mb-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <LuStar key={i} size={16} className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                        ))}
                        <span className="text-sm text-muted-foreground ml-2">4.0</span>
                    </div>

                    <p className="text-3xl font-bold text-accent mb-6">{formatPrice(book.price)}</p>

                    <div className="prose text-foreground/80 text-sm leading-relaxed mb-8">
                        <p>{book.description || 'No description available for this book yet.'}</p>
                    </div>

                    {alreadyPurchased ? (
                        <div className="px-6 py-3 bg-success/10 text-success rounded-xl font-medium inline-flex items-center gap-2">
                            ✓ You own this book
                        </div>
                    ) : (
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all disabled:opacity-60"
                        >
                            <LuShoppingCart size={18} />
                            {purchasing ? 'Processing...' : `Buy Now — ${formatPrice(book.price)}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
