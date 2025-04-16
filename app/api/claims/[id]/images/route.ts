import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { uploadImageToS3, getSignedImageUrl } from '@/lib/utils/s3-utils';

// POST /api/claims/[id]/images - Upload image for a claim
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params);
  try {
    // Verify claim exists first
    const [claims] = await dbPool.execute('SELECT claim_id FROM claims WHERE claim_id = ?', [id]);
    const claimExists = (claims as any[]).length > 0;
    
    if (!claimExists) {
      // Create a new claim if one doesn't exist with default values
      const [statusRows] = await dbPool.execute(
        'SELECT status_id FROM claim_status WHERE status_name = "pending"'
      );
      const statusId = (statusRows as any[])[0].status_id;

      const [vehicleTypeRows] = await dbPool.execute(
        'SELECT type_id FROM vehicle_types WHERE type_name = "4_wheeler"'
      );
      const vehicleTypeId = (vehicleTypeRows as any[])[0].type_id;

      const [incidentTypeRows] = await dbPool.execute(
        'SELECT type_id FROM incident_types WHERE type_name = "vehicle_accident"'
      );
      const incidentTypeId = (incidentTypeRows as any[])[0].type_id;

      // Validate policy number format
      const policyNumber = `POL-${id.padStart(8, '0')}`;
      
      // Get current timestamp for consistent date handling
      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const [result] = await dbPool.execute(
        `INSERT INTO claims (
          claim_id, 
          uuid, 
          customer_name, 
          policy_number, 
          email, 
          phone_number, 
          vehicle_type_id, 
          vehicle_brand, 
          incident_type_id, 
          incident_date, 
          status_id, 
          estimated_cost, 
          damage_photo_url,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)`,
        [
          id,
          id,
          'Temporary User',
          policyNumber,
          'temp@example.com',
          '0000000000',
          vehicleTypeId,
          'Unknown',
          incidentTypeId,
          currentTimestamp,
          statusId,
          0,
          '',
          currentTimestamp,
          currentTimestamp
        ]
      );
      
      if (!result) {
        return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 });
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFileName = file.name;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = `image.${fileExtension}`;
    const s3Url = await uploadImageToS3(buffer, fileName, id);

    const [result] = await dbPool.execute(
      'INSERT INTO claim_images (claim_id, s3_url, s3_folder_path, file_name) VALUES (?, ?, ?, ?)',
      [id, s3Url, `claims/${id}`, fileName]
    );

    return NextResponse.json({ success: true, url: s3Url })
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// GET /api/claims/[id]/images - Get all images for a claim
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [rows] = await dbPool.execute(
      'SELECT * FROM claim_images WHERE claim_id = ?',
      [id]
    );

    const images = await Promise.all(
      (rows as any[]).map(async (image) => {
        const signedUrl = await getSignedImageUrl(image.s3_folder_path + '/' + image.file_name);
        return {
          id: image.id,
          url: signedUrl,
          fileName: image.file_name,
          uploadedAt: image.uploaded_at
        };
      })
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}