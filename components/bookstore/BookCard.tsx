import Link from 'next/link';
import type { Book } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { LuShoppingCart } from 'react-icons/lu';

interface BookCardProps {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    return (
        <Link href={`/bookstore/${book.id}`} className="group block">
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                    {book.cover_url ? (
                        <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5 p-4">
                            <span className="text-5xl font-serif font-bold text-accent/20 mb-2">D</span>
                            <span className="text-sm font-serif text-accent/40 text-center">{book.title}</span>
                        </div>
                    )}
                    {book.is_featured && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-md">
                            Featured
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-serif font-semibold text-foreground text-base leading-snug group-hover:text-accent transition-colors line-clamp-1">
                        {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-accent">{formatPrice(book.price)}</span>
                        <button className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center hover:bg-accent hover:text-white transition-all">
                            <LuShoppingCart size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
