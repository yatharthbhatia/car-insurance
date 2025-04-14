import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from '../db/config';

// Generate a 12-digit unique identifier
export const generateUniqueId = () => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return timestamp + random;
};

// Create S3 folder path for a claim
export const getClaimFolderPath = (claimId: string) => `claims/${claimId}`;

// Upload image to S3
export const uploadImageToS3 = async (file: Buffer, fileName: string, claimId: string) => {
  const folderPath = getClaimFolderPath(claimId);
  const key = `${folderPath}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'image/jpeg' // Adjust based on file type
  });

  await s3Client.send(command);
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};

// Get signed URL for image retrieval
export const getSignedImageUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
};