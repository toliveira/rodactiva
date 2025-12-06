import { useState, useEffect } from 'react';
import { Gallery } from '@/types/gallery';
import { getGalleries, deleteGallery } from '@/api/gallery';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import GalleryForm from './GalleryForm';
import GalleryMediaManager from './GalleryMediaManager';
import { format } from 'date-fns';

export default function GalleriesList() {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
    const [editingGallery, setEditingGallery] = useState<Gallery | undefined>(undefined);
    const [managingGallery, setManagingGallery] = useState<Gallery | undefined>(undefined);

    const fetchGalleries = async () => {
        setLoading(true);
        try {
            const data = await getGalleries();
            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setGalleries(sorted);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch galleries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this gallery?')) {
            try {
                await deleteGallery(id);
                toast.success('Gallery deleted');
                fetchGalleries();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete gallery');
            }
        }
    };

    const handleEdit = (gallery: Gallery) => {
        setEditingGallery(gallery);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setEditingGallery(undefined);
        setIsFormOpen(true);
    };

    const handleManageMedia = (gallery: Gallery) => {
        setManagingGallery(gallery);
        setIsMediaManagerOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchGalleries();
    };

    const handleMediaUpdate = () => {
        fetchGalleries();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Galleries</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Gallery
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Media Count</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : galleries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No galleries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            galleries.map((gallery) => (
                                <TableRow key={gallery.id}>
                                    <TableCell>{format(new Date(gallery.date), 'PP')}</TableCell>
                                    <TableCell className="font-medium">{gallery.name}</TableCell>
                                    <TableCell>{gallery.media?.length || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleManageMedia(gallery)}>
                                                <ImageIcon className="h-4 w-4 mr-2" />
                                                Manage Media
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(gallery)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(gallery.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Gallery Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingGallery ? 'Edit Gallery' : 'Create Gallery'}</DialogTitle>
                    </DialogHeader>
                    <GalleryForm
                        initialData={editingGallery}
                        onSuccess={handleFormSuccess}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Media Manager Dialog */}
            <Dialog open={isMediaManagerOpen} onOpenChange={setIsMediaManagerOpen}>
                <DialogContent className="sm:max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Media: {managingGallery?.name}</DialogTitle>
                    </DialogHeader>
                    {managingGallery && (
                        <GalleryMediaManager
                            gallery={managingGallery}
                            onUpdate={handleMediaUpdate}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
