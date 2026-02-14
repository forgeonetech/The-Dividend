'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import type { Message, User } from '@/lib/types';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { LuSend, LuMessageSquare } from 'react-icons/lu';

function MessagesContent() {
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('user');
    const { profile } = useAuth();
    const [conversations, setConversations] = useState<{ user: User; lastMessage: Message }[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Fetch conversations
    useEffect(() => {
        if (!profile) return;
        const fetchConversations = async () => {
            try {
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('*, sender:users!sender_id(*), receiver:users!receiver_id(*)')
                    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
                    .order('created_at', { ascending: false });

                if (!msgs) { setConversations([]); return; }

                // Group by other user
                const seen = new Set<string>();
                const convos: { user: User; lastMessage: Message }[] = [];
                for (const msg of msgs) {
                    const otherUser = msg.sender_id === profile.id ? msg.receiver : msg.sender;
                    if (otherUser && !seen.has(otherUser.id)) {
                        seen.add(otherUser.id);
                        convos.push({ user: otherUser, lastMessage: msg });
                    }
                }
                setConversations(convos);

                // Auto-select from URL param
                if (targetUserId) {
                    const target = convos.find((c) => c.user.id === targetUserId)?.user;
                    if (target) setSelectedUser(target);
                    else {
                        // Fetch user directly
                        const { data: userData } = await supabase.from('users').select('*').eq('id', targetUserId).maybeSingle();
                        if (userData) setSelectedUser(userData);
                    }
                }
            } catch {
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [profile, targetUserId, supabase]);

    // Fetch messages for selected user
    useEffect(() => {
        if (!profile || !selectedUser) return;
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*, sender:users!sender_id(*), receiver:users!receiver_id(*)')
                .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${profile.id})`)
                .order('created_at', { ascending: true });
            setMessages(data || []);

            // Mark as read
            await supabase
                .from('messages')
                .update({ read: true })
                .eq('sender_id', selectedUser.id)
                .eq('receiver_id', profile.id)
                .eq('read', false);
        };
        fetchMessages();
    }, [profile, selectedUser, supabase]);

    // Real-time messages
    useEffect(() => {
        if (!profile || !selectedUser) return;
        const channel = supabase
            .channel(`messages-${selectedUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const msg = payload.new as Message;
                if (
                    (msg.sender_id === profile.id && msg.receiver_id === selectedUser.id) ||
                    (msg.sender_id === selectedUser.id && msg.receiver_id === profile.id)
                ) {
                    setMessages((prev) => [...prev, msg]);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [profile, selectedUser, supabase]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !profile || !selectedUser) return;
        setSending(true);
        try {
            await supabase.from('messages').insert({
                sender_id: profile.id,
                receiver_id: selectedUser.id,
                content: input.trim(),
            });
            setInput('');
        } catch { /* fail silently */ }
        finally { setSending(false); }
    };

    if (!profile) return null;

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-6">Messages</h1>

            <div className="flex border border-border rounded-xl overflow-hidden bg-card" style={{ height: '600px' }}>
                {/* Conversation List */}
                <div className="w-72 border-r border-border overflow-y-auto hidden sm:block">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No conversations yet
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                key={convo.user.id}
                                onClick={() => setSelectedUser(convo.user)}
                                className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-all text-left ${selectedUser?.id === convo.user.id ? 'bg-accent-light' : ''
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                                    {convo.user.avatar_url ? (
                                        <img src={convo.user.avatar_url} alt={convo.user.name} className="w-full h-full object-cover" />
                                    ) : getInitials(convo.user.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{convo.user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage.content}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden">
                                    {selectedUser.avatar_url ? (
                                        <img src={selectedUser.avatar_url} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : getInitials(selectedUser.name)}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{selectedUser.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedUser.role === 'admin' ? 'Author' : 'Reader'}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === profile.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${msg.sender_id === profile.id
                                                ? 'bg-accent text-white rounded-br-md'
                                                : 'bg-muted text-foreground rounded-bl-md'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender_id === profile.id ? 'text-white/60' : 'text-muted-foreground'}`}>
                                                {formatRelativeDate(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-border flex items-center gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 h-10 px-4 bg-muted border border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !input.trim()}
                                    className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center transition-all disabled:opacity-50"
                                >
                                    <LuSend size={16} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <LuMessageSquare size={32} className="mb-3" />
                            <p className="text-sm">Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    );
}
