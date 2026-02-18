import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { SupplierType } from '@/types/supplier';

// GET /api/suppliers - List all suppliers with optional filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as SupplierType | null;
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');

        let sql = 'SELECT * FROM "Supplier" WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        // Filter by type
        if (type && Object.values(SupplierType).includes(type)) {
            sql += ` AND "type" = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        // Filter by active status
        if (isActive !== null && isActive !== undefined) {
            sql += ` AND "isActive" = $${paramIndex}`;
            params.push(isActive === 'true');
            paramIndex++;
        }

        // Search by name, document, or city
        if (search) {
            sql += ` AND (
                LOWER("name") LIKE $${paramIndex} OR 
                LOWER("tradeName") LIKE $${paramIndex} OR 
                "document" LIKE $${paramIndex} OR 
                LOWER("city") LIKE $${paramIndex}
            )`;
            params.push(`%${search.toLowerCase()}%`);
            paramIndex++;
        }

        sql += ' ORDER BY "name" ASC';

        const result = await db.query(sql, params);
        const suppliers = result.rows;

        // Calculate statistics
        const stats = {
            total: suppliers.length,
            byType: {
                PARTS: suppliers.filter((s: any) => s.type === 'PARTS').length,
                WORKSHOP: suppliers.filter((s: any) => s.type === 'WORKSHOP').length,
                RECTIFICATION: suppliers.filter((s: any) => s.type === 'RECTIFICATION').length,
                OTHER: suppliers.filter((s: any) => s.type === 'OTHER').length,
            },
            active: suppliers.filter((s: any) => s.isActive).length,
            inactive: suppliers.filter((s: any) => !s.isActive).length,
        };

        return NextResponse.json({
            success: true,
            suppliers,
            stats
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar fornecedores' },
            { status: 500 }
        );
    }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const {
            name,
            tradeName,
            document,
            email,
            phone,
            whatsapp,
            type,
            address,
            city,
            state,
            zipCode,
            contactPerson,
            notes
        } = body;

        // Validation
        if (!name || !phone || !type) {
            return NextResponse.json(
                { success: false, error: 'Nome, telefone e tipo são obrigatórios' },
                { status: 400 }
            );
        }

        if (!Object.values(SupplierType).includes(type)) {
            return NextResponse.json(
                { success: false, error: 'Tipo de fornecedor inválido' },
                { status: 400 }
            );
        }

        // Check if document already exists (if provided)
        if (document) {
            const existingSupplier = await db.query(
                'SELECT id FROM "Supplier" WHERE "document" = $1',
                [document]
            );
            if (existingSupplier.rows.length > 0) {
                return NextResponse.json(
                    { success: false, error: 'Já existe um fornecedor com este documento' },
                    { status: 400 }
                );
            }
        }

        // Generate ID
        const id = `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert supplier
        const result = await db.query(
            `INSERT INTO "Supplier" (
                "id", "name", "tradeName", "document", "email", "phone", "whatsapp",
                "type", "address", "city", "state", "zipCode", "contactPerson", "notes",
                "isActive", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
            RETURNING *`,
            [
                id, name, tradeName || null, document || null, email || null,
                phone, whatsapp || null, type, address || null, city || null,
                state || null, zipCode || null, contactPerson || null, notes || null, true
            ]
        );

        return NextResponse.json({
            success: true,
            supplier: result.rows[0]
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating supplier:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao criar fornecedor' },
            { status: 500 }
        );
    }
}
