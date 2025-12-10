import httpClient from './http';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Upload a file to Filesystem via API
 * @param path - Storage path (e.g., 'gallery/event-1/photo.jpg') - currently used to extract folder
 * @param file - File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  try {
    // Extract folder from path (assume first segment is folder)
    const parts = path.split('/');
    const folder = parts[0] || 'general';

    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<{ url: string }>(`/api/upload/${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete a file from Filesystem via API
 * @param path - Storage path or URL of the file to delete
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await httpClient.post('/api/upload/delete', { path });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get download URL for a file
 * @param path - Storage path of the file
 * @returns Download URL
 */
export async function getFileUrl(path: string): Promise<string> {
  // If path is already a URL, return it
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct URL (assuming it lives in uploads directory)
  // This might need adjustment depending on how paths are stored
  return `${API_URL}/uploads/${path}`;
}

/**
 * List all files in a directory
 * @param path - Storage directory path
 * @returns List of files
 */
export async function listFiles(path: string) {
  // Not implemented for filesystem yet
  console.warn('listFiles not implemented for filesystem storage', path);
  return [];
}

/**
 * Upload image with automatic resizing (for gallery)
 * @param path - Storage path
 * @param file - Image file
 * @returns Download URL
 */
export async function uploadImage(path: string, file: File): Promise<string> {
  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 5MB');
  }

  return uploadFile(path, file);
}

/**
 * Generate a unique storage path for a file
 * @param folder - Folder name (e.g., 'gallery', 'events')
 * @param fileName - Original file name
 * @returns Unique storage path
 */
export function generateStoragePath(folder: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = fileName.split('.').pop();
  return `${folder}/${timestamp}-${random}.${ext}`;
}
