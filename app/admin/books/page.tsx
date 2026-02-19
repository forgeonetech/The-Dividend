'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Book } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { LuPlus, LuTrash2, LuPen, LuBookOpen } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function AdminBooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    const fetchBooks = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('books')
                .select('*, category:categories(*)')
                .order('created_at', { ascending: false });
            setBooks(data || []);
        } catch { setBooks([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this book?')) return;
        try {
            const supabase = createClient();
            await supabase.from('books').delete().eq('id', id);
            setBooks((prev) => prev.filter((b) => b.id !== id));
            toast.success('Book deleted');
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">Books</h1>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all"
                >
                    <LuPlus size={16} /> Add Book
                </button>
            </div>

            {showAdd && <AddBookForm onComplete={() => { setShowAdd(false); fetchBooks(); }} />}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuBookOpen size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No books yet</h3>
                    <p className="text-sm text-muted-foreground">Add your first book to the store</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {books.map((book) => (
                        <div key={book.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                            <div className="w-12 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                {book.cover_url && (
                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{book.title}</p>
                                <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                            <p className="text-sm font-bold text-accent hidden sm:block">{formatPrice(book.price)}</p>
                            <p className="text-xs text-muted-foreground hidden md:block">{formatDate(book.created_at)}</p>
                            <div className="flex gap-1 shrink-0">
                                <Link href={`/bookstore/${book.id}`} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                                    <LuPen size={14} />
                                </Link>
                                <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg text-muted-foreground hover:text-error hover:bg-red-50 transition-all">
                                    <LuTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddBookForm({ onComplete }: { onComplete: () => void }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('book_covers').upload(path, file);
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('book_covers').getPublicUrl(path);
            setCoverUrl(urlData.publicUrl);
            toast.success('Cover uploaded');
        } catch { toast.error('Failed to upload'); }
        finally { setUploading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !author || !price) { toast.error('Fill required fields'); return; }
        setSaving(true);
        try {
            const { error } = await supabase.from('books').insert({
                title, author, description,
                price: parseFloat(price),
                cover_url: coverUrl || null,
            });
            if (error) throw error;
            toast.success('Book added');
            onComplete();
        } catch { toast.error('Failed to add book'); }
        finally { setSaving(false); }
    };

    return (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Author *</label>
                    <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Price (₦) *</label>
                    <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Cover Image</label>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} className="w-full text-sm text-muted-foreground file:mr-2 file:py-2 file:px-3 file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground file:rounded-lg file:cursor-pointer" />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onComplete} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-all disabled:opacity-60">
                    {saving ? 'Saving...' : 'Add Book'}
                </button>
            </div>
        </form>
    );
}
