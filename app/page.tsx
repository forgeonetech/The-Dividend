import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryPills from '@/components/home/CategoryPills';
import TopArticles from '@/components/home/TopArticles';
import EditorsPicks from '@/components/home/EditorsPicks';
import Link from 'next/link';
import { LuMessageSquare } from 'react-icons/lu';

export default function HomePage() {
  return (
    <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16">
      {/* Hero Carousel */}
      <section>
        <HeroCarousel />
      </section>

      {/* Category Pills */}
      <section>
        <CategoryPills />
      </section>

      {/* Top Articles */}
      <TopArticles />

      {/* Editor's Picks */}
      <EditorsPicks />

      {/* Newsletter / CTA */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12 lg:p-16 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
            Stay Ahead of the Curve
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-8 leading-relaxed">
            Get weekly insights on investing, wealth building, and financial clarity delivered straight to you. Join the community of thoughtful investors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all text-sm"
            >
              Create Free Account
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all text-sm border border-white/10"
            >
              Explore Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <Link
        href="/contact"
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-accent-hover text-accent-foreground rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-30"
        aria-label="Contact"
      >
        <LuMessageSquare size={22} />
      </Link>
    </div>
  );
}
