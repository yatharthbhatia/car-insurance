import { NextRequest, NextResponse } from 'next/server';
import { dbPool } from '@/lib/db/config';
import { uploadImageToS3, getSignedImageUrl } from '@/lib/utils/s3-utils';

// POST /api/claims/[id]/images - Upload image for a claim
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalFileName = file.name;
    const fileExtension = originalFileName.split('.').pop();
    const fileName = `image.${fileExtension}`;
    const s3Url = await uploadImageToS3(buffer, fileName, params.id);

    const [result] = await dbPool.execute(
      'INSERT INTO claim_images (id, claim_id, s3_url, s3_folder_path, file_name) VALUES (UUID(), ?, ?, ?, ?)',
      [params.id, s3Url, `claims/${params.id}`, fileName]
    );

    return NextResponse.json({ success: true, url: s3Url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// GET /api/claims/[id]/images - Get all images for a claim
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [rows] = await dbPool.execute(
      'SELECT * FROM claim_images WHERE claim_id = ?',
      [params.id]
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