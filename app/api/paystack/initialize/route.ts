import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { bookId, email, amount } = await request.json();

        const res = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount, // in kobo
                callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/verify`,
                metadata: {
                    book_id: bookId,
                },
            }),
        });

        const data = await res.json();

        if (data.status) {
            return NextResponse.json({
                authorization_url: data.data.authorization_url,
                reference: data.data.reference,
            });
        }

        return NextResponse.json({ error: data.message }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
    }
}
