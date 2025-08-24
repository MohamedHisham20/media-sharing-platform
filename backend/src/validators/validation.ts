import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// User validation schemas
export const userRegistrationSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'any.required': 'Password is required'
  }),
  username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters',
    'any.required': 'Username is required'
  })
});

export const userLoginSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const userUpdateSchema = joi.object({
  email: joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address'
  }),
  password: joi.string().min(6).max(128).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 128 characters'
  }),
  username: joi.string().alphanum().min(3).max(30).optional().messages({
    'string.alphanum': 'Username can only contain letters and numbers',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 30 characters'
  })
});

// Media validation schemas
export const mediaUploadSchema = joi.object({
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

// Pagination validation schema
export const paginationSchema = joi.object({
  page: joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

// MongoDB ObjectId validation
export const objectIdSchema = joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Invalid ID format'
});

// Validation middleware factory
export const validateBody = (schema: joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
      return;
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema: joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false 
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: errorMessages
      });
      return;
    }

    req.params = value;
    next();
  };
};

export const validateQuery = (schema: joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      console.log('validateQuery called with req.query:', req.query);
      
      const { error, value } = schema.validate(req.query, { 
        abortEarly: false,
        stripUnknown: true 
      });

      console.log('Validation result:', { error: error?.message, value });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: errorMessages
        });
        return;
      }

      // Instead of modifying req.query directly, attach validated data to req
      (req as any).validatedQuery = value;
      console.log('Validation successful, calling next()');
      next();
    } catch (err: any) {
      console.error('Error in validateQuery middleware:', err);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
      });
    }
  };
};
