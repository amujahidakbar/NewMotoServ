import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check ownership
    const motors = await db.query(
      'SELECT id, current_odo AS currentOdo FROM motorcycles WHERE id = ? AND user_id = ?',
      [id, user.id]
    ) as any[];

    if (!motors || motors.length === 0) {
      return NextResponse.json(
        { error: 'Sepeda motor tidak ditemukan!' },
        { status: 404 }
      );
    }

    const motor = motors[0];

    // If updating odometer
    if (body.currentOdo !== undefined) {
      const newOdo = parseFloat(body.currentOdo);
      if (isNaN(newOdo)) {
        return NextResponse.json(
          { error: 'Odometer harus berupa angka!' },
          { status: 400 }
        );
      }


      await db.query(
        'UPDATE motorcycles SET current_odo = ? WHERE id = ?',
        [newOdo, id]
      );

      return NextResponse.json({ message: 'Odometer berhasil diperbarui!', currentOdo: newOdo });
    }

    // Else if updating profile details
    const { name, brand, plate } = body;
    if (!name) {
      return NextResponse.json(
        { error: 'Nama motor wajib diisi!' },
        { status: 400 }
      );
    }

    await db.query(
      'UPDATE motorcycles SET name = ?, brand = ?, plate = ? WHERE id = ?',
      [name, brand || '', plate || '', id]
    );

    return NextResponse.json({ message: 'Informasi sepeda motor berhasil diperbarui!' });

  } catch (error: any) {
    console.error('Update Motorcycle API Error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui data motor.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership and delete
    const result = await db.query(
      'DELETE FROM motorcycles WHERE id = ? AND user_id = ?',
      [id, user.id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Sepeda motor tidak ditemukan atau tidak memiliki hak akses!' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sepeda motor berhasil dihapus!' });

  } catch (error: any) {
    console.error('Delete Motorcycle API Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus motor.' },
      { status: 500 }
    );
  }
}
