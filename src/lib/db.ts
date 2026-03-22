import { Pool } from 'pg';

let pool: Pool | null = null;

type DbError = {
    message?: string;
    code?: string;
};

function sanitizeConnectionString(connectionString: string) {
    try {
        const url = new URL(connectionString);
        return `${url.protocol}//${url.hostname}:${url.port || '5432'}/${url.pathname.replace('/', '')}`;
    } catch {
        return 'invalid-connection-string';
    }
}

function getPool() {
    if (pool) return pool;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("FATAL: DATABASE_URL is missing in getPool()");
        throw new Error("DATABASE_URL_MISSING");
    }

    console.log('Initializing Postgres Pool:', sanitizeConnectionString(connectionString));

    pool = new Pool({
        connectionString,
        max: 5, // Reduzi para evitar esgotar conexões diretas
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 30000, // Aumentei para 30 segundos
        ssl: { rejectUnauthorized: false }
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        pool = null; // Reset pool on fatal error
    });

    return pool;
}

export const db = {
    async query<T = unknown>(text: string, params?: readonly unknown[]) {
        try {
            const start = Date.now();
            const client = getPool();
            const res = await client.query<T>(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV !== 'production') {
                console.log('Query executed', { duration, rows: res.rowCount });
            }
            return res;
        } catch (error: unknown) {
            const dbError = error as DbError;
            console.error('Database query error:', {
                message: dbError.message,
                code: dbError.code,
                text: text.substring(0, 50) + '...'
            });
            throw error;
        }
    },
    async fetchOne<T = unknown>(text: string, params?: readonly unknown[]) {
        const res = await this.query(text, params);
        return res.rows[0] as T | undefined;
    },
    async fetchAll<T = unknown>(text: string, params?: readonly unknown[]) {
        const res = await this.query(text, params);
        return res.rows as T[];
    },
    async getClient() {
        const pool = getPool();
        return pool.connect();
    }
};
