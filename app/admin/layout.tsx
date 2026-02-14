'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
    LuLayoutDashboard, LuFileText, LuBookOpen, LuMessageSquare,
    LuBell, LuChartBar, LuSquarePen, LuSettings
} from 'react-icons/lu';

const adminNav = [
    { label: 'Overview', href: '/admin', icon: LuLayoutDashboard },
    { label: 'Posts', href: '/admin/posts', icon: LuFileText },
    { label: 'Books', href: '/admin/books', icon: LuBookOpen },
    { label: 'Messages', href: '/admin/messages', icon: LuMessageSquare },
    { label: 'Notifications', href: '/admin/notifications', icon: LuBell },
    { label: 'Analytics', href: '/admin/analytics', icon: LuChartBar },
    { label: 'Settings', href: '/admin/site-settings', icon: LuSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!profile || profile.role !== 'admin')) {
            router.push('/');
        }
    }, [profile, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!profile || profile.role !== 'admin') {
        return null;
    }

    return (
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Admin Sidebar */}
                <aside className="lg:w-56 shrink-0">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <span className="text-white font-bold text-sm font-serif">D</span>
                        </div>
                        <span className="font-bold text-foreground text-sm">Admin Panel</span>
                    </div>

                    <nav className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
                        <Link
                            href="/admin/write"
                            className="flex items-center gap-2 px-3 py-2.5 bg-accent text-white rounded-lg text-sm font-medium mb-2 hover:bg-accent-hover transition-all"
                        >
                            <LuSquarePen size={16} /> New Post
                        </Link>
                        {adminNav.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                        ? 'bg-accent-light text-accent'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
