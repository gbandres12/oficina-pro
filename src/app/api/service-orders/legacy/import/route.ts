import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Papa from 'papaparse';

const VALID_STATUSES = ['OPEN', 'QUOTATION', 'APPROVED', 'IN_PROGRESS', 'WAITING_PARTS', 'FINISHED', 'CANCELLED'];

function mapLegacyStatus(rawStatus: string): string {
    if (!rawStatus) return 'FINISHED';
    const s = rawStatus.toUpperCase().trim();
    if (VALID_STATUSES.includes(s)) return s;
    if (s.includes('ABERTA') || s.includes('PENDENTE')) return 'OPEN';
    if (s.includes('CANCELADA')) return 'CANCELLED';
    if (s.includes('ORÇAMENTO') || s.includes('ORCAMENTO')) return 'QUOTATION';
    return 'FINISHED'; // default fallback
}

export async function POST(request: NextRequest) {
    let client;
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });

        const text = await file.text();
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
            return NextResponse.json({ error: 'Arquivo CSV vazio ou inválido' }, { status: 400 });
        }

        client = await db.getClient();
        await client.query('BEGIN');

        let imported = 0;
        let skipped = 0;
        let updated = 0;
        let errors: string[] = [];

        for (const row of result.data) {
            try {
                // Mapear campos
                const numero_os = row.numero_os || row.os || row.numero;
                const data_abertura = row.data_abertura || row.data || row.entrydate;
                const cliente_nome = row.cliente_nome || row.cliente || row.nome;
                const placa = row.placa || row.vehicleplate;
                const valor_total = row.valor_total || row.total || row.totalvalue;
                const valor_pago = row.valor_pago || row.pago || row.paidvalue;
                const status = mapLegacyStatus(row.status);
                const observacao = row.observacao || row.observacoes || row.observation;

                if (!numero_os) {
                    errors.push(`Ignorado: Número da OS faltando na linha ${JSON.stringify(row)}`);
                    skipped++;
                    continue;
                }

                let parseDate = new Date();
                if (data_abertura) {
                    const parts = data_abertura.split('/');
                    if (parts.length === 3) {
                        parseDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
                    } else {
                        const parsed = new Date(data_abertura);
                        if (!isNaN(parsed.getTime())) parseDate = parsed;
                    }
                }

                const parseTotal = parseFloat(String(valor_total || '0').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;
                const parsePago = parseFloat(String(valor_pago || '0').replace(',', '.').replace(/[^\d.-]/g, '')) || 0;

                // Verificar se OS já existe
                const existingCheck = await client.query(
                    'SELECT id FROM "ServiceOrder" WHERE "legacyNumber" = $1 AND origin = $2 LIMIT 1',
                    [numero_os, 'LEGACY']
                );

                if (existingCheck && existingCheck.rows.length > 0) {
                    await client.query(`
                        UPDATE "ServiceOrder" 
                        SET 
                            "legacyClientName" = COALESCE($1, "legacyClientName"),
                            "legacyVehiclePlate" = COALESCE($2, "legacyVehiclePlate"),
                            "legacyTotalValue" = COALESCE($3, "legacyTotalValue"),
                            "legacyPaidValue" = COALESCE($4, "legacyPaidValue"),
                            status = COALESCE($5, status),
                            observations = COALESCE($6, observations),
                            "entryDate" = COALESCE($7, "entryDate"),
                            "updatedAt" = CURRENT_TIMESTAMP
                        WHERE id = $8
                    `, [
                        cliente_nome,
                        placa,
                        parseTotal,
                        parsePago,
                        status,
                        observacao,
                        parseDate,
                        existingCheck.rows[0].id
                    ]);
                    updated++;
                } else {
                    await client.query(`
                        INSERT INTO "ServiceOrder" (
                            id, "legacyNumber", "entryDate", "legacyClientName", "legacyVehiclePlate", 
                            "legacyTotalValue", "legacyPaidValue", status, observations, origin, 
                            "migratedAt", "createdAt", "updatedAt", km
                        )
                        VALUES (
                            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'LEGACY',
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
                        )
                    `, [
                        numero_os, parseDate, cliente_nome, placa, parseTotal, parsePago, status, observacao
                    ]);
                    imported++;
                }
            } catch (error) {
                console.error('Erro na linha:', row, error);
                errors.push(`Erro ao processar OS "${row.numero_os}": ${error instanceof Error ? error.message : 'Erro'}`);
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
            message: `✅ Importação concluída: ${imported} novos, ${updated} atualizados.`
        });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Falha no processamento do CSV' }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
