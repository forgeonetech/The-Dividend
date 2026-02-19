// ============================================
// THE DIVIDEND — Constants
// ============================================

export const SITE_NAME = 'The Dividend';
export const SITE_DESCRIPTION = 'A premium financial education and insight platform focused on long-term thinking, systems, wealth, and clarity.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Bookstore', href: '/bookstore' },
    { label: 'Contact', href: '/contact' },
] as const;

export const CATEGORIES_COLORS: Record<string, string> = {
    investing: '#000000',
    'personal-finance': '#2563EB',
    'wealth-building': '#059669',
    'systems-strategy': '#7C3AED',
    mindset: '#DC2626',
    'book-reviews': '#CA8A04',
    'market-analysis': '#0891B2',
};

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Trending', value: 'trending' },
    { label: 'Most Read', value: 'most_read' },
] as const;
