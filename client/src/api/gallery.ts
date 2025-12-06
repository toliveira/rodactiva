import axios from 'axios';
import { Gallery } from '@/types/gallery';
import { auth } from '@/lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeader = async () => {
    const token = await auth.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
};

export const getGalleries = async (): Promise<Gallery[]> => {
    const response = await axios.get(`${API_URL}/api/gallery`);
    return response.data;
};

export const createGallery = async (gallery: Omit<Gallery, 'id'>): Promise<Gallery> => {
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_URL}/api/gallery`, gallery, { headers });
    return response.data;
};

export const updateGallery = async (id: string, gallery: Partial<Gallery>): Promise<Gallery> => {
    const headers = await getAuthHeader();
    const response = await axios.put(`${API_URL}/api/gallery/${id}`, gallery, { headers });
    return response.data;
};

export const deleteGallery = async (id: string): Promise<void> => {
    const headers = await getAuthHeader();
    await axios.delete(`${API_URL}/api/gallery/${id}`, { headers });
};

export const uploadGalleryImage = async (file: File): Promise<string> => {
    const headers = await getAuthHeader();
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_URL}/api/gallery/upload`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
};
