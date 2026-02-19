import Link from 'next/link';
import { SITE_NAME, NAV_LINKS } from '@/lib/constants';
import { LuMail, LuTwitter, LuLinkedin, LuInstagram } from 'react-icons/lu';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card border-t border-border">
            <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                                <span className="text-accent-foreground font-bold text-lg font-serif">D</span>
                            </div>
                            <span className="text-xl font-bold text-foreground font-serif tracking-tight">
                                {SITE_NAME}
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
                            Success is a dividend wisdom pays, and over here we share the wisdom needed to get this dividend.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-accent-light hover:text-accent text-muted-foreground flex items-center justify-center transition-all" aria-label="Twitter">
                                <LuTwitter size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-accent-light hover:text-accent text-muted-foreground flex items-center justify-center transition-all" aria-label="LinkedIn">
                                <LuLinkedin size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-accent-light hover:text-accent text-muted-foreground flex items-center justify-center transition-all" aria-label="Instagram">
                                <LuInstagram size={16} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-muted hover:bg-accent-light hover:text-accent text-muted-foreground flex items-center justify-center transition-all" aria-label="Email">
                                <LuMail size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground text-sm mb-4 uppercase tracking-wider">Explore</h3>
                        <ul className="space-y-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/login" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground text-sm mb-4 uppercase tracking-wider">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/blog?category=finance-and-investment" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Finance & Investment
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog?category=productivity" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Productivity
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog?category=realtionship-and-marriage" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Relationship & Marriage
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog?category=book-insights" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                                    Book Insights
                                </Link>
                            </li>

                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} {SITE_NAME}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
