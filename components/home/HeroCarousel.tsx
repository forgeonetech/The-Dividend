'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Category } from '@/lib/types';
import { LuChevronLeft, LuChevronRight, LuArrowRight } from 'react-icons/lu';

export default function HeroCarousel() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');
                setCategories(data || []);
            } catch {
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const next = useCallback(() => {
        if (categories.length === 0) return;
        setCurrent((prev) => (prev + 1) % categories.length);
    }, [categories.length]);

    const prev = useCallback(() => {
        if (categories.length === 0) return;
        setCurrent((prev) => (prev - 1 + categories.length) % categories.length);
    }, [categories.length]);

    // Auto-rotate
    useEffect(() => {
        if (categories.length <= 1) return;
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [categories.length, next]);

    if (loading) {
        return (
            <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] bg-muted rounded-2xl overflow-hidden skeleton shadow-lg" />
        );
    }

    if (categories.length === 0) {
        return null; // Or some empty state
    }

    const currentCategory = categories[current];

    return (
        <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden group shadow-xl">
            {categories.map((category, idx) => (
                <div
                    key={category.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    style={{
                        background: `linear-gradient(135deg, ${category.color} 0%, #1a1a1a 100%)`
                    }}
                >
                    <div className="absolute inset-0 bg-black/20" /> {/* Texture overlay */}

                    <div className="relative h-full w-full flex flex-col md:flex-row items-center">
                        {/* Left: Text Content */}
                        <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-8 sm:p-12 lg:p-16 z-20">
                            <span
                                className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/90 border border-white/30 rounded-full mb-6 w-fit animate-fade-in-up"
                                style={{ animationDelay: '100ms' }}
                            >
                                Featured Category
                            </span>
                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight mb-4 animate-fade-in-up"
                                style={{ animationDelay: '200ms' }}
                            >
                                {category.name}
                            </h2>
                            <p
                                className="text-white/80 text-base sm:text-lg mb-8 max-w-md animate-fade-in-up leading-relaxed"
                                style={{ animationDelay: '300ms' }}
                            >
                                {category.description}
                            </p>

                            <div
                                className="animate-fade-in-up"
                                style={{ animationDelay: '400ms' }}
                            >
                                <Link
                                    href={`/blog?category=${category.slug}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Explore {category.name}
                                    <LuArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="w-full md:w-1/2 h-full relative hidden md:block">
                            {/* Gradient mask for smooth transition */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10 md:bg-gradient-to-r md:from-[rgba(0,0,0,0.5)] md:to-transparent"
                                style={{ background: `linear-gradient(to right, ${category.color} 0%, transparent 50%)` }}
                            />

                            {category.image_url ? (
                                <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="w-full h-full object-cover object-center animate-scale-in"
                                    style={{ animationDuration: '10s' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/10">
                                    <span className="text-9xl">{category.icon}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            {categories.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center border border-white/10 z-30 shadow-lg hover:scale-105"
                        aria-label="Previous slide"
                    >
                        <LuChevronLeft size={24} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center border border-white/10 z-30 shadow-lg hover:scale-105"
                        aria-label="Next slide"
                    >
                        <LuChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots */}
            {categories.length > 1 && (
                <div className="absolute bottom-6 left-8 sm:left-12 lg:left-16 flex items-center gap-3 z-30">
                    {categories.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-2 rounded-full transition-all duration-500 ${idx === current
                                    ? 'bg-white w-8'
                                    : 'bg-white/30 w-2 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
