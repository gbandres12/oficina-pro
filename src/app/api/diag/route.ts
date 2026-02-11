import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    const envVars = {
        has_database_url: !!process.env.DATABASE_URL,
        database_url_length: process.env.DATABASE_URL?.length || 0,
        database_url_prefix: process.env.DATABASE_URL?.substring(0, 15) + '...',
        node_env: process.env.NODE_ENV,
    };

    try {
        const result = await db.query('SELECT NOW()');
        return NextResponse.json({
            status: 'success',
            env: envVars,
            db_time: result.rows[0].now
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            env: envVars,
            error: error.message,
            stack: error.stack,
            code: error.code
        }, { status: 500 });
    }
}
