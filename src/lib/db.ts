import { Pool } from 'pg';

let pool: Pool | null = null;

function resolveConnectionString() {
    const envCandidates: Array<[string, string | undefined]> = [
        ['DATABASE_URL', process.env.DATABASE_URL],
        ['POSTGRES_URL', process.env.POSTGRES_URL],
        ['POSTGRES_PRISMA_URL', process.env.POSTGRES_PRISMA_URL],
        ['SUPABASE_DB_URL', process.env.SUPABASE_DB_URL],
    ];

    const postgresCandidate = envCandidates.find(([, value]) => {
        return Boolean(value && /^postgres(ql)?:\/\//i.test(value));
    });

    if (!postgresCandidate) {
        const configured = envCandidates
            .filter(([, value]) => Boolean(value))
            .map(([name]) => name);

        if (configured.length > 0) {
            console.error(`FATAL: variáveis configuradas (${configured.join(', ')}) não contêm uma URL PostgreSQL válida.`);
            throw new Error('DATABASE_URL_INVALID');
        }

        console.error('FATAL: nenhuma URL de conexão PostgreSQL encontrada (DATABASE_URL/POSTGRES_URL/POSTGRES_PRISMA_URL/SUPABASE_DB_URL).');
        throw new Error('DATABASE_URL_MISSING');
    }

    const [sourceName, connectionString] = postgresCandidate;

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DB] Usando string de conexão de ${sourceName}.`);
    }

    if (connectionString.includes('.supabase.co:5432')) {
        console.warn('Aviso: conexão direta Supabase (:5432) pode falhar em ambientes sem IPv6. Prefira a URL do Pooler (:6543).');
    }

    return connectionString;
}

function getPool() {
    if (pool) return pool;

    const connectionString = resolveConnectionString();

    console.log('Initializing Postgres Pool with URL:', connectionString.substring(0, 15) + '...');

    pool = new Pool({
        connectionString,
        max: 5,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 30000,
        ssl: { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        pool = null;
    });

    return pool;
}

export const db = {
    async query(text: string, params?: unknown[]) {
        try {
            const start = Date.now();
            const client = getPool();
            const res = await client.query(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV !== 'production') {
                console.log('Query executed', { duration, rows: res.rowCount });
            }
            return res;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Database query error:', {
                    message: error.message,
                    text: text.substring(0, 50) + '...',
                });
            } else {
                console.error('Database query error desconhecido');
            }
            throw error;
        }
    },
    async fetchOne(text: string, params?: unknown[]) {
        const res = await this.query(text, params);
        return res.rows[0];
    },
    async fetchAll(text: string, params?: unknown[]) {
        const res = await this.query(text, params);
        return res.rows;
    },
};
