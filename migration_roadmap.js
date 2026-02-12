require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Iniciando migração...');

        // 1. Criar tabela ServiceOrderTimeline
        await client.query(`
            CREATE TABLE IF NOT EXISTS "ServiceOrderTimeline" (
                "id" TEXT NOT NULL,
                "serviceOrderId" TEXT NOT NULL,
                "status" TEXT NOT NULL,
                "description" TEXT,
                "userId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "ServiceOrderTimeline_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('Tabela ServiceOrderTimeline criada/verificada.');

        // 2. Adicionar FK. Tratamento de erro simples para caso ja exista.
        try {
            await client.query(`
                ALTER TABLE "ServiceOrderTimeline" 
                ADD CONSTRAINT "ServiceOrderTimeline_serviceOrderId_fkey" 
                FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            `);
            console.log('FK ServiceOrderTimeline_serviceOrderId_fkey criada.');
        } catch (e) {
            // Ignora erro se for duplicidade
            if (e.code === '42710' || e.message.includes('already exists')) {
                console.log('FK ServiceOrderTimeline_serviceOrderId_fkey já existe.');
            } else {
                console.log('Erro ao criar FK (pode já existir):', e.message);
            }
        }

        // 3. Adicionar coluna internalNotes em ServiceOrder
        try {
            await client.query(`
                ALTER TABLE "ServiceOrder" ADD COLUMN "internalNotes" TEXT;
            `);
            console.log('Coluna internalNotes adicionada.');
        } catch (e) {
            // Ignora erro se coluna ja existir
            if (e.code === '42701' || e.message.includes('already exists')) {
                console.log('Coluna internalNotes já existe.');
            } else {
                console.log('Erro ao adicionar coluna internalNotes:', e.message);
            }
        }

        console.log('Migração concluída com sucesso!');
    } catch (err) {
        console.error('Erro na migração:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
