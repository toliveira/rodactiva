import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    doc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

type Member = {
    id?: string;
    fullName: string;
    birthPlace: string;
    nationality: string;
    birthDate: string;
    gender: string;
    ccNumber: string;
    nif: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    volunteer: boolean;
    photoUrl?: string;
    status: string;
    createdAt: Timestamp;
    // Legacy fields support
    name?: string;
    role?: string;
    bio?: string;
    joinedAt?: Timestamp;
};

import httpClient from "@/lib/http";

export default function Members() {
    const PAGE_SIZE = 10;
    const [pages, setPages] = useState<Member[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [editing, setEditing] = useState<Member | null>(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        birthPlace: '',
        nationality: 'Portuguesa',
        birthDate: '',
        gender: 'masculino',
        ccNumber: '',
        nif: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        city: '',
        volunteer: false,
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPage = async (after?: any) => {
        setLoading(true);
        try {
            // Try to order by createdAt, might need fallback or index
            const q = after
                ? query(collection(db, "members"), orderBy("createdAt", "desc"), startAfter(after), limit(PAGE_SIZE))
                : query(collection(db, "members"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
            
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Member));
            setPages((prev) => {
                const next = [...prev];
                if (after) {
                    next.push(data);
                    return next;
                }
                return [data];
            });
            setCursors((prev) => {
                const nextCursor = snap.docs[snap.docs.length - 1] || null;
                if (after) return [...prev, nextCursor];
                return [nextCursor];
            });
            setPageIndex((prev) => (after ? prev + 1 : 0));
            setHasMore(snap.size === PAGE_SIZE);
        } catch (error) {
            console.error("Error fetching members:", error);
            // If createdAt fails (e.g. missing index or old data), try joinedAt or no order
            if (pages.length === 0) {
                 // Fallback logic could go here, but for now we assume the DB is consistent or will be
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPage();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        setSubmitting(true);
        try {
            const form = new FormData();
            Object.entries(formData).forEach(([k, v]) => form.append(k, String(v)));
            if (photo) form.append('photo', photo);

            await httpClient.post('/api/members', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setShowCreate(false);
            // Reset form
            setFormData({
                fullName: '',
                birthPlace: '',
                nationality: 'Portuguesa',
                birthDate: '',
                gender: 'masculino',
                ccNumber: '',
                nif: '',
                email: '',
                phone: '',
                address: '',
                postalCode: '',
                city: '',
                volunteer: false,
            });
            setPhoto(null);
            
            // Refresh list
            setPages([]);
            setCursors([]);
            setPageIndex(0);
            fetchPage();
        } catch (error) {
            console.error("Error creating member:", error);
            alert("Failed to create member. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this member?")) return;
        await deleteDoc(doc(db, "members", id));
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Members Management</h2>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button>Add New Member</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nome completo</Label>
                                        <Input
                                            id="fullName"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="birthPlace">Naturalidade</Label>
                                        <Input
                                            id="birthPlace"
                                            name="birthPlace"
                                            value={formData.birthPlace}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nationality">Nacionalidade</Label>
                                        <Select
                                            value={formData.nationality}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Portuguesa">Portuguesa</SelectItem>
                                                <SelectItem value="Espanhola">Espanhola</SelectItem>
                                                <SelectItem value="Outra">Outra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                                        <Input
                                            id="birthDate"
                                            name="birthDate"
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Género</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="masculino">Masculino</SelectItem>
                                                <SelectItem value="feminino">Feminino</SelectItem>
                                                <SelectItem value="outro">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ccNumber">Cartão de Cidadão</Label>
                                        <Input
                                            id="ccNumber"
                                            name="ccNumber"
                                            value={formData.ccNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nif">NIF</Label>
                                        <Input
                                            id="nif"
                                            name="nif"
                                            value={formData.nif}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telemóvel</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Morada</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Código Postal</Label>
                                        <Input
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Localidade</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photo">Foto</Label>
                                    <Input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPhoto(e.target.files[0]);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="volunteer"
                                        checked={formData.volunteer}
                                        onCheckedChange={(checked) => 
                                            setFormData(prev => ({ ...prev, volunteer: checked === true }))
                                        }
                                    />
                                    <Label htmlFor="volunteer">Quero ser voluntário</Label>
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Member'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : pages[pageIndex] && pages[pageIndex].length > 0 ? (
                <table className="w-full border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages[pageIndex].map((m) => (
                            <tr key={m.id} className="border-b">
                                <td className="p-2">{m.fullName || m.name}</td>
                                <td className="p-2">{m.email}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        m.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                        m.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {m.status || 'Unknown'}
                                    </span>
                                </td>
                                <td className="p-2 space-x-2">
                                    {/* Edit not implemented for new schema yet, disabling or keeping for legacy */}
                                    <Button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setEditing(m)} disabled>
                                        Edit
                                    </Button>
                                    <Button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => m.id && handleDelete(m.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-sm text-gray-600 py-12">No members found. Use "Add New Member" to create one.</div>
            )}

            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pageIndex > 0) setPageIndex(pageIndex - 1);
                            }}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="px-3 py-1 text-sm">Page {pageIndex + 1}</span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={async (e) => {
                                e.preventDefault();
                                if (hasMore) await fetchPage(cursors[cursors.length - 1]);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
