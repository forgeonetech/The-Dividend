'use client';

import { useNotifications } from '@/lib/hooks/useNotifications';
import { formatRelativeDate } from '@/lib/utils';
import Link from 'next/link';
import { LuBell, LuCheck, LuBookOpen, LuMessageSquare, LuHeart, LuShoppingBag } from 'react-icons/lu';

const typeIcons: Record<string, React.ReactNode> = {
    article: <LuBookOpen size={16} />,
    comment: <LuHeart size={16} />,
    message: <LuMessageSquare size={16} />,
    purchase: <LuShoppingBag size={16} />,
    general: <LuBell size={16} />,
};

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-serif font-bold text-foreground">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
                    >
                        <LuCheck size={16} /> Mark all read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-xl border border-border">
                    <LuBell size={32} className="mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${notif.read ? 'bg-card border-border' : 'bg-accent-light/30 border-accent/20'
                                }`}
                            onClick={() => {
                                if (!notif.read) markAsRead(notif.id);
                            }}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${notif.read ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent'
                                }`}>
                                {typeIcons[notif.type] || typeIcons.general}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${notif.read ? 'text-foreground' : 'text-foreground font-medium'}`}>
                                    {notif.title}
                                </p>
                                {notif.body && <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>}
                                <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(notif.created_at)}</p>
                            </div>
                            {notif.link && (
                                <Link href={notif.link} className="text-xs text-accent shrink-0 hover:underline">
                                    View
                                </Link>
                            )}
                            {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
