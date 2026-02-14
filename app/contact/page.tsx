'use client';

import { useState } from 'react';
import { SITE_NAME } from '@/lib/constants';
import { LuSend, LuMail, LuMessageSquare } from 'react-icons/lu';
import toast from 'react-hot-toast';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // For now just a mock — you can integrate an email service later
        await new Promise((r) => setTimeout(r, 1000));
        toast.success('Message sent! We\'ll get back to you soon.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setLoading(false);
    };

    return (
        <div className="max-w-[var(--max-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mx-auto mb-4">
                        <LuMessageSquare size={24} className="text-accent" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">Get in Touch</h1>
                    <p className="text-muted-foreground">
                        Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full h-11 px-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                            <div className="relative">
                                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="What's this about?"
                            className="w-full h-11 px-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell us more..."
                            rows={6}
                            className="w-full p-4 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all disabled:opacity-60"
                    >
                        <LuSend size={16} />
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>

                <div className="mt-12 p-6 bg-muted/50 border border-border rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">
                        You can also reach us at{' '}
                        <a href="mailto:hello@thedividend.com" className="text-accent hover:underline font-medium">
                            hello@thedividend.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
