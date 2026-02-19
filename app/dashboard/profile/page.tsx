'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { LuCamera } from 'react-icons/lu';

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const [name, setName] = useState(profile?.name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [saving, setSaving] = useState(false);

    if (!profile) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('users')
                .update({ name, bio })
                .eq('id', profile.id);
            if (error) throw error;
            await refreshProfile();
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const supabase = createClient();
            const ext = file.name.split('.').pop();
            const path = `${profile.id}/avatar.${ext}`;
            const { error: uploadError } = await supabase.storage.from('user_avatars').upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: urlData } = supabase.storage.from('user_avatars').getPublicUrl(path);
            await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id);
            await refreshProfile();
            toast.success('Avatar updated');
        } catch {
            toast.error('Failed to upload avatar');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Profile</h1>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-accent-light text-accent flex items-center justify-center text-2xl font-semibold">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                profile.name?.[0] || 'U'
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <LuCamera size={20} className="text-white" />
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Member since {formatDate(profile.created_at)}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            placeholder="Tell us about yourself..."
                            className="w-full p-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
