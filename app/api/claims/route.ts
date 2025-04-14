import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { uploadImageToS3, generateUniqueId, getClaimFolderPath } from '@/lib/utils/s3-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const policyNumber = formData.get('policyNumber') as string;
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];

    // Generate unique claim ID
    const claimId = generateUniqueId();

    // Start a database transaction
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert claim record
      await connection.execute(
        'INSERT INTO claims (id, policy_number, description) VALUES (?, ?, ?)',
        [claimId, policyNumber, description]
      );

      // Process and upload images
      for (const image of images) {
        const buffer = Buffer.from(await image.arrayBuffer());
        const fileName = `${Date.now()}-${image.name}`;
        
        // Upload to S3
        const s3Url = await uploadImageToS3(buffer, fileName, claimId);
        const folderPath = getClaimFolderPath(claimId);

        // Store image reference in database
        await connection.execute(
          'INSERT INTO claim_images (id, claim_id, s3_url, s3_folder_path, file_name) VALUES (UUID(), ?, ?, ?, ?)',
          [claimId, s3Url, folderPath, fileName]
        );
      }

      // Commit transaction
      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        success: true, 
        message: 'Claim submitted successfully',
        claimId 
      });

    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process claim' },
      { status: 500 }
    );
  }
}