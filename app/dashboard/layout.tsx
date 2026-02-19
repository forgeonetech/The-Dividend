'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuUser, LuBookmark, LuMessageSquare, LuBell, LuSettings, LuHistory, LuShoppingBag } from 'react-icons/lu';

const sidebarItems = [
    { label: 'Profile', href: '/dashboard/profile', icon: LuUser },
    { label: 'Bookmarks', href: '/dashboard/bookmarks', icon: LuBookmark },
    { label: 'Reading History', href: '/dashboard/history', icon: LuHistory },
    { label: 'Purchases', href: '/dashboard/purchases', icon: LuShoppingBag },
    { label: 'Messages', href: '/dashboard/messages', icon: LuMessageSquare },
    { label: 'Notifications', href: '/dashboard/notifications', icon: LuBell },
    { label: 'Settings', href: '/dashboard/settings', icon: LuSettings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useAuth();
    const pathname = usePathname();

    if (loading) {
        return (
            <div className="max-w-[var(--max-width)] mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-[var(--max-width)] mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Please sign in</h2>
                <p className="text-muted-foreground mb-6">You need to be signed in to access your dashboard.</p>
                <Link href="/login" className="px-6 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all text-sm">
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-accent-light text-accent flex items-center justify-center text-lg font-semibold">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                profile.name?.[0] || 'U'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                    </div>

                    <nav className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
                        {sidebarItems.map((item) => {
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
                                    <Icon size={18} />
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
