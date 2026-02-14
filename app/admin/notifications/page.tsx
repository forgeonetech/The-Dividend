'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { LuSend, LuBell } from 'react-icons/lu';

export default function AdminNotificationsPage() {
    const { profile } = useAuth();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('general');
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { toast.error('Title is required'); return; }
        setSending(true);
        try {
            const supabase = createClient();
            // Get all users
            const { data: users } = await supabase.from('users').select('id');
            if (!users || users.length === 0) {
                toast.error('No users to notify');
                return;
            }
            // Insert notification for all users
            const notifications = users.map((u) => ({
                user_id: u.id,
                title: title.trim(),
                body: body.trim() || null,
                type,
            }));
            const { error } = await supabase.from('notifications').insert(notifications);
            if (error) throw error;
            toast.success(`Notification sent to ${users.length} users`);
            setTitle('');
            setBody('');
        } catch {
            toast.error('Failed to send notifications');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Push Notifications</h1>

            <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <LuBell size={18} className="text-accent" /> Send to All Users
                </h2>

                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Notification title"
                            className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Optional message body"
                            rows={3}
                            className="w-full p-3 bg-muted border border-border rounded-lg text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="general">General</option>
                            <option value="article">New Article</option>
                            <option value="message">Message</option>
                            <option value="purchase">Purchase</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                    >
                        <LuSend size={14} />
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                </form>
            </div>
        </div>
    );
}
