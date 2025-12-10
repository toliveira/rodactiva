import { useEffect, useState } from "react";
import { uploadFile } from "../../lib/storage";
import httpClient from "../../lib/http";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Upload, ExternalLink } from "lucide-react";

type Contribution = {
    date: string;
    amount: number;
};

type Sponsor = {
    id?: string;
    title: string;
    imageUrl: string;
    websiteUrl: string;
    contributions: Contribution[];
    createdAt: any; // API returns Firestore Timestamp object or string
    updatedAt: any;
};

export default function Sponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<Sponsor | null>(null);
    const [formData, setFormData] = useState<Partial<Sponsor>>({
        title: '',
        imageUrl: '',
        websiteUrl: '',
        contributions: [],
    });
    const [showDialog, setShowDialog] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Helper to calculate total contribution
    const getTotalContribution = (s: Sponsor) => {
        return s.contributions?.reduce((sum, c) => sum + (Number(c.amount) || 0), 0) || 0;
    };

    const fetchSponsors = async () => {
        setLoading(true);
        try {
            const response = await httpClient.get<Sponsor[]>('/api/sponsors');
            setSponsors(response.data);
        } catch (error) {
            console.error("Error fetching sponsors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadFile("sponsors", file);
            setFormData({ ...formData, imageUrl: url });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.websiteUrl) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            const data = {
                ...formData,
            };

            if (editing && editing.id) {
                await httpClient.put(`/api/sponsors/${editing.id}`, data);
            } else {
                await httpClient.post('/api/sponsors', data);
            }

            setShowDialog(false);
            setEditing(null);
            setFormData({
                title: '',
                imageUrl: '',
                websiteUrl: '',
                contributions: [],
            });
            fetchSponsors();
        } catch (error) {
            console.error("Error saving sponsor:", error);
            alert("Failed to save sponsor");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this sponsor?")) return;
        try {
            await httpClient.delete(`/api/sponsors/${id}`);
            fetchSponsors();
        } catch (error) {
            console.error("Error deleting sponsor:", error);
        }
    };

    const openEdit = (sponsor: Sponsor) => {
        setEditing(sponsor);
        setFormData(sponsor);
        setShowDialog(true);
    };

    const openCreate = () => {
        setEditing(null);
        setFormData({
            title: '',
            imageUrl: '',
            websiteUrl: '',
            contributions: [],
        });
        setShowDialog(true);
    };

    const addContribution = () => {
        setFormData(prev => ({
            ...prev,
            contributions: [
                ...(prev.contributions || []),
                { date: new Date().toISOString().split('T')[0], amount: 0 }
            ]
        }));
    };

    const removeContribution = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contributions: prev.contributions?.filter((_, i) => i !== index)
        }));
    };

    const updateContribution = (index: number, field: keyof Contribution, value: any) => {
        setFormData(prev => ({
            ...prev,
            contributions: prev.contributions?.map((c, i) => 
                i === index ? { ...c, [field]: value } : c
            )
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Sponsors</h2>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" /> Add Sponsor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editing ? "Edit Sponsor" : "Add Sponsor"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title / Name</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Logo Image</Label>
                                <div className="flex items-center gap-4">
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="h-16 w-16 object-contain border rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <Label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="flex items-center justify-center w-full h-10 border border-dashed rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                <Upload className="w-4 h-4 mr-2" />
                                                <span className="text-sm">{uploading ? "Uploading..." : "Upload Logo"}</span>
                                            </div>
                                            <Input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Website URL</Label>
                                <Input
                                    id="url"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>Contributions</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addContribution}>
                                        <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                    {formData.contributions?.map((contribution, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                type="date"
                                                value={contribution.date}
                                                onChange={(e) => updateContribution(index, 'date', e.target.value)}
                                                className="w-40"
                                            />
                                            <Input
                                                type="number"
                                                value={contribution.amount}
                                                onChange={(e) => updateContribution(index, 'amount', Number(e.target.value))}
                                                placeholder="Amount"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => removeContribution(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!formData.contributions || formData.contributions.length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-2">No contributions recorded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={uploading}>
                                {uploading ? "Uploading..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead className="text-right">Contribution</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : sponsors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No sponsors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sponsors.map((sponsor) => (
                                <TableRow key={sponsor.id}>
                                    <TableCell>
                                        <img
                                            src={sponsor.imageUrl}
                                            alt={sponsor.title}
                                            className="h-10 w-auto object-contain"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{sponsor.title}</TableCell>
                                    <TableCell>
                                        <a
                                            href={sponsor.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-600 hover:underline"
                                        >
                                            {sponsor.websiteUrl}
                                            <ExternalLink className="ml-1 h-3 w-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(getTotalContribution(sponsor))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(sponsor)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(sponsor.id!)}
                                            >
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
        </div>
    );
}
