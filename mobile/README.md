# Mobile App Setup Guide

## 🚀 Live Deployment


**Backend (API):** Hosted on Render
- Production API endpoint with MongoDB database
- Cloudinary integration for media storage and processing

You can use the web app to test features and see the full functionality before setting up the mobile development environment.

## Environment Configuration

### 1. Environment Variables Setup

**🔒 Security Note**: The `.env` file contains sensitive configuration and should never be committed to version control.

**Setup Steps:**
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your configuration:
   ```properties
   # For local development
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   
   # For production
   EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

### 2. Development Setup

**Prerequisites:**
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

**Installation:**
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

**Connect your device:**
1. Install Expo Go from App Store/Google Play
2. Scan the QR code from the terminal
3. The app will load on your device

### 3. API Configuration

Make sure your backend server is running and accessible:

**Local Development:**
- Backend should be running on `http://localhost:5000`
- Use your computer's IP address if testing on physical device
- Example: `EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api`

**Production:**
- Update `EXPO_PUBLIC_API_URL` to your deployed backend URL

### 4. Features

- **Authentication**: Login/Register with JWT tokens
- **Media Upload**: Photos and videos with required titles
- **Feed**: Browse uploaded media with like/dislike functionality
- **Profile**: User account management

### 5. Security Best Practices

- ✅ `.env` file is gitignored
- ✅ Environment variables are properly templated
- ✅ Sensitive data is kept out of version control
- ✅ API calls use proper authentication headers

### 6. Consistency with Web App

The mobile app now maintains feature parity with the web frontend:
- ✅ Title is required for media uploads
- ✅ Consistent validation and error messages
- ✅ Same authentication flow and API integration
