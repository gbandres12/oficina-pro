import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Papa from 'papaparse';

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

        const text = await file.text();

        // Parse do CSV com normalização de headers e detecção de delimitador
        const result = await new Promise<any>((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => header.trim().toLowerCase(),
                complete: resolve,
                error: (error: any) => reject(error)
            });
        });

        if (!result.data || result.data.length === 0) {
            return NextResponse.json(
                { error: 'Arquivo CSV vazio ou inválido. Verifique os cabeçalhos.' },
                { status: 400 }
            );
        }

        client = await db.getClient();
        await client.query('BEGIN');

        let imported = 0;
        let updated = 0;
        let skipped = 0;
        let errors: string[] = [];

        for (const row of result.data) {
            try {
                // Mapear campos (suporta 'nome' ou 'name', 'email', 'telefone' ou 'phone', etc)
                const nome = row.nome || row.name || row.cliente;
                const email = row.email || row.e_mail;
                const telefone = row.telefone || row.phone || row.celular;
                const cpf = row.cpf;
                const cnpj = row.cnpj;
                const endereco = row.endereco || row.address || row.logradouro;

                // Normalizar campos
                const normalizedName = nome?.trim();
                const normalizedEmail = email?.trim().toLowerCase() || null;
                const normalizedPhone = telefone?.replace(/\D/g, '') || null;
                const normalizedCpf = cpf?.replace(/\D/g, '') || null;
                const normalizedCnpj = cnpj?.replace(/\D/g, '') || null;
                const normalizedAddress = endereco?.trim() || null;

                // Validação: nome e telefone são obrigatórios para evitar erros de banco
                if (!normalizedName) {
                    errors.push(`Ignorado: Nome faltando na linha ${JSON.stringify(row)}`);
                    skipped++;
                    continue;
                }

                if (!normalizedPhone) {
                    errors.push(`Ignorado: Telefone faltando para o cliente "${normalizedName}"`);
                    skipped++;
                    continue;
                }

                const document = normalizedCpf || normalizedCnpj || null;

                // Verificar se cliente já existe
                let existingCheck;
                if (document) {
                    existingCheck = await client.query(
                        'SELECT id FROM "Client" WHERE document = $1 LIMIT 1',
                        [document]
                    );
                } else {
                    existingCheck = await client.query(
                        'SELECT id FROM "Client" WHERE phone = $1 LIMIT 1',
                        [normalizedPhone]
                    );
                }

                if (existingCheck && existingCheck.rows.length > 0) {
                    await client.query(`
                        UPDATE "Client" 
                        SET 
                            name = COALESCE($1, name),
                            email = COALESCE($2, email),
                            phone = COALESCE($3, phone),
                            document = COALESCE($4, document),
                            address = COALESCE($5, address),
                            "updatedAt" = CURRENT_TIMESTAMP
                        WHERE id = $6
                    `, [
                        normalizedName,
                        normalizedEmail,
                        normalizedPhone,
                        document,
                        normalizedAddress,
                        existingCheck.rows[0].id
                    ]);
                    updated++;
                } else {
                    await client.query(`
                        INSERT INTO "Client" (name, email, phone, document, address)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [
                        normalizedName,
                        normalizedEmail,
                        normalizedPhone,
                        document,
                        normalizedAddress
                    ]);
                    imported++;
                }
            } catch (error) {
                console.error('Erro na linha:', row, error);
                errors.push(`Erro ao processar "${row.nome || 'desconhecido'}": ${error instanceof Error ? error.message : 'Erro no banco'}`);
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            imported,
            updated,
            skipped,
            total: imported + updated,
            errors: errors.length > 0 ? errors : undefined,
            message: `✅ Importação concluída: ${imported} novos, ${updated} atualizados.${skipped > 0 ? ` ${skipped} ignorados.` : ''}`
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error('Erro crítico na importação:', error);
        return NextResponse.json(
            { error: 'Falha no processamento do CSV', details: error instanceof Error ? error.message : 'Erro interno' },
            { status: 500 }
        );
    } finally {
        if (client) client.release();
    }
}
