import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
        return NextResponse.redirect(`${origin}/bookstore?error=no_reference`);
    }

    try {
        // Verify with Paystack
        const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = await res.json();

        if (data.status && data.data.status === 'success') {
            const supabase = await createClient();
            const bookId = data.data.metadata?.book_id;
            const email = data.data.customer?.email;

            if (bookId && email) {
                // Get user by email
                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .maybeSingle();

                if (user) {
                    // Record purchase
                    await supabase.from('purchases').insert({
                        user_id: user.id,
                        book_id: bookId,
                        amount: data.data.amount / 100, // from kobo
                        paystack_reference: reference,
                        status: 'success',
                    });

                    // Send notification
                    await supabase.from('notifications').insert({
                        user_id: user.id,
                        title: 'Purchase Successful',
                        body: 'Your book purchase has been confirmed.',
                        type: 'purchase',
                    });
                }
            }

            return NextResponse.redirect(`${origin}/dashboard/purchases?success=true`);
        }

        return NextResponse.redirect(`${origin}/bookstore?error=payment_failed`);
    } catch {
        return NextResponse.redirect(`${origin}/bookstore?error=verification_failed`);
    }
}
