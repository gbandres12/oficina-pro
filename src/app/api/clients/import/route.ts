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

        client = await db.getClient();
        await client.query('BEGIN');

        let imported = 0;
        let updated = 0;
        let errors: string[] = [];

        for (const row of result.data) {
            try {
                const { nome, email, telefone, cpf, cnpj, endereco } = row;

                // Normalizar campos (trim e limpar)
                const normalizedName = nome?.trim();
                const normalizedEmail = email?.trim().toLowerCase() || null;
                const normalizedPhone = telefone?.replace(/\D/g, '') || null; // Remove não numéricos
                const normalizedCpf = cpf?.replace(/\D/g, '') || null;
                const normalizedCnpj = cnpj?.replace(/\D/g, '') || null;
                const normalizedAddress = endereco?.trim() || null;

                // ⚡ VALIDAÇÃO FLEXÍVEL: apenas nome é obrigatório
                if (!normalizedName || normalizedName.length === 0) {
                    errors.push(`Linha ignorada: nome é obrigatório - ${JSON.stringify(row)}`);
                    continue;
                }

                // Documento pode ser CPF ou CNPJ
                const document = normalizedCpf || normalizedCnpj || null;

                // Verificar se cliente já existe (por telefone, documento ou email)
                let existingCheck;
                if (normalizedPhone || document || normalizedEmail) {
                    existingCheck = await client.query(`
                        SELECT id FROM "Client" 
                        WHERE 
                            (phone IS NOT NULL AND phone = $1) OR 
                            (document IS NOT NULL AND document = $2) OR
                            (email IS NOT NULL AND LOWER(email) = LOWER($3))
                        LIMIT 1
                    `, [normalizedPhone, document, normalizedEmail]);
                } else {
                    // Se não tem identificador único, verificar por nome
                    existingCheck = await client.query(`
                        SELECT id FROM "Client" 
                        WHERE LOWER(name) = LOWER($1)
                        LIMIT 1
                    `, [normalizedName]);
                }

                if (existingCheck && existingCheck.rows.length > 0) {
                    // ✅ Atualizar cliente existente (preserva valores existentes se novo for vazio)
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
                    // ✅ Inserir novo cliente (aceita campos vazios)
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
                errors.push(`Erro ao processar linha: ${JSON.stringify(row)} - ${error}`);
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            imported,
            updated,
            total: imported + updated,
            errors: errors.length > 0 ? errors : undefined,
            message: `✅ Importação concluída: ${imported} novos, ${updated} atualizados`
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
