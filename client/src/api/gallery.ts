import httpClient from '@/lib/http';
import { Gallery } from '@/types/gallery';

export const getGalleries = async (): Promise<Gallery[]> => {
    const response = await httpClient.get('/api/gallery');
    return response.data;
};

export const createGallery = async (gallery: Omit<Gallery, 'id'>): Promise<Gallery> => {
    const response = await httpClient.post('/api/gallery', gallery);
    return response.data;
};

export const updateGallery = async (id: string, gallery: Partial<Gallery>): Promise<Gallery> => {
    const response = await httpClient.put(`/api/gallery/${id}`, gallery);
    return response.data;
};

export const deleteGallery = async (id: string): Promise<void> => {
    await httpClient.delete(`/api/gallery/${id}`);
};

export const uploadGalleryImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await httpClient.post('/api/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
};
