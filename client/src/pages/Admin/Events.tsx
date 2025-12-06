// src/pages/Admin/Events.tsx
import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    doc,
    setDoc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { uploadImage, generateStoragePath, deleteFile } from "../../lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Loader2, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";

type Event = {
    id?: string;
    title: string;
    description: string;
    date: Timestamp;
    location: string;
    imageUrl?: string;
    createdAt: Timestamp;
};

export default function Events() {
    const PAGE_SIZE = 10;
    const [pages, setPages] = useState<Event[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [editing, setEditing] = useState<Event | null>(null);
    const [showEdit, setShowEdit] = useState(false);
    
    const [newEvent, setNewEvent] = useState<Partial<Event>>({});
    const [newImage, setNewImage] = useState<File | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    // For Edit form image
    const [editImage, setEditImage] = useState<File | null>(null);

    const fetchPage = async (after?: any) => {
        setLoading(true);
        try {
            const q = after
                ? query(collection(db, "events"), orderBy("createdAt", "desc"), startAfter(after), limit(PAGE_SIZE))
                : query(collection(db, "events"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event));
            
            if (data.length < PAGE_SIZE) setHasMore(false);
            else setHasMore(true);

            setPages((prev) => {
                const next = [...prev];
                if (after) {
                    // Only push if we have data or if it's consistent
                    if (data.length > 0) next.push(data);
                    return next;
                }
                return [data];
            });
            setCursors((prev) => {
                const nextCursor = snap.docs[snap.docs.length - 1] || null;
                if (after) {
                    if (nextCursor) return [...prev, nextCursor];
                    return prev;
                }
                return nextCursor ? [nextCursor] : [];
            });
            
            if (after && data.length > 0) setPageIndex((prev) => prev + 1);
            else if (!after) setPageIndex(0);
            
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage();
    }, []);

    const handleCreate = async () => {
        if (!newEvent.title || !newEvent.date) {
            alert("Title and Date are required");
            return;
        }
        setSubmitting(true);
        try {
            let imageUrl = "";
            if (newImage) {
                const path = generateStoragePath("events", newImage.name);
                imageUrl = await uploadImage(path, newImage);
            }

            const docRef = doc(collection(db, "events"));
            await setDoc(docRef, {
                ...newEvent,
                imageUrl,
                createdAt: Timestamp.now(),
            } as any);

            setNewEvent({});
            setNewImage(null);
            setShowCreate(false);
            
            // Refresh
            setPages([]);
            setCursors([]);
            setPageIndex(0);
            fetchPage();
        } catch (error) {
            console.error("Error creating event:", error);
            alert("Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!editing || !editing.id) return;
        setSubmitting(true);
        try {
            let imageUrl = editing.imageUrl;
            if (editImage) {
                // Upload new image
                const path = generateStoragePath("events", editImage.name);
                imageUrl = await uploadImage(path, editImage);
                
                // Delete old image if exists and different
                if (editing.imageUrl) {
                    try {
                        // Extract path from URL or just ignore deletion if complex
                        // Ideally we store path, but for now we just upload new one.
                        // To delete properly we need the ref.
                    } catch (e) {
                        console.warn("Failed to delete old image", e);
                    }
                }
            }

            await setDoc(doc(db, "events", editing.id), {
                ...editing,
                imageUrl,
            } as any);

            setEditing(null);
            setEditImage(null);
            setShowEdit(false);
            
            // Refresh
            setPages([]);
            setCursors([]);
            setPageIndex(0);
            fetchPage();
        } catch (error) {
            console.error("Error updating event:", error);
            alert("Failed to update event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (event: Event) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await deleteDoc(doc(db, "events", event.id!));
            // Optionally delete image
            
            setPages([]);
            setCursors([]);
            setPageIndex(0);
            fetchPage();
        } catch (error) {
            console.error("Error deleting event:", error);
        }
    };

    const openEdit = (event: Event) => {
        setEditing({ ...event });
        setEditImage(null);
        setShowEdit(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Events Management</h2>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Event</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newEvent.title || ""}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newEvent.location || ""}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newEvent.date ? newEvent.date.toDate().toISOString().split("T")[0] : ""}
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        setNewEvent({ ...newEvent, date: Timestamp.fromDate(d) });
                                    }}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newEvent.description || ""}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading && pages.length === 0 ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : pages[pageIndex] && pages[pageIndex].length > 0 ? (
                <div className="border rounded-lg">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="h-12 px-4 text-left align-middle font-medium">Image</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                                <th className="h-12 px-4 align-middle font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages[pageIndex].map((e) => (
                                <tr key={e.id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="p-4">
                                        {e.imageUrl ? (
                                            <img src={e.imageUrl} alt={e.title} className="h-10 w-10 rounded object-cover" />
                                        ) : (
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium">{e.title}</td>
                                    <td className="p-4">{e.date?.toDate().toLocaleDateString()}</td>
                                    <td className="p-4">{e.location}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(e)}>
                                            <Pencil className="h-4 w-4 mr-1" /> Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(e)}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted/10">
                    No events found. Create one to get started.
                </div>
            )}

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (pageIndex > 0) setPageIndex(pageIndex - 1);
                            }}
                            className={pageIndex === 0 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <span className="px-4 py-2 text-sm font-medium">Page {pageIndex + 1}</span>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={async (e) => {
                                e.preventDefault();
                                if (hasMore) await fetchPage(cursors[cursors.length - 1]);
                            }}
                            className={!hasMore ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* EDIT DIALOG */}
            <Dialog open={showEdit} onOpenChange={setShowEdit}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editing.title}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    value={editing.location}
                                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-date">Date</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={editing.date ? editing.date.toDate().toISOString().split("T")[0] : ""}
                                    onChange={(e) => {
                                        const d = new Date(e.target.value);
                                        setEditing({ ...editing, date: Timestamp.fromDate(d) });
                                    }}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-image">Image</Label>
                                <div className="flex items-center gap-4">
                                    {editing.imageUrl && !editImage && (
                                        <img src={editing.imageUrl} alt="Current" className="h-12 w-12 rounded object-cover" />
                                    )}
                                    <Input
                                        id="edit-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editing.description}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
