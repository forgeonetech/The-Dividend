import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Bookstore',
    description: 'Curated books to enrich your financial knowledge and build lasting wealth.',
};

export default function BookstoreLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
