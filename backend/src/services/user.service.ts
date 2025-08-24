import User from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import mongoose from 'mongoose';

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class UserService {
  // Register new user
  static async createUser(userData: CreateUserData) {
    const { email, password, username } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ 
      email, 
      password: hashedPassword, 
      username 
    });

    await user.save();

    // Return user without password
    return {
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    };
  }

  // Login user
  static async loginUser(credentials: LoginCredentials) {
    const { email, password } = credentials;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    if (!JWT_SECRET) {
      throw new Error('JWT secret is not defined');
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    };
  }

  // Get all users (for admin purposes)
  static async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  // Get user by ID
  static async getUserById(userId: string) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('uploadedMedia', 'title url type createdAt');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  static async updateUser(userId: string, updateData: Partial<CreateUserData>) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Check if email is being updated and is unique
    if (updateData.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Check if username is being updated and is unique
    if (updateData.username) {
      const existingUser = await User.findOne({ 
        username: updateData.username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  }

  // Delete user
  static async deleteUser(userId: string) {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error('User not found');
    }

    // TODO: Also delete user's media files from storage
    // This could be implemented as a background job

    return { message: 'User deleted successfully' };
  }

  // Get user's liked media
  static async getUserLikedMedia(userId: string, page: number = 1, limit: number = 10) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const skip = (page - 1) * limit;

    const user = await User.findById(userId)
      .populate({
        path: 'likedMedia',
        options: {
          sort: { createdAt: -1 },
          skip,
          limit
        },
        populate: {
          path: 'user',
          select: 'username'
        }
      });

    if (!user) {
      throw new Error('User not found');
    }

    const totalLiked = user.likedMedia.length;
    const totalPages = Math.ceil(totalLiked / limit);

    return {
      media: user.likedMedia,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalLiked,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}
