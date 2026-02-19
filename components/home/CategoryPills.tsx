'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';

export default function CategoryPills() {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('categories')
                    .select('*')
                    .order('post_count', { ascending: false });
                setCategories(data || []);
            } catch {
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    if (categories.length === 0) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
            <Link
                href="/blog"
                className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-accent text-accent-foreground hover:bg-accent-hover transition-all"
            >
                All Topics
            </Link>
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-muted text-foreground hover:text-foreground hover:bg-border transition-all flex items-center gap-1.5"
                >
                    <span>{category.icon}</span>
                    {category.name}
                </Link>
            ))}
        </div>
    );
}
