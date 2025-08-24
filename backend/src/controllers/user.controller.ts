import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;
    const user = await UserService.createUser(userData);
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error: any) {
    const statusCode = error.message.includes('already exists') || 
                      error.message.includes('already taken') ? 409 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = req.body;
    const result = await UserService.loginUser(credentials);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid credentials') ? 401 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserService.getAllUsers(page, limit);
    
    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);
    
    res.json({
      success: true,
      message: 'User profile fetched successfully',
      data: user
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

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user is updating their own profile or is admin
    const requestingUserId = (req as any).userId;
    if (requestingUserId !== id) {
      res.status(403).json({ 
        success: false,
        message: 'Forbidden: Can only update your own profile' 
      });
      return;
    }

    const user = await UserService.updateUser(id, updateData);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error: any) {
    const statusCode = error.message.includes('Invalid') ? 400 : 
                      error.message.includes('not found') ? 404 :
                      error.message.includes('already') ? 409 : 500;
    
    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if user is deleting their own account or is admin
    const requestingUserId = (req as any).userId;
    if (requestingUserId !== id) {
      res.status(403).json({ 
        success: false,
        message: 'Forbidden: Can only delete your own account' 
      });
      return;
    }

    const result = await UserService.deleteUser(id);
    
    res.json({
      success: true,
      message: result.message
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

export const getUserLikedMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UserService.getUserLikedMedia(id, page, limit);
    
    res.json({
      success: true,
      message: 'Liked media fetched successfully',
      data: result.media,
      pagination: result.pagination
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
