import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool() {
    if (pool) return pool;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("FATAL: DATABASE_URL is missing in getPool()");
        throw new Error("DATABASE_URL_MISSING");
    }

    console.log("Initializing Postgres Pool with URL:", connectionString.substring(0, 15) + "...");

    pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : false
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        pool = null; // Reset pool on fatal error
    });

    return pool;
}

export const db = {
    async query(text: string, params?: any[]) {
        try {
            const start = Date.now();
            const client = getPool();
            const res = await client.query(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV !== 'production') {
                console.log('Query executed', { duration, rows: res.rowCount });
            }
            return res;
        } catch (error: any) {
            console.error('Database query error:', {
                message: error.message,
                code: error.code,
                text: text.substring(0, 50) + '...'
            });
            throw error;
        }
    },
    async fetchOne(text: string, params?: any[]) {
        const res = await this.query(text, params);
        return res.rows[0];
    },
    async fetchAll(text: string, params?: any[]) {
        const res = await this.query(text, params);
        return res.rows;
    }
};
