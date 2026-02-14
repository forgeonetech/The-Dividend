'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Purchase } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { LuShoppingBag } from 'react-icons/lu';

export default function PurchasesPage() {
    const { profile } = useAuth();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;
        const fetch = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('purchases')
                    .select('*, book:books(*)')
                    .eq('user_id', profile.id)
                    .order('created_at', { ascending: false });
                setPurchases(data || []);
            } catch { setPurchases([]); }
            finally { setLoading(false); }
        };
        fetch();
    }, [profile]);

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Purchases</h1>
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
                </div>
            ) : purchases.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuShoppingBag size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No purchases yet</h3>
                    <p className="text-sm text-muted-foreground">Books you purchase will appear here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {purchases.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                            <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                {p.book?.cover_url && (
                                    <img src={p.book.cover_url} alt={p.book.title} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm truncate">{p.book?.title || 'Book'}</p>
                                <p className="text-xs text-muted-foreground">{p.book?.author}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDate(p.created_at)}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-accent">{formatPrice(p.amount)}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-green-50 text-green-600' :
                                        p.status === 'failed' ? 'bg-red-50 text-red-600' :
                                            'bg-yellow-50 text-yellow-600'
                                    }`}>
                                    {p.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
