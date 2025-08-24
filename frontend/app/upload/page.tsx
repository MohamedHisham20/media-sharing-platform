"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api, uploadToCloudinary } from "@/lib/api";
import { Upload, X, FileVideo, FileImage } from "lucide-react";

interface UploadProgress {
  stage: 'idle' | 'getting-url' | 'uploading' | 'confirming' | 'completed' | 'error';
  progress: number;
  message: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [useDirectUpload, setUseDirectUpload] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/avi'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 100MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV, AVI)' };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validation = validateFile(selectedFile);
    
    if (!validation.valid) {
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: validation.error || 'Invalid file'
      });
      return;
    }

    setFile(selectedFile);
    setUploadProgress({ stage: 'idle', progress: 0, message: '' });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Redirect if not logged in
  if (!isLoading && !isLoggedIn) {
    router.push('/login');
    return null;
  }

  // Direct upload flow (recommended)
  const handleDirectUpload = async () => {
    if (!file || !title.trim()) return;

    const fileType = file.type.startsWith('video') ? 'video' : 'image';

    try {
      console.log('🚀 Starting direct upload for:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: fileType,
        title: title.trim()
      });

      // Step 1: Get pre-signed URL
      setUploadProgress({
        stage: 'getting-url',
        progress: 10,
        message: 'Getting upload URL...'
      });

      const urlResponse = await api.media.getUploadUrl(fileType);
      console.log('📡 Upload URL response:', urlResponse);
      
      if (!urlResponse.success || !urlResponse.data) {
        throw new Error(urlResponse.message || 'Failed to get upload URL');
      }

      // Step 2: Upload directly to Cloudinary
      setUploadProgress({
        stage: 'uploading',
        progress: 30,
        message: 'Uploading to cloud storage...'
      });

      const cloudinaryResult = await uploadToCloudinary(file, urlResponse.data);
      console.log('☁️ Cloudinary result:', cloudinaryResult);

      setUploadProgress({
        stage: 'uploading',
        progress: 80,
        message: 'Upload complete, processing...'
      });

      // Step 3: Confirm upload with backend
      setUploadProgress({
        stage: 'confirming',
        progress: 90,
        message: 'Confirming upload...'
      });

      const confirmResponse = await api.media.confirmUpload({
        public_id: urlResponse.data.public_id,
        title: title.trim(),
        type: fileType
      });

      console.log('✅ Confirm response:', confirmResponse);

      if (!confirmResponse.success) {
        throw new Error(confirmResponse.message || 'Failed to confirm upload');
      }

      setUploadProgress({
        stage: 'completed',
        progress: 100,
        message: 'Upload successful!'
      });

      setTimeout(() => {
        router.push('/feed');
      }, 1500);

    } catch (error) {
      console.error('❌ Direct upload failed:', error);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  // Traditional upload (fallback)
  const handleTraditionalUpload = async () => {
    if (!file || !title.trim()) return;

    try {
      console.log('🔄 Starting traditional upload for:', {
        fileName: file.name,
        fileSize: file.size,
        title: title.trim()
      });

      setUploadProgress({
        stage: 'uploading',
        progress: 20,
        message: 'Uploading file...'
      });

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);

      console.log('📤 Sending form data to backend...');

      const response = await api.media.upload(formData);
      console.log('📡 Traditional upload response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      setUploadProgress({
        stage: 'completed',
        progress: 100,
        message: 'Upload successful!'
      });

      setTimeout(() => {
        router.push('/feed');
      }, 1500);

    } catch (error) {
      console.error('❌ Traditional upload failed:', error);
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      setUploadProgress({
        stage: 'error',
        progress: 0,
        message: 'Please select a file and enter a title'
      });
      return;
    }

    if (useDirectUpload) {
      await handleDirectUpload();
    } else {
      await handleTraditionalUpload();
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress({ stage: 'idle', progress: 0, message: '' });
  };

  const getFileIcon = (file: File) => {
    return file.type.startsWith('video') ? 
      <FileVideo className="w-8 h-8 text-blue-500" /> : 
      <FileImage className="w-8 h-8 text-green-500" />;
  };

  const isUploading = ['getting-url', 'uploading', 'confirming'].includes(uploadProgress.stage);

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
          <CardDescription>
            Share your photos and videos with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your media"
                required
                disabled={isUploading}
              />
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Media File</Label>
              
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV, AVI)
                  </p>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 100MB
                  </p>
                  
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) handleFileSelect(selectedFile);
                    }}
                    className="hidden"
                    id="file-input"
                    disabled={isUploading}
                  />
                  <Label 
                    htmlFor="file-input" 
                    className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </Label>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Method Selection */}
            <div className="space-y-2">
              <Label>Upload Method</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={useDirectUpload}
                    onChange={() => setUseDirectUpload(true)}
                    disabled={isUploading}
                  />
                  <span className="text-sm">
                    Direct Upload <span className="text-green-600">(Recommended)</span>
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!useDirectUpload}
                    onChange={() => setUseDirectUpload(false)}
                    disabled={isUploading}
                  />
                  <span className="text-sm">Traditional Upload</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Direct upload is faster and more efficient for large files
              </p>
            </div>

            {/* Progress Display */}
            {uploadProgress.stage !== 'idle' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadProgress.message}</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      uploadProgress.stage === 'error'
                        ? 'bg-red-500'
                        : uploadProgress.stage === 'completed'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                {uploadProgress.stage === 'error' && (
                  <p className="text-sm text-red-500 mt-2">{uploadProgress.message}</p>
                )}
                {uploadProgress.stage === 'completed' && (
                  <p className="text-sm text-green-500 mt-2">
                    Redirecting to feed...
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!file || !title.trim() || isUploading || uploadProgress.stage === 'completed'}
            >
              {isUploading ? 'Uploading...' : 'Upload Media'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
