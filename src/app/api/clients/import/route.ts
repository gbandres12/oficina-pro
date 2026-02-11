import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import Papa from 'papaparse';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
    let client;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Nenhum arquivo fornecido' },
                { status: 400 }
            );
        }

        // Ler o conteúdo do arquivo CSV
        const text = await file.text();

        // Parse do CSV
        const result = await new Promise<any>((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: resolve,
                error: reject
            });
        });

        if (!result.data || result.data.length === 0) {
            return NextResponse.json(
                { error: 'Arquivo CSV vazio ou inválido' },
                { status: 400 }
            );
        }

        client = await pool.connect();
        await client.query('BEGIN');

        let imported = 0;
        let updated = 0;
        let errors: string[] = [];

        for (const row of result.data) {
            try {
                const { nome, email, telefone, cpf, cnpj } = row;

                // Validação básica
                if (!nome || !telefone) {
                    errors.push(`Linha ignorada: falta nome ou telefone - ${JSON.stringify(row)}`);
                    continue;
                }

                // Verificar se cliente já existe (por telefone ou documento)
                const existingCheck = await client.query(`
                    SELECT id FROM "Client" 
                    WHERE phone = $1 OR (document IS NOT NULL AND document = $2)
                    LIMIT 1
                `, [telefone, cpf || cnpj || null]);

                if (existingCheck.rows.length > 0) {
                    // Atualizar cliente existente
                    await client.query(`
                        UPDATE "Client" 
                        SET 
                            name = $1,
                            email = $2,
                            phone = $3,
                            document = $4
                        WHERE id = $5
                    `, [
                        nome,
                        email || null,
                        telefone,
                        cpf || cnpj || null,
                        existingCheck.rows[0].id
                    ]);
                    updated++;
                } else {
                    // Inserir novo cliente
                    await client.query(`
                        INSERT INTO "Client" (name, email, phone, document)
                        VALUES ($1, $2, $3, $4)
                    `, [
                        nome,
                        email || null,
                        telefone,
                        cpf || cnpj || null
                    ]);
                    imported++;
                }
            } catch (error) {
                errors.push(`Erro ao processar linha: ${JSON.stringify(row)} - ${error}`);
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: imported + updated,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Erro ao importar clientes:', error);

        return NextResponse.json(
            {
                error: 'Erro ao importar clientes',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}
