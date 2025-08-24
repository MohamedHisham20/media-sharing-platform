import Media from '../models/media.model';
import User from '../models/user.model';
import mongoose from 'mongoose';
import { generateSignedUrl } from '../utils/cloudinary';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface MediaFilters {
  userId?: string;
  type?: 'image' | 'video';
}

export class MediaService {
  // Get paginated media with optional filters
  static async getMedia(options: PaginationOptions, filters: MediaFilters = {}) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (filters.userId) {
      query.user = filters.userId;
    }
    if (filters.type) {
      query.type = filters.type;
    }

    const media = await Media.find(query)
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      media,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  // Get public media (limited)
  static async getPublicMedia(limit: number = 6) {
    return await Media.find()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Create new media entry
  static async createMedia(data: {
    title: string;
    url: string;
    type: 'image' | 'video';
    userId: string;
  }) {
    const media = new Media({
      title: data.title,
      url: data.url,
      type: data.type,
      user: data.userId,
    });

    await media.save();
    await User.findByIdAndUpdate(data.userId, { 
      $push: { uploadedMedia: media._id } 
    });

    return media;
  }

  // Handle like/dislike functionality
  static async toggleReaction(
    mediaId: string, 
    userId: string, 
    action: 'like' | 'dislike'
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const media = await Media.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    const mediaObjectId = new mongoose.Types.ObjectId(mediaId);
    const hasLiked = user.likedMedia.some(id => id.equals(mediaObjectId));
    const hasDisliked = user.dislikedMedia.some(id => id.equals(mediaObjectId));

    // Determine current state and desired action
    const isCurrentlyLiked = hasLiked;
    const isCurrentlyDisliked = hasDisliked;
    const wantsToLike = action === 'like';

    // Remove existing reactions
    if (isCurrentlyLiked) {
      await Media.findByIdAndUpdate(mediaId, { $inc: { likes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { likedMedia: mediaObjectId } });
    }
    
    if (isCurrentlyDisliked) {
      await Media.findByIdAndUpdate(mediaId, { $inc: { dislikes: -1 } });
      await User.findByIdAndUpdate(userId, { $pull: { dislikedMedia: mediaObjectId } });
    }

    // Add new reaction if different from current state
    if (wantsToLike && !isCurrentlyLiked) {
      await Media.findByIdAndUpdate(mediaId, { $inc: { likes: 1 } });
      await User.findByIdAndUpdate(userId, { $addToSet: { likedMedia: mediaObjectId } });
    } else if (!wantsToLike && !isCurrentlyDisliked) {
      await Media.findByIdAndUpdate(mediaId, { $inc: { dislikes: 1 } });
      await User.findByIdAndUpdate(userId, { $addToSet: { dislikedMedia: mediaObjectId } });
    }

    // Get updated media
    const updatedMedia = await Media.findById(mediaId);
    return updatedMedia;
  }

  // Generate pre-signed upload URL
  static async generateUploadUrl(userId: string, fileType: 'image' | 'video') {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const signedUrl = await generateSignedUrl(fileType);
    return signedUrl;
  }

  // Get media by ID
  static async getMediaById(mediaId: string) {
    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      throw new Error('Invalid media ID');
    }

    const media = await Media.findById(mediaId).populate('user', 'username');
    if (!media) {
      throw new Error('Media not found');
    }

    return media;
  }

  // Delete media
  static async deleteMedia(mediaId: string, userId: string) {
    const media = await Media.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // Check if user owns the media
    if (!media.user || media.user.toString() !== userId) {
      throw new Error('Unauthorized to delete this media');
    }

    await Media.findByIdAndDelete(mediaId);
    await User.findByIdAndUpdate(userId, { 
      $pull: { uploadedMedia: mediaId } 
    });

    return { message: 'Media deleted successfully' };
  }
}
