import express from 'express';
import { 
  uploadMedia, 
  getMedia, 
  getPublicMedia, 
  getMediaById,
  likeMedia, 
  unlikeMedia,
  getUploadUrl,
  confirmUpload,
  deleteMedia
} from '../controllers/media.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  mediaUploadSchema,
  objectIdSchema,
  paginationSchema
} from '../validators/validation';
import joi from 'joi';

const router = express.Router();

// Validation schemas
const uploadUrlSchema = joi.object({
  type: joi.string().valid('image', 'video').required().messages({
    'any.only': 'Type must be either image or video',
    'any.required': 'Type is required'
  })
});

const confirmUploadSchema = joi.object({
  public_id: joi.string().required().messages({
    'any.required': 'Public ID is required'
  }),
  title: joi.string().min(1).max(200).required().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  type: joi.string().valid('image', 'video').required().messages({
    'any.only': 'Type must be either image or video',
    'any.required': 'Type is required'
  })
});

const mediaQuerySchema = joi.object({
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
  userId: joi.string().optional(),
  type: joi.string().valid('image', 'video').optional()
});

const paramIdSchema = joi.object({
  id: objectIdSchema.required()
});

// Routes
router.get('/public', getPublicMedia);

router.get('/', 
  validateQuery(mediaQuerySchema),
  getMedia
);

router.get('/:id', 
  validateParams(paramIdSchema),
  getMediaById
);

// Protected routes
router.post('/upload', 
  authenticateToken, 
  upload.single('file'),
  validateBody(joi.object({
    title: joi.string().min(1).max(200).required().messages({
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    })
  })),
  uploadMedia
);

router.post('/upload-url',
  authenticateToken,
  validateBody(uploadUrlSchema),
  getUploadUrl
);

router.post('/confirm-upload',
  authenticateToken,
  validateBody(confirmUploadSchema),
  confirmUpload
);

router.post('/:id/like', 
  authenticateToken, 
  validateParams(paramIdSchema),
  likeMedia
);

router.post('/:id/dislike', 
  authenticateToken, 
  validateParams(paramIdSchema),
  unlikeMedia
);

router.delete('/:id',
  authenticateToken,
  validateParams(paramIdSchema),
  deleteMedia
);

export default router;
