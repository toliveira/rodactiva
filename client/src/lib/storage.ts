import { storage } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param path - Storage path (e.g., 'gallery/event-1/photo.jpg')
 * @param file - File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 * @param path - Storage path of the file to delete
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
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
  try {
    const storageRef = ref(storage, path);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

/**
 * List all files in a directory
 * @param path - Storage directory path
 * @returns List of files
 */
export async function listFiles(path: string) {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
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
