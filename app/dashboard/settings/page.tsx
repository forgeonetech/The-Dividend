'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { LuShield, LuTrash2 } from 'react-icons/lu';

export default function SettingsPage() {
    const { profile, signOut } = useAuth();

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        try {
            toast.error('Account deletion requires admin assistance. Please contact support.');
        } catch {
            toast.error('Failed to process request');
        }
    };

    const handlePasswordChange = async () => {
        if (!profile) return;
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            if (error) throw error;
            toast.success('Password reset email sent. Check your inbox.');
        } catch {
            toast.error('Failed to send reset email');
        }
    };

    if (!profile) return null;

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Settings</h1>

            {/* Account Info */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LuShield size={18} className="text-accent" /> Account
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p className="text-sm text-foreground font-medium">{profile.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Provider</label>
                        <p className="text-sm text-foreground font-medium capitalize">{profile.provider || 'Email'}</p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Role</label>
                        <p className="text-sm text-foreground font-medium capitalize">{profile.role}</p>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="font-semibold text-foreground mb-4">Security</h2>
                <button
                    onClick={handlePasswordChange}
                    className="px-4 py-2 bg-muted hover:bg-border text-foreground rounded-lg text-sm font-medium transition-all"
                >
                    Reset Password
                </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-error/20 rounded-xl p-6">
                <h2 className="font-semibold text-error mb-4 flex items-center gap-2">
                    <LuTrash2 size={18} /> Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there&apos;s no going back. Please be certain.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg text-sm font-medium transition-all"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}
