'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { NotificationProvider } from '@/lib/hooks/useNotifications';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--card)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            fontFamily: 'var(--font-sans)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'var(--success)',
                                secondary: 'white',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'var(--error)',
                                secondary: 'white',
                            },
                        },
                    }}
                />
            </NotificationProvider>
        </AuthProvider>
    );
}
