import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Articles',
    description: 'Explore thoughtful insights on investing, wealth building, and financial clarity.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
