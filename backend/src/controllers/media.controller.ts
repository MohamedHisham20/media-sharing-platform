import Media from '../models/media.model';
import User from '../models/user.model';
import { Request, Response } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary';
import fs from 'fs';
import mongoose from 'mongoose';

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const userId = (req as any).userId; // Assuming userId is set in the request by authentication middleware
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }

    const type = file.mimetype.startsWith('video') ? 'video' : 'image';

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file.path, type);

    // delete local file after upload
    fs.unlinkSync(file.path);

    const media = new Media({
      title,
      url: cloudinaryUrl,
      type,
      user: userId,
    });

    await media.save();
    await User.findByIdAndUpdate(userId, { $push: { uploadedMedia: media._id } });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading media', error });
  }
};


export const getMedia = async (_req: Request, res: Response): Promise<void> => {
  try {
    // If want to filter media by userId
    //  const userId = (req as any).userId;
    // //  use userId for filtering if needed

    // const media = await Media.find()
    //   .populate('user', 'username')
    //   .sort({ createdAt: -1 });
    // res.json(media);

    const media = await Media.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media' });
  }
};

export const getPublicMedia = async (_req: Request, res: Response) => {
  try {
    const media = await Media.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(6); // Only show latest 6

    res.json(media);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching public media' });
  }
};


export const likeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId; // Assuming userId is set in the request by authentication middleware
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const mediaId = new mongoose.Types.ObjectId(req.params.id);
    const media = await Media.findById(req.params.id);
    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    const hasLiked = user.likedMedia.some(id => id.equals(mediaId));
    const hasDisliked = user.dislikedMedia.some(id => id.equals(mediaId));

    if (hasLiked) {
      // Remove like
      await Media.findByIdAndUpdate(mediaId, { $inc: { likes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { likedMedia: mediaId } });
      res.status(200).json({ message: 'Like removed', likes: media.likes - 1, dislikes: media.dislikes });
      return;
    }

    if (hasDisliked) {
      // Remove dislike
      await Media.findByIdAndUpdate(mediaId, { $inc: { dislikes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { dislikedMedia: mediaId } });
    }

    // Add like
    await Media.findByIdAndUpdate(mediaId, { $inc: { likes: 1 } });
    await User.findByIdAndUpdate(userId, { $addToSet: { likedMedia: mediaId } });

    res.status(200).json({ message: 'Liked', likes: media.likes + 1, dislikes: hasDisliked ? media.dislikes - 1 : media.dislikes });
  } catch (error) {
    console.error('Error liking media:', error);
    res.status(500).json({ message: 'Error liking media' });
  }
};

export const unlikeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const mediaId = new mongoose.Types.ObjectId(req.params.id);
    const media = await Media.findById(req.params.id);
    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    const hasLiked = user.likedMedia.some(id => id.equals(mediaId));
    const hasDisliked = user.dislikedMedia.some(id => id.equals(mediaId));

    if (hasDisliked) {
      // Remove dislike
      await Media.findByIdAndUpdate(mediaId, { $inc: { dislikes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { dislikedMedia: mediaId } });
      res.status(200).json({ message: 'Dislike removed', likes: media.likes, dislikes: media.dislikes - 1 });
      return;
    }

    if (hasLiked) {
      // Remove like
      await Media.findByIdAndUpdate(mediaId, { $inc: { likes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { likedMedia: mediaId } });
    }

    // Add dislike
    await Media.findByIdAndUpdate(mediaId, { $inc: { dislikes: 1 } });
    await User.findByIdAndUpdate(userId, { $addToSet: { dislikedMedia: mediaId } });

    res.status(200).json({ message: 'Disliked', likes: hasLiked ? media.likes - 1 : media.likes, dislikes: media.dislikes + 1 });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking media', error });
  }
};