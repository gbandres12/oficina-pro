import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
        rejectUnauthorized: false
    }
});

export const db = {
    async query(text: string, params?: any[]) {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV !== 'production') {
            console.log('executed query', { text, duration, rows: res.rowCount });
        }
        return res;
    },
    async fetchOne(text: string, params?: any[]) {
        const res = await this.query(text, params);
        return res.rows[0];
    },
    async fetchAll(text: string, params?: any[]) {
        const res = await this.query(text, params);
        return res.rows;
    },
    pool
};
