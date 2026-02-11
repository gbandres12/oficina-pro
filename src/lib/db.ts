import { Pool, type PoolClient, type QueryResultRow } from 'pg';

type QueryParams = readonly unknown[];

let pool: Pool | null = null;

function getPool() {
    if (pool) return pool;

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL_MISSING');
    }

    pool = new Pool({
        connectionString,
        max: Number(process.env.DB_POOL_MAX ?? 10),
        idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS ?? 30000),
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS ?? 10000),
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
        allowExitOnIdle: true,
    });

    pool.on('error', (err) => {
        console.error('[DB] Unexpected idle client error', {
            message: err.message,
            code: err.code,
        });
    });

    return pool;
}

async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams) {
    const client = getPool();
    const result = await client.query<T>(text, params as unknown[] | undefined);
    return result;
}

export const db = {
    query,
    async fetchOne<T extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams) {
        const res = await query<T>(text, params);
        return res.rows[0] ?? null;
    },
    async fetchAll<T extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams) {
        const res = await query<T>(text, params);
        return res.rows;
    },
    async withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
        const client = await getPool().connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },
};
