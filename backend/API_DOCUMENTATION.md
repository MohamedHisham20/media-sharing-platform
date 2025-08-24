# Media Sharing Platform API

## Overview

This is a refactored backend for a media sharing platform with improved architecture, input validation, pagination, and direct file upload capabilities.

## Key Improvements

### 1. File Upload Architecture
- **Before**: Files uploaded to server first, then to Cloudinary
- **After**: Direct client uploads to Cloudinary using pre-signed URLs
- **Benefits**: Reduced server load, faster uploads, better scalability

### 2. Input Validation
- **Before**: No validation, prone to errors
- **After**: Comprehensive validation using Joi schemas
- **Benefits**: Data integrity, better error messages, security

### 3. Performance Optimization
- **Before**: No pagination, all media returned at once
- **After**: Paginated responses with filtering options
- **Benefits**: Better performance with large datasets

### 4. Code Organization
- **Before**: All logic in controllers
- **After**: Layered architecture with services, validators, and error handling
- **Benefits**: Better maintainability, separation of concerns, testability

### 5. Code Efficiency
- **Before**: Duplicate like/unlike functions
- **After**: Single unified reaction system
- **Benefits**: DRY principle, easier maintenance

## API Endpoints

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Users

#### Get All Users (Protected)
```http
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

#### Get User Profile
```http
GET /api/users/{userId}
```

#### Update User Profile (Protected)
```http
PUT /api/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### Delete User (Protected)
```http
DELETE /api/users/{userId}
Authorization: Bearer <token>
```

#### Get User's Liked Media
```http
GET /api/users/{userId}/liked-media?page=1&limit=10
```

### Media

#### Get Public Media
```http
GET /api/media/public
```

#### Get All Media (with pagination and filters)
```http
GET /api/media?page=1&limit=10&type=image&userId=123
```

#### Get Media by ID
```http
GET /api/media/{mediaId}
```

#### Upload Media (Traditional - Protected)
```http
POST /api/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
title: "My Media Title"
```

#### Get Pre-signed Upload URL (Recommended - Protected)
```http
POST /api/media/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "image" // or "video"
}
```

#### Confirm Direct Upload (Protected)
```http
POST /api/media/confirm-upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "public_id": "media/unique-id",
  "title": "My Media Title",
  "type": "image"
}
```

#### Like Media (Protected)
```http
POST /api/media/{mediaId}/like
Authorization: Bearer <token>
```

#### Dislike Media (Protected)
```http
POST /api/media/{mediaId}/dislike
Authorization: Bearer <token>
```

#### Delete Media (Protected)
```http
DELETE /api/media/{mediaId}
Authorization: Bearer <token>
```

## Direct Upload Flow

### 1. Get Pre-signed URL
```javascript
const response = await fetch('/api/media/upload-url', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ type: 'image' })
});

const { data } = await response.json();
// data contains: url, public_id, signature, timestamp, api_key, cloud_name
```

### 2. Upload Directly to Cloudinary
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('public_id', data.public_id);
formData.append('signature', data.signature);
formData.append('timestamp', data.timestamp);
formData.append('api_key', data.api_key);

const uploadResponse = await fetch(data.url, {
  method: 'POST',
  body: formData
});
```

### 3. Confirm Upload
```javascript
const confirmResponse = await fetch('/api/media/confirm-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    public_id: data.public_id,
    title: 'My Media Title',
    type: 'image'
  })
});
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Pagination

Paginated endpoints return:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Validation

### User Registration
- Email: Valid email format, required
- Password: 6-128 characters, required
- Username: 3-30 alphanumeric characters, required

### Media Upload
- Title: 1-200 characters, required
- Type: Must be 'image' or 'video', required

### Pagination
- Page: Integer ≥ 1, default: 1
- Limit: Integer 1-100, default: 10

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/media-sharing
JWT_SECRET=your-jwt-secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

## Architecture

```
src/
├── controllers/     # Request handling
├── services/        # Business logic
├── models/          # Database models
├── middlewares/     # Custom middleware
├── validators/      # Input validation
├── routes/          # API routes
├── utils/           # Utility functions
└── config.ts        # Configuration
```

## Running the Server

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

## Health Check

```http
GET /health
```

Returns server status and environment information.
