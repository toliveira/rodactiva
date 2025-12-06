import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Gallery } from '@/types/gallery';
import { createGallery, updateGallery } from '@/api/gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const gallerySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional(),
});

type GalleryFormValues = z.infer<typeof gallerySchema>;

interface GalleryFormProps {
    initialData?: Gallery;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function GalleryForm({ initialData, onSuccess, onCancel }: GalleryFormProps) {
    const form = useForm<GalleryFormValues>({
        resolver: zodResolver(gallerySchema),
        defaultValues: initialData || {
            name: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
        }
    });

    const onSubmit = async (values: GalleryFormValues) => {
        try {
            if (initialData) {
                await updateGallery(initialData.id, values);
                toast.success('Gallery updated successfully');
            } else {
                await createGallery({ ...values, media: [] });
                toast.success('Gallery created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save gallery');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Gallery
                    </Button>
                </div>
            </form>
        </Form>
    );
}
