import { Request, Response } from 'express';
import { MediaService } from '../services/media.service';
import { uploadToCloudinary, verifyUpload } from '../utils/cloudinary';
import fs from 'fs';

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const userId = (req as any).userId;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }
    
    const file = req.file;
    if (!file) {
      res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
      return;
    }

    const type = file.mimetype.startsWith('video') ? 'video' : 'image';

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file.path, type);

    // Delete local file after upload
    fs.unlinkSync(file.path);

    // Create media using service
    const media = await MediaService.createMedia({
      title,
      url: cloudinaryUrl,
      type,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: media
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading media', 
      error: error.message 
    });
  }
};

export const getMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId as string;
    const type = req.query.type as 'image' | 'video';

    const filters = { userId, type };
    const result = await MediaService.getMedia({ page, limit }, filters);

    res.json({
      success: true,
      message: 'Media fetched successfully',
      data: result.media,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching media',
      error: error.message 
    });
  }
};

export const getPublicMedia = async (_req: Request, res: Response): Promise<void> => {
  try {
    const media = await MediaService.getPublicMedia(6);
    res.json({
      success: true,
      message: 'Public media fetched successfully',
      data: media
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public media',
      error: error.message 
    });
  }
};

export const getMediaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const media = await MediaService.getMediaById(id);
    
    res.json({
      success: true,
      message: 'Media fetched successfully',
      data: media
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 400 : 
                      error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const likeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    const updatedMedia = await MediaService.toggleReaction(id, userId, 'like');
    
    res.status(200).json({
      success: true,
      message: 'Reaction updated successfully',
      data: {
        likes: updatedMedia?.likes,
        dislikes: updatedMedia?.dislikes
      }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 400 : 
                      error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const unlikeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    const updatedMedia = await MediaService.toggleReaction(id, userId, 'dislike');
    
    res.status(200).json({
      success: true,
      message: 'Reaction updated successfully',
      data: {
        likes: updatedMedia?.likes,
        dislikes: updatedMedia?.dislikes
      }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 400 : 
                      error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// New endpoint for generating pre-signed URLs
export const getUploadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { type } = req.body;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    if (!type || !['image', 'video'].includes(type)) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid type. Must be image or video' 
      });
      return;
    }

    const signedUrl = await MediaService.generateUploadUrl(userId, type);
    
    res.json({
      success: true,
      message: 'Upload URL generated successfully',
      data: signedUrl
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// New endpoint for confirming direct upload
export const confirmUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { public_id, title, type } = req.body;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    // Verify the upload was successful
    const cloudinaryUrl = await verifyUpload(public_id, type);

    // Create media entry
    const media = await MediaService.createMedia({
      title,
      url: cloudinaryUrl,
      type,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Media upload confirmed successfully',
      data: media
    });
  } catch (error: any) {
    console.error('Error confirming upload:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error confirming upload', 
      error: error.message 
    });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
      return;
    }

    const result = await MediaService.deleteMedia(id, userId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 400 : 
                      error.message.includes('not found') ? 404 :
                      error.message.includes('Unauthorized') ? 403 : 500;
    
    res.status(statusCode).json({ 
      success: false, 
      message: error.message 
    });
  }
};