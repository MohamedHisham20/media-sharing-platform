import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config';
import crypto from 'crypto';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  filePath: string,
  type: 'image' | 'video'
): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'media',
      resource_type: type,
    });
    return result.secure_url;
  } catch (error: any) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Generate pre-signed URL for direct client uploads
export const generateSignedUrl = async (
  type: 'image' | 'video',
  folder: string = 'media'
): Promise<{
  url: string;
  public_id: string;
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
}> => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const public_id = `${folder}/${crypto.randomUUID()}`;
    
    // Parameters for the signature
    const params = {
      timestamp,
      public_id,
      folder,
      resource_type: type,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET!);

    return {
      url: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`,
      public_id,
      signature,
      timestamp,
      api_key: CLOUDINARY_API_KEY!,
      cloud_name: CLOUDINARY_CLOUD_NAME!,
    };
  } catch (error: any) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

// Verify uploaded file from client
export const verifyUpload = async (
  public_id: string,
  type: 'image' | 'video'
): Promise<string> => {
  try {
    const result = await cloudinary.api.resource(public_id, {
      resource_type: type,
    });
    return result.secure_url;
  } catch (error: any) {
    throw new Error(`Failed to verify upload: ${error.message}`);
  }
};

// Delete media from Cloudinary
export const deleteFromCloudinary = async (
  public_id: string,
  type: 'image' | 'video'
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: type,
    });
  } catch (error: any) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};
