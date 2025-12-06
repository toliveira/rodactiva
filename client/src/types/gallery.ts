export interface GalleryMedia {
    id: string;
    type: 'image' | 'video';
    url: string; // URL for image or YouTube link for video
    thumbnail?: string; // For video
}

export interface Gallery {
    id: string;
    name: string;
    date: string; // ISO date string
    description?: string;
    order?: number;
    media: GalleryMedia[];
    createdAt?: any;
    updatedAt?: any;
}
