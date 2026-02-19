'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/hooks/useTheme';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NAV_LINKS, SITE_NAME } from '@/lib/constants';
import { getInitials } from '@/lib/utils';
import {
    LuSearch, LuSun, LuMoon, LuBell, LuSquarePen, LuMenu, LuX,
    LuUser, LuBookmark, LuMessageSquare, LuSettings, LuLogOut, LuLayoutDashboard
} from 'react-icons/lu';

export default function Header() {
    const { profile, loading, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { unreadCount } = useNotifications();
    const router = useRouter();
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
    }, [pathname]);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/blog?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-card/95 backdrop-blur-md shadow-md border-b border-border'
                    : 'bg-card border-b border-border'
                    }`}
                style={{ height: 'var(--header-height)' }}
            >
                <div className="max-w-[var(--max-width)] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
                            <span className="text-accent-foreground font-bold text-lg font-serif">D</span>
                        </div>
                        <span className="text-xl font-bold text-foreground font-serif tracking-tight hidden sm:inline">
                            {SITE_NAME}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${pathname === link.href
                                    ? 'text-accent bg-accent-light'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Search Toggle */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            aria-label="Search"
                        >
                            <LuSearch size={20} />
                        </button>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <LuMoon size={20} /> : <LuSun size={20} />}
                        </button>

                        {/* Notifications (logged in) */}
                        {profile && (
                            <Link
                                href="/dashboard/notifications"
                                className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all relative"
                                aria-label="Notifications"
                            >
                                <LuBell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Write Button (admin only) */}
                        {isAdmin && (
                            <Link
                                href="/admin/write"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                <LuSquarePen size={16} />
                                Write
                            </Link>
                        )}

                        {/* User Avatar / Auth */}
                        {loading ? (
                            <div className="w-9 h-9 rounded-full skeleton" />
                        ) : profile ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-accent transition-all duration-200 flex items-center justify-center bg-accent-light text-accent font-semibold text-sm"
                                >
                                    {profile.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(profile.name || 'U')
                                    )}
                                </button>

                                {/* Dropdown */}
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-xl shadow-xl animate-scale-in overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-border">
                                            <p className="font-semibold text-sm text-foreground truncate">{profile.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                                <LuUser size={16} /> Profile
                                            </Link>
                                            <Link href="/dashboard/bookmarks" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                                <LuBookmark size={16} /> Bookmarks
                                            </Link>
                                            <Link href="/dashboard/messages" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                                <LuMessageSquare size={16} /> Messages
                                            </Link>
                                            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                                <LuSettings size={16} /> Settings
                                            </Link>
                                            {isAdmin && (
                                                <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-accent-light transition-all">
                                                    <LuLayoutDashboard size={16} /> Admin Dashboard
                                                </Link>
                                            )}
                                        </div>
                                        <div className="border-t border-border py-1">
                                            <button
                                                onClick={signOut}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-muted transition-all w-full text-left"
                                            >
                                                <LuLogOut size={16} /> Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <LuX size={20} /> : <LuMenu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl animate-slide-in-right border-l border-border" style={{ paddingTop: 'var(--header-height)' }}>
                        <nav className="p-4 flex flex-col gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${pathname === link.href
                                        ? 'text-accent bg-accent-light'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAdmin && (
                                <>
                                    <hr className="my-2 border-border" />
                                    <Link
                                        href="/admin/write"
                                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-accent hover:bg-accent-light transition-all"
                                    >
                                        <LuSquarePen size={16} /> Write Article
                                    </Link>
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-accent hover:bg-accent-light transition-all"
                                    >
                                        <LuLayoutDashboard size={16} /> Dashboard
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
                    <div className="relative w-full max-w-xl mx-4 animate-slide-in-down">
                        <form onSubmit={handleSearch}>
                            <div className="relative">
                                <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search articles, topics, authors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-xl"
                                />
                            </div>
                        </form>
                        <p className="text-center text-xs text-muted-foreground mt-3">
                            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">ESC</kbd> to close
                        </p>
                    </div>
                </div>
            )}

            {/* Spacer */}
            <div style={{ height: 'var(--header-height)' }} />
        </>
    );
}
