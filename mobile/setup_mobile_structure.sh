#!/bin/bash

# Create root project directory
mkdir -p mobile

# Navigate into project
cd mobile || exit

# Create folders
mkdir -p assets
mkdir -p app/screens
mkdir -p app/components
mkdir -p app/navigation
mkdir -p app/context

# Create files
touch App.tsx
touch .env
touch app/screens/FeedScreen.tsx
touch app/screens/UploadScreen.tsx
touch app/screens/LoginScreen.tsx
touch app/components/MediaCard.tsx
touch app/navigation/AppNavigator.tsx
touch app/context/AuthContext.tsx

echo "Project structure created successfully in 'mobile/'"
