// src/pages/Admin/Routes.tsx
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
import { uploadFile, generateStoragePath } from "../../lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { X, Upload, Plus, Trash2 } from "lucide-react";

type GPXFile = {
    label: string;
    url: string;
};

type RouteData = {
    id?: string;
    name: string;
    description: string;
    distance: number;
    difficulty: string;
    duration: string;
    elevation: number;
    location: string;
    images: string[];
    gpxFiles: GPXFile[];
    createdAt: Timestamp;
};

export default function Routes() {
    const PAGE_SIZE = 10;
    const [pages, setPages] = useState<RouteData[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<RouteData | null>(null);
    const [newRoute, setNewRoute] = useState<Partial<RouteData>>({});
    const [showCreate, setShowCreate] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleGpxUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number, isEditing: boolean) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await handleFileUpload(file, "routes/gpx");
            
            if (isEditing && editing) {
                const files = [...(editing.gpxFiles || [])];
                files[index] = { ...files[index], url };
                setEditing({ ...editing, gpxFiles: files });
            } else if (!isEditing) {
                const files = [...(newRoute.gpxFiles || [])];
                files[index] = { ...files[index], url };
                setNewRoute({ ...newRoute, gpxFiles: files });
            }
        } catch (error) {
            console.error("Error uploading GPX:", error);
            alert("Failed to upload GPX file");
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const newImages: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await handleFileUpload(files[i], "routes/images");
                newImages.push(url);
            }

            if (isEditing && editing) {
                setEditing({ ...editing, images: [...(editing.images || []), ...newImages] });
            } else if (!isEditing) {
                setNewRoute({ ...newRoute, images: [...(newRoute.images || []), ...newImages] });
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (file: File, folder: string) => {
        const path = generateStoragePath(folder, file.name);
        return await uploadFile(path, file);
    };

    const addGpxRow = (isEditing: boolean) => {
        if (isEditing && editing) {
            setEditing({ ...editing, gpxFiles: [...(editing.gpxFiles || []), { label: "", url: "" }] });
        } else if (!isEditing) {
            setNewRoute({ ...newRoute, gpxFiles: [...(newRoute.gpxFiles || []), { label: "", url: "" }] });
        }
    };

    const removeGpxRow = (index: number, isEditing: boolean) => {
        if (isEditing && editing && editing.gpxFiles) {
            const files = [...editing.gpxFiles];
            files.splice(index, 1);
            setEditing({ ...editing, gpxFiles: files });
        } else if (!isEditing && newRoute.gpxFiles) {
            const files = [...newRoute.gpxFiles];
            files.splice(index, 1);
            setNewRoute({ ...newRoute, gpxFiles: files });
        }
    };

    const updateGpxLabel = (value: string, index: number, isEditing: boolean) => {
        if (isEditing && editing && editing.gpxFiles) {
            const files = [...editing.gpxFiles];
            files[index] = { ...files[index], label: value };
            setEditing({ ...editing, gpxFiles: files });
        } else if (!isEditing && newRoute.gpxFiles) {
            const files = [...newRoute.gpxFiles];
            files[index] = { ...files[index], label: value };
            setNewRoute({ ...newRoute, gpxFiles: files });
        }
    };

    const removeImage = (index: number, isEditing: boolean) => {
        if (isEditing && editing && editing.images) {
            const images = [...editing.images];
            images.splice(index, 1);
            setEditing({ ...editing, images });
        } else if (!isEditing && newRoute.images) {
            const images = [...newRoute.images];
            images.splice(index, 1);
            setNewRoute({ ...newRoute, images });
        }
    };


    const fetchPage = async (after?: any) => {
        setLoading(true);
        const q = after
            ? query(collection(db, "routes"), orderBy("createdAt", "desc"), startAfter(after), limit(PAGE_SIZE))
            : query(collection(db, "routes"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as RouteData));
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
        setLoading(false);
    };

    useEffect(() => {
        fetchPage();
    }, []);

    const handleCreate = async () => {
        const docRef = doc(collection(db, "routes"));
        await setDoc(docRef, {
            ...newRoute,
            createdAt: Timestamp.now(),
        } as any);
        setNewRoute({});
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    const handleUpdate = async (route: RouteData) => {
        if (!route.id) return;
        await setDoc(doc(db, "routes", route.id), { ...route } as any);
        setEditing(null);
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this route?")) return;
        await deleteDoc(doc(db, "routes", id));
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Routes Management</h2>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button>New</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Route</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="border p-2 w-full"
                                placeholder="Name"
                                value={newRoute.name || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Distance (km)"
                                type="number"
                                value={newRoute.distance || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, distance: Number(e.target.value) })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Elevation Gain (m)"
                                type="number"
                                value={newRoute.elevation || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, elevation: Number(e.target.value) })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Difficulty"
                                value={newRoute.difficulty || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, difficulty: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Duration / Est. Time"
                                value={newRoute.duration || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, duration: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Location"
                                value={newRoute.location || ""}
                                onChange={(e) => setNewRoute({ ...newRoute, location: e.target.value })}
                            />
                        </div>
                        <textarea
                            className="border p-2 w-full mt-2"
                            placeholder="Description"
                            rows={3}
                            value={newRoute.description || ""}
                            onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                        />

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">GPX Files</h3>
                            {newRoute.gpxFiles?.map((file, index) => (
                                <div key={index} className="flex gap-2 mb-2 items-center">
                                    <input
                                        className="border p-1 flex-1"
                                        placeholder="Label (e.g. 30km)"
                                        value={file.label}
                                        onChange={(e) => updateGpxLabel(e.target.value, index, false)}
                                    />
                                    {file.url ? (
                                        <span className="text-green-600 text-sm truncate w-32">Uploaded</span>
                                    ) : (
                                        <input
                                            type="file"
                                            accept=".gpx"
                                            className="w-48"
                                            onChange={(e) => handleGpxUpload(e, index, false)}
                                            disabled={uploading}
                                        />
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => removeGpxRow(index, false)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addGpxRow(false)}>
                                <Plus className="w-4 h-4 mr-1" /> Add GPX File
                            </Button>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Gallery Images</h3>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {newRoute.images?.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                                        <button
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(index, false)}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded p-4 flex flex-col items-center justify-center transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600">Click to upload images</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, false)}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={uploading}>
                                {uploading ? "Uploading..." : "Add"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* CREATE FORM */}
            

            {loading ? (
                <p>Loading…</p>
            ) : pages[pageIndex] && pages[pageIndex].length > 0 ? (
                <table className="w-full border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Distance</th>
                            <th className="p-2 text-left">Difficulty</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages[pageIndex].map((r) => (
                            <tr key={r.id} className="border-b">
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.distance} km</td>
                                <td className="p-2">{r.difficulty}</td>
                                <td className="p-2 space-x-2">
                                    <Button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setEditing(r)}>
                                        Edit
                                    </Button>
                                    <Button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => r.id && handleDelete(r.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-sm text-gray-600 py-12">No routes found. Use New to create your first route.</div>
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

            {/* EDIT MODAL */}
            {editing && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded w-[800px] max-h-[90vh] overflow-y-auto">
                        <h3 className="font-semibold mb-4 text-xl">Edit Route</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                className="border p-2 w-full"
                                placeholder="Name"
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                type="number"
                                placeholder="Distance (km)"
                                value={editing.distance}
                                onChange={(e) => setEditing({ ...editing, distance: Number(e.target.value) })}
                            />
                            <input
                                className="border p-2 w-full"
                                type="number"
                                placeholder="Elevation Gain (m)"
                                value={editing.elevation || ""}
                                onChange={(e) => setEditing({ ...editing, elevation: Number(e.target.value) })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Difficulty"
                                value={editing.difficulty}
                                onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Duration / Est. Time"
                                value={editing.duration || ""}
                                onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                            />
                            <input
                                className="border p-2 w-full"
                                placeholder="Location"
                                value={editing.location || ""}
                                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                            />
                        </div>
                        <textarea
                            className="border p-2 w-full mt-2"
                            rows={4}
                            placeholder="Description"
                            value={editing.description}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        />

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">GPX Files</h3>
                            {editing.gpxFiles?.map((file, index) => (
                                <div key={index} className="flex gap-2 mb-2 items-center">
                                    <input
                                        className="border p-1 flex-1"
                                        placeholder="Label (e.g. 30km)"
                                        value={file.label}
                                        onChange={(e) => updateGpxLabel(e.target.value, index, true)}
                                    />
                                    {file.url ? (
                                        <span className="text-green-600 text-sm truncate w-32">Uploaded</span>
                                    ) : (
                                        <input
                                            type="file"
                                            accept=".gpx"
                                            className="w-48"
                                            onChange={(e) => handleGpxUpload(e, index, true)}
                                            disabled={uploading}
                                        />
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => removeGpxRow(index, true)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addGpxRow(true)}>
                                <Plus className="w-4 h-4 mr-1" /> Add GPX File
                            </Button>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Gallery Images</h3>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {editing.images?.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img src={img} alt="" className="w-full h-24 object-cover rounded" />
                                        <button
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(index, true)}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded p-4 flex flex-col items-center justify-center transition-colors">
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600">Click to upload images</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button className="px-3 py-1" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleUpdate(editing)} disabled={uploading}>
                                {uploading ? "Uploading..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
