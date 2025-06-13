import Media from '../models/media.model';
import User from '../models/user.model';
import { Request, Response } from 'express';
import { uploadToCloudinary } from '../utils/cloudinary';
import fs from 'fs';

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
    const media = await Media.find().populate('user', 'email');
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching media' });
  }
};

export const likeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    await Media.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    await User.findByIdAndUpdate(userId, { $addToSet: { likedMedia: req.params.id } });
    res.json({ message: 'Liked' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking media' });
  }
};

export const unlikeMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    await Media.findByIdAndUpdate(req.params.id, { $inc: { likes: -1 } });
    await User.findByIdAndUpdate(userId, { $pull: { likedMedia: req.params.id } });
    res.json({ message: 'Unliked' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking media' });
  }
};