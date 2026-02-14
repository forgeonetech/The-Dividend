import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
            .update(body)
            .digest('hex');

        const signature = request.headers.get('x-paystack-signature');

        if (hash !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        if (event.event === 'charge.success') {
            const { reference, metadata, customer, amount } = event.data;
            const bookId = metadata?.book_id;

            if (bookId && customer?.email) {
                const supabase = createServiceClient();

                const { data: user } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', customer.email)
                    .maybeSingle();

                if (user) {
                    // Check if purchase already exists
                    const { data: existing } = await supabase
                        .from('purchases')
                        .select('id')
                        .eq('paystack_reference', reference)
                        .maybeSingle();

                    if (!existing) {
                        await supabase.from('purchases').insert({
                            user_id: user.id,
                            book_id: bookId,
                            amount: amount / 100,
                            paystack_reference: reference,
                            status: 'success',
                        });

                        await supabase.from('notifications').insert({
                            user_id: user.id,
                            title: 'Purchase Successful',
                            body: 'Your book purchase has been confirmed.',
                            type: 'purchase',
                        });
                    }
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch {
        return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
    }
}
