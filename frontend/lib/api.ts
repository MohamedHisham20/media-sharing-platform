// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: string[];
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const auth = localStorage.getItem('auth');
    if (!auth) return null;
    
    const parsed = JSON.parse(auth);
    return parsed.token || null;
  } catch {
    return null;
  }
};

// Create request headers with authentication
const createHeaders = (includeAuth: boolean = true, isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request function
async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true,
  isFormData: boolean = false
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(includeAuth, isFormData),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// API methods
export const api = {
  // Auth endpoints
  auth: {
    register: (userData: { email: string; password: string; username: string }) =>
      apiRequest<{ id: string; email: string; username: string; createdAt: string }>('/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }, false),

    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ token: string; user: { id: string; email: string; username: string; createdAt: string } }>('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }, false),
  },

  // User endpoints
  users: {
    getProfile: (userId: string) =>
      apiRequest(`/users/${userId}`, {}, false),

    updateProfile: (userId: string, data: Partial<{ email: string; username: string; password: string }>) =>
      apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    deleteAccount: (userId: string) =>
      apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      }),

    getLikedMedia: (userId: string, page: number = 1, limit: number = 10) =>
      apiRequest(`/users/${userId}/liked-media?page=${page}&limit=${limit}`, {}, false),
  },

  // Media endpoints
  media: {
    getAll: (page: number = 1, limit: number = 10, filters?: { userId?: string; type?: 'image' | 'video' }) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.type && { type: filters.type }),
      });
      
      return apiRequest<{
        media: Array<{
          _id: string;
          title: string;
          url: string;
          type: string;
          likes: number;
          dislikes: number;
          createdAt: string;
          user: { _id: string; username: string };
        }>;
        totalPages: number;
        currentPage: number;
        totalItems: number;
      }>(`/media?${params}`, {}, false);
    },

    getPublic: () =>
      apiRequest('/media/public', {}, false),

    getById: (mediaId: string) =>
      apiRequest(`/media/${mediaId}`, {}, false),

    // Traditional upload (backward compatible)
    upload: (formData: FormData) =>
      apiRequest('/media/upload', {
        method: 'POST',
        body: formData,
      }, true, true),

    // Direct upload flow (recommended)
    getUploadUrl: (type: 'image' | 'video') =>
      apiRequest<{
        url: string;
        public_id: string;
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        resource_type: string;
      }>('/media/upload-url', {
        method: 'POST',
        body: JSON.stringify({ type }),
      }),

    confirmUpload: (data: { public_id: string; title: string; type: 'image' | 'video' }) =>
      apiRequest('/media/confirm-upload', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    // Reactions
    like: (mediaId: string) =>
      apiRequest<{ likes: number; dislikes: number }>(`/media/${mediaId}/like`, {
        method: 'POST',
      }),

    dislike: (mediaId: string) =>
      apiRequest<{ likes: number; dislikes: number }>(`/media/${mediaId}/dislike`, {
        method: 'POST',
      }),

    delete: (mediaId: string) =>
      apiRequest(`/media/${mediaId}`, {
        method: 'DELETE',
      }),
  },

  // Health check
  health: () =>
    apiRequest('/health', {}, false).catch(() => 
      fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(r => r.json())
    ),
};

// Direct upload to Cloudinary
export const uploadToCloudinary = async (
  file: File,
  uploadData: {
    url: string;
    public_id: string;
    signature: string;
    timestamp: number;
    api_key: string;
    folder: string;
    resource_type: string;
  }
): Promise<Record<string, unknown>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public_id', uploadData.public_id);
    formData.append('signature', uploadData.signature);
    formData.append('timestamp', uploadData.timestamp.toString());
    formData.append('api_key', uploadData.api_key);
    formData.append('folder', uploadData.folder);
    formData.append('resource_type', uploadData.resource_type);

    console.log('🚀 Uploading to Cloudinary:', {
      url: uploadData.url,
      public_id: uploadData.public_id,
      api_key: uploadData.api_key,
      folder: uploadData.folder,
      resource_type: uploadData.resource_type,
      fileSize: file.size,
      fileName: file.name
    });

    const response = await fetch(uploadData.url, {
      method: 'POST',
      body: formData,
      // Remove any custom headers that might interfere with CORS
    });

    console.log('📡 Cloudinary response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary error response:', errorText);
      throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Cloudinary upload successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

export default api;
