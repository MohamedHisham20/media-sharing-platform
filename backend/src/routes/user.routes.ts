import express from 'express';
import { 
  register, 
  login, 
  getAllUsers, 
  getUserProfile, 
  updateUserProfile,
  deleteUser,
  getUserLikedMedia 
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
  objectIdSchema,
  paginationSchema
} from '../validators/validation';
import joi from 'joi';

const router = express.Router();

// Validation schemas
const paramIdSchema = joi.object({
  id: objectIdSchema.required()
});

const userQuerySchema = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10)
});

// Public routes
router.post('/register', 
  validateBody(userRegistrationSchema),
  register
);

router.post('/login', 
  validateBody(userLoginSchema),
  login
);

// Protected routes
router.get('/', 
  authenticateToken,
  validateQuery(userQuerySchema),
  getAllUsers
);

router.get('/:id', 
  validateParams(paramIdSchema),
  getUserProfile
);

router.put('/:id',
  authenticateToken,
  validateParams(paramIdSchema),
  validateBody(userUpdateSchema),
  updateUserProfile
);

router.delete('/:id', 
  authenticateToken,
  validateParams(paramIdSchema),
  deleteUser
);

router.get('/:id/liked-media',
  validateParams(paramIdSchema),
  validateQuery(userQuerySchema),
  getUserLikedMedia
);

export default router;