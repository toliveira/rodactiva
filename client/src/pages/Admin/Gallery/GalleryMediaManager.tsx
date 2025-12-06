import { useState, ChangeEvent } from 'react';
import { Gallery, GalleryMedia } from '@/types/gallery';
import { updateGallery, uploadGalleryImage } from '@/api/gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Image as ImageIcon, Video, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

interface GalleryMediaManagerProps {
    gallery: Gallery;
    onUpdate: () => void;
}

export default function GalleryMediaManager({ gallery, onUpdate }: GalleryMediaManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [videoUrlInput, setVideoUrlInput] = useState('');
    const [mediaItems, setMediaItems] = useState<GalleryMedia[]>(gallery.media || []);

    const handleSaveMedia = async (newMedia: GalleryMedia[]) => {
        try {
            await updateGallery(gallery.id, { media: newMedia });
            setMediaItems(newMedia);
            onUpdate();
            toast.success('Media updated');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update media');
        }
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                const url = await uploadGalleryImage(e.target.files[0]);
                const newItem: GalleryMedia = {
                    id: nanoid(),
                    type: 'image',
                    url: url
                };
                const updatedMedia = [...mediaItems, newItem];
                await handleSaveMedia(updatedMedia);
            } catch (error) {
                console.error(error);
                toast.error('Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleAddVideo = async () => {
        if (!videoUrlInput) return;

        // Extract YouTube ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = videoUrlInput.match(regExp);

        if (match && match[2].length === 11) {
            const videoId = match[2];
            const newItem: GalleryMedia = {
                id: nanoid(),
                type: 'video',
                url: videoUrlInput,
                thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`
            };
            const updatedMedia = [...mediaItems, newItem];
            await handleSaveMedia(updatedMedia);
            setVideoUrlInput('');
        } else {
            toast.error('Invalid YouTube URL');
        }
    };

    const handleRemove = async (index: number) => {
        if (confirm('Remove this item?')) {
            const updatedMedia = [...mediaItems];
            updatedMedia.splice(index, 1);
            await handleSaveMedia(updatedMedia);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-muted/50 p-4 rounded-lg">
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <div className="relative">
                        <input
                            type="file"
                            id="manager-image-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        <Button
                            type="button"
                            variant="default"
                            disabled={uploading}
                            onClick={() => document.getElementById('manager-image-upload')?.click()}
                        >
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                            Add Image
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Paste YouTube URL here..."
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        className="flex-1 md:w-64"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddVideo} disabled={!videoUrlInput}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mediaItems.map((item, index) => (
                    <Card key={item.id} className="relative group overflow-hidden border-0 shadow-sm">
                        <CardContent className="p-0 aspect-square relative">
                            <img
                                src={item.type === 'video' ? item.thumbnail : item.url}
                                alt="Media"
                                className="w-full h-full object-cover rounded-md"
                            />
                            {item.type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                    <Video className="w-8 h-8 text-white" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                onClick={() => handleRemove(index)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {mediaItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        No media items yet. Add some images or videos above.
                    </div>
                )}
            </div>
        </div>
    );
}
