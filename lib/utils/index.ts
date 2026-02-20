// ============================================
// THE DIVIDEND — Utility Functions
// ============================================

import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date string to a human readable format
 */
export function formatDate(date: string | Date): string {
    return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export function formatRelativeDate(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Calculate estimated read time from text content
 */
export function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format a number with commas (e.g., 1,234)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

/**
 * Format price
 */
export function formatPrice(price: number, currency: string = '₵'): string {
    return `${currency}${price.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * cn utility - simple class name concatenator
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Extract text from TipTap JSON content
 */
export function extractTextFromContent(content: Record<string, unknown>): string {
    if (!content || !content.content) return '';
    const extractText = (nodes: unknown[]): string => {
        return nodes
            .map((node: unknown) => {
                const n = node as Record<string, unknown>;
                if (n.type === 'text') return n.text as string;
                if (n.content) return extractText(n.content as unknown[]);
                return '';
            })
            .join(' ');
    };
    return extractText(content.content as unknown[]);
}

/**
 * Optimize image before upload (client-side)
 * Resizes to max width of 1920px and compresses to 0.8 quality JPEG
 */
export async function optimizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920;
                const scaleSize = MAX_WIDTH / img.width;

                // Only resize if wider than MAX_WIDTH, otherwise keep original dimensions
                if (scaleSize < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                }, 'image/jpeg', 0.8); // 80% quality JPEG
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
