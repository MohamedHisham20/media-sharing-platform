import express from 'express';
import { register, login, getAllUsers, getUserProfile, deleteUser } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserProfile);
router.delete('/:id', authenticateToken, deleteUser);


export default router;