import { Pool } from 'pg';

let pool: Pool | null = null;

function resolveConnectionString() {
    const candidates = [
        process.env.DATABASE_URL,
        process.env.POSTGRES_URL,
        process.env.POSTGRES_PRISMA_URL,
        process.env.SUPABASE_DB_URL,
    ].filter(Boolean) as string[];

    const connectionString = candidates[0];

    if (!connectionString) {
        console.error('FATAL: nenhuma URL de conexão PostgreSQL encontrada (DATABASE_URL/POSTGRES_URL/POSTGRES_PRISMA_URL/SUPABASE_DB_URL).');
        throw new Error('DATABASE_URL_MISSING');
    }

    if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
        console.error('FATAL: URL de banco inválida. Parece que uma URL HTTP(S) foi configurada no lugar da string PostgreSQL.');
        throw new Error('DATABASE_URL_INVALID');
    }

    if (connectionString.includes('.supabase.co:5432')) {
        console.warn('Aviso: conexão direta Supabase (:5432) pode falhar em ambientes sem IPv6. Prefira a URL do Pooler (:6543).');
    }

    return connectionString;
}

function getPool() {
    if (pool) return pool;

    const connectionString = resolveConnectionString();

    console.log("Initializing Postgres Pool with URL:", connectionString.substring(0, 15) + "...");

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
