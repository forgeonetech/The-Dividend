'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { LuSettings, LuPlus, LuTrash2 } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function SiteSettingsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [newCatSlug, setNewCatSlug] = useState('');
    const [newCatColor, setNewCatColor] = useState('#E97820');
    const [newCatIcon, setNewCatIcon] = useState('📊');
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    const fetchCategories = async () => {
        try {
            const { data } = await supabase.from('categories').select('*').order('name');
            setCategories(data || []);
        } catch { setCategories([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const addCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('categories').insert({
                name: newCatName.trim(),
                slug: newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
                color: newCatColor,
                icon: newCatIcon,
            });
            if (error) throw error;
            toast.success('Category added');
            setNewCatName('');
            setNewCatSlug('');
            fetchCategories();
        } catch { toast.error('Failed to add category'); }
        finally { setSaving(false); }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await supabase.from('categories').delete().eq('id', id);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            toast.success('Category deleted');
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Site Settings</h1>

            {/* Categories Management */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LuSettings size={18} className="text-accent" /> Manage Categories
                </h2>

                <form onSubmit={addCategory} className="flex flex-wrap gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Category name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        required
                        className="h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground flex-1 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                        type="text"
                        placeholder="Slug (auto)"
                        value={newCatSlug}
                        onChange={(e) => setNewCatSlug(e.target.value)}
                        className="h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground w-32 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                        type="text"
                        placeholder="Icon emoji"
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        className="h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground w-20 text-center focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="h-10 w-10 rounded-lg cursor-pointer border border-border"
                    />
                    <button type="submit" disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60">
                        <LuPlus size={14} /> Add
                    </button>
                </form>

                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <span className="text-lg">{cat.icon}</span>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium text-foreground flex-1">{cat.name}</span>
                                <span className="text-xs text-muted-foreground">{cat.slug}</span>
                                <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-red-50 transition-all">
                                    <LuTrash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
