import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, actionBy = 'admin', notes = '' } = await request.json();

    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current status
      const [currentStatusRows] = await connection.execute(
        'SELECT status FROM claims WHERE id = ?',
        [id]
      );

      if ((currentStatusRows as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
      }

      const oldStatus = (currentStatusRows as any[])[0].status;

      // Update claim status
      await connection.execute(
        'UPDATE claims SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );

      // Record the status change action
      await connection.execute(
        'INSERT INTO claim_actions (claim_id, old_status, new_status, action_by, notes) VALUES (?, ?, ?, ?, ?)',
        [id, oldStatus, status, actionBy, notes]
      );

      await connection.commit();

      // Get updated claim data
      const [updatedClaimRows] = await connection.execute(
        `SELECT 
          id,
          policy_number as policyNumber,
          status,
          description,
          created_at as createdAt,
          updated_at as updatedAt
        FROM claims WHERE id = ?`,
        [id]
      );

      return NextResponse.json({ claim: (updatedClaimRows as any[])[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating claim status:', error);
    return NextResponse.json(
      { error: 'Failed to update claim status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Get claim actions history
    const [actionRows] = await dbPool.execute(
      `SELECT 
        action_id,
        claim_id,
        old_status,
        new_status,
        action_date,
        action_by,
        notes
      FROM claim_actions 
      WHERE claim_id = ? 
      ORDER BY action_date DESC`,
      [id]
    );

    return NextResponse.json({ actions: actionRows });
  } catch (error) {
    console.error('Error fetching claim actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claim actions' },
      { status: 500 }
    );
  }
}