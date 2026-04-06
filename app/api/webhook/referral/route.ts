import { NextResponse } from 'next/server';
import { createReferral } from '@/services/database/referrals';

// Force dynamic since it's a webhook receiver
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // Dify sends payload via JSON
        const payload = await req.json();

        // Optional: Implement a basic security check (e.g. check for a secret token in headers)
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.DIFY_WEBHOOK_SECRET}`) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const {
            phone,
            targetOrgId,
            consentGiven,
            sessionId,
            riskData
        } = payload;

        // Basic validation matching the ReferralPayload schema
        if (!phone || !targetOrgId || consentGiven !== true) {
            return NextResponse.json(
                { error: 'Missing required fields: phone, targetOrgId, consentGiven=true' },
                { status: 400 }
            );
        }

        // Add to database
        const result = await createReferral({
            phone,
            targetOrgId,
            consentGiven,
            sessionId,
            riskData
        });

        // The Queue UI in Staff Workspace reads from Supabase realtime,
        // so it will auto-update without needing further manual triggers.

        return NextResponse.json({
            success: true,
            message: 'Referral created successfully.',
            data: result.data
        }, { status: 201 });

    } catch (error: any) {
        console.error('Webhook error processing Dify referral:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
