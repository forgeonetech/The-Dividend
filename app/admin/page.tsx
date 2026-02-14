'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatNumber } from '@/lib/utils';
import { LuFileText, LuBookOpen, LuUsers, LuMessageSquare, LuDollarSign, LuTrendingUp } from 'react-icons/lu';

interface DashboardStats {
    totalPosts: number;
    totalBooks: number;
    totalUsers: number;
    totalMessages: number;
    totalRevenue: number;
    totalViews: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalPosts: 0,
        totalBooks: 0,
        totalUsers: 0,
        totalMessages: 0,
        totalRevenue: 0,
        totalViews: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const supabase = createClient();
                const [posts, books, users, messages, purchases, articles] = await Promise.all([
                    supabase.from('articles').select('id', { count: 'exact', head: true }),
                    supabase.from('books').select('id', { count: 'exact', head: true }),
                    supabase.from('users').select('id', { count: 'exact', head: true }),
                    supabase.from('messages').select('id', { count: 'exact', head: true }),
                    supabase.from('purchases').select('amount').eq('status', 'success'),
                    supabase.from('articles').select('views'),
                ]);

                const totalRevenue = (purchases.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                const totalViews = (articles.data || []).reduce((sum, a) => sum + (a.views || 0), 0);

                setStats({
                    totalPosts: posts.count || 0,
                    totalBooks: books.count || 0,
                    totalUsers: users.count || 0,
                    totalMessages: messages.count || 0,
                    totalRevenue,
                    totalViews,
                });
            } catch {
                // leave defaults
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { label: 'Total Posts', value: formatNumber(stats.totalPosts), icon: LuFileText, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Total Books', value: formatNumber(stats.totalBooks), icon: LuBookOpen, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Total Users', value: formatNumber(stats.totalUsers), icon: LuUsers, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Messages', value: formatNumber(stats.totalMessages), icon: LuMessageSquare, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Revenue', value: `₦${formatNumber(stats.totalRevenue)}`, icon: LuDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Total Views', value: formatNumber(stats.totalViews), icon: LuTrendingUp, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Dashboard Overview</h1>

            {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 skeleton rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</span>
                                    <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                                        <Icon size={18} />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
