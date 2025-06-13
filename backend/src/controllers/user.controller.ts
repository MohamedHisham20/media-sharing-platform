import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { JWT_SECRET } from '../config';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword,  username });

    await user.save();
    res.status(201).json({ 
      message: 'User created',
      user: {
        id: user._id,
        email: user.email,
        username: user.username}});
  } catch (err) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  if (!JWT_SECRET) {
    res.status(500).json({ message: 'JWT secret is not defined' });
    return;
  }
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

  res.json({
    token,
    userId: user._id,
    email: user.email,
    username: user.username,
  });
};

// GET: all users
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password'); // exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// GET: single user by ID (profile)
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// DELETE: user by ID
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
