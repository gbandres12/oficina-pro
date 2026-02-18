import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { SupplierType } from '@/types/supplier';

// GET /api/suppliers/[id] - Get specific supplier
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;

        const result = await db.query(
            'SELECT * FROM "Supplier" WHERE "id" = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            supplier: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching supplier:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar fornecedor' },
            { status: 500 }
        );
    }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check if supplier exists
        const existingSupplier = await db.query(
            'SELECT * FROM "Supplier" WHERE "id" = $1',
            [id]
        );

        if (existingSupplier.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        // Validate type if provided
        if (body.type && !Object.values(SupplierType).includes(body.type)) {
            return NextResponse.json(
                { success: false, error: 'Tipo de fornecedor inválido' },
                { status: 400 }
            );
        }

        // Check if document is being changed and if it already exists
        if (body.document && body.document !== existingSupplier.rows[0].document) {
            const duplicateDoc = await db.query(
                'SELECT id FROM "Supplier" WHERE "document" = $1 AND "id" != $2',
                [body.document, id]
            );
            if (duplicateDoc.rows.length > 0) {
                return NextResponse.json(
                    { success: false, error: 'Já existe um fornecedor com este documento' },
                    { status: 400 }
                );
            }
        }

        // Build update query dynamically
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        const allowedFields = [
            'name', 'tradeName', 'document', 'email', 'phone', 'whatsapp',
            'type', 'address', 'city', 'state', 'zipCode', 'contactPerson',
            'notes', 'isActive'
        ];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateFields.push(`"${field}" = $${paramIndex}`);
                values.push(body[field] === '' ? null : body[field]);
                paramIndex++;
            }
        });

        if (updateFields.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Nenhum campo para atualizar' },
                { status: 400 }
            );
        }

        // Add updatedAt
        updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);

        // Add id to values
        values.push(id);

        const sql = `
            UPDATE "Supplier"
            SET ${updateFields.join(', ')}
            WHERE "id" = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(sql, values);

        return NextResponse.json({
            success: true,
            supplier: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao atualizar fornecedor' },
            { status: 500 }
        );
    }
}

// DELETE /api/suppliers/[id] - Soft delete (deactivate) supplier
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const { id } = await params;

        // Check if supplier exists
        const existingSupplier = await db.query(
            'SELECT * FROM "Supplier" WHERE "id" = $1',
            [id]
        );

        if (existingSupplier.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Fornecedor não encontrado' },
                { status: 404 }
            );
        }

        // Soft delete - just set isActive to false
        const result = await db.query(
            `UPDATE "Supplier"
             SET "isActive" = false, "updatedAt" = CURRENT_TIMESTAMP
             WHERE "id" = $1
             RETURNING *`,
            [id]
        );

        return NextResponse.json({
            success: true,
            supplier: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao desativar fornecedor' },
            { status: 500 }
        );
    }
}
