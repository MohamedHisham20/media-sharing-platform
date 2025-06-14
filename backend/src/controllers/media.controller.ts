import Media from '../models/media.model';
import User from '../models/user.model';
import { Request, Response } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary';
import fs from 'fs';
import mongoose from 'mongoose';

export const uploadMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, userId } = req.body;
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
    const media = await Media.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media' });
  }
};

export const likeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    
    // Fetch the user document
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const mediaId = new mongoose.Types.ObjectId(req.params.id);
    
    if (user.likedMedia.includes(mediaId)) {
      // decreament likes if already liked
      await Media.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } });
      // remove the like from the user's liked media
      await User.findByIdAndUpdate(userId, { $pull: { likedMedia: mediaId } });
      res.status(400).json({ message: 'Media already liked' });
      return;
    }
    if (user.dislikedMedia.includes(mediaId)) {
      // remove from disliked media if it was disliked before
      await User.findByIdAndUpdate(userId, { $pull: { dislikedMedia: mediaId } });
      // decrement dislikes
      await Media.findByIdAndUpdate(req.params.id, { $inc: { dislikes: -1 } });
    }
    // add to liked media
    await User.findByIdAndUpdate(userId, { $addToSet: { likedMedia: mediaId } });
    // increment likes
    await Media.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.json({ message: 'Liked' });
  } catch (error) {
    console.error('Error liking media:', error);
    // Log the error for debugging
    res.status(500).json({ message: 'Error liking media' });
  }
};

export const unlikeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    // Fetch the user document
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const mediaId = new mongoose.Types.ObjectId(req.params.id);

    if (user.likedMedia.includes(mediaId)) {
      // decrement likes if already liked
      await Media.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } });
      // remove the like from the user's liked media
      await User.findByIdAndUpdate(userId, { $pull: { likedMedia: mediaId } });
      
    }
    if (user.dislikedMedia.includes(mediaId)) {
      // already disliked, so remove the dislike
      await User.findByIdAndUpdate(userId, { $pull: { dislikedMedia: mediaId } });
      // decrement dislikes
      await Media.findByIdAndUpdate(req.params.id, { $inc: { dislikes: -1 } });
      res.status(400).json({ message: 'Media already disliked' });
      return;
    }
    // add to disliked media
    await User.findByIdAndUpdate(userId, { $addToSet: { dislikedMedia: mediaId } });
    // increment dislikes
    await Media.findByIdAndUpdate(req.params.id, { $inc: { dislikes: 1 } });
    res.json({ message: 'Disliked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking media', error });
  }
}