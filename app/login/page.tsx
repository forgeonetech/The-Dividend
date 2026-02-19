'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_NAME } from '@/lib/constants';
import toast from 'react-hot-toast';
import { LuMail, LuLock, LuEye, LuEyeOff } from 'react-icons/lu';
import { FcGoogle } from 'react-icons/fc';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast.success('Welcome back!');
            router.push(redirect);
            router.refresh();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Login failed';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
                },
            });
            if (error) throw error;
        } catch {
            toast.error('Google login failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-var(--header-height))] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                            <span className="text-accent-foreground font-bold text-xl font-serif">D</span>
                        </div>
                        <span className="text-2xl font-bold text-foreground font-serif">{SITE_NAME}</span>
                    </Link>
                    <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to continue your journey</p>
                </div>

                {/* Google OAuth */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 h-12 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all mb-6"
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                        <div className="relative">
                            <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full h-12 pl-10 pr-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                        <div className="relative">
                            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-12 pl-10 pr-12 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl font-medium transition-all disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-accent font-medium hover:underline">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
