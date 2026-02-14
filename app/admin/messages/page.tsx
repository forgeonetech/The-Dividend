'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Message, User } from '@/lib/types';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { LuMessageSquare } from 'react-icons/lu';

export default function AdminMessagesPage() {
    const [conversations, setConversations] = useState<{ users: [User, User]; lastMessage: Message; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const supabase = createClient();
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('*, sender:users!sender_id(*), receiver:users!receiver_id(*)')
                    .order('created_at', { ascending: false })
                    .limit(100);

                if (!msgs) { setConversations([]); return; }

                // Group by conversation pair
                const convMap = new Map<string, { users: [User, User]; lastMessage: Message; count: number }>();
                for (const msg of msgs) {
                    const key = [msg.sender_id, msg.receiver_id].sort().join('-');
                    if (!convMap.has(key)) {
                        convMap.set(key, {
                            users: [msg.sender, msg.receiver],
                            lastMessage: msg,
                            count: 1,
                        });
                    } else {
                        convMap.get(key)!.count++;
                    }
                }
                setConversations(Array.from(convMap.values()));
            } catch { setConversations([]); }
            finally { setLoading(false); }
        };
        fetchMessages();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Messages Overview</h1>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
            ) : conversations.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuMessageSquare size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No messages</h3>
                    <p className="text-sm text-muted-foreground">No conversations have started yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {conversations.map((conv, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                            <div className="flex -space-x-3">
                                {conv.users.filter(Boolean).map((user) => (
                                    <div key={user?.id} className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-semibold overflow-hidden">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                        ) : getInitials(user?.name || '?')}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {conv.users.filter(Boolean).map(u => u?.name).join(' ↔ ')}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground">{formatRelativeDate(conv.lastMessage.created_at)}</p>
                                <span className="text-xs font-medium text-accent">{conv.count} messages</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
