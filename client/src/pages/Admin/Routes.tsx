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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

type RouteData = {
    id?: string;
    name: string;
    description: string;
    distance: number;
    difficulty: string;
    duration: string;
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Route</DialogTitle>
                        </DialogHeader>
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Name"
                            value={newRoute.name || ""}
                            onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                        />
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Distance (km)"
                            type="number"
                            value={newRoute.distance || ""}
                            onChange={(e) => setNewRoute({ ...newRoute, distance: Number(e.target.value) })}
                        />
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Difficulty"
                            value={newRoute.difficulty || ""}
                            onChange={(e) => setNewRoute({ ...newRoute, difficulty: e.target.value })}
                        />
                        <textarea
                            className="border p-2 w-full mb-2"
                            placeholder="Description"
                            rows={3}
                            value={newRoute.description || ""}
                            onChange={(e) => setNewRoute({ ...newRoute, description: e.target.value })}
                        />
                        <DialogFooter>
                            <Button onClick={handleCreate}>Add</Button>
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
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-96">
                        <h3 className="font-semibold mb-2">Edit Route</h3>
                        <input
                            className="border p-1 w-full mb-2"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        />
                        <input
                            className="border p-1 w-full mb-2"
                            type="number"
                            value={editing.distance}
                            onChange={(e) => setEditing({ ...editing, distance: Number(e.target.value) })}
                        />
                        <input
                            className="border p-1 w-full mb-2"
                            value={editing.difficulty}
                            onChange={(e) => setEditing({ ...editing, difficulty: e.target.value })}
                        />
                        <textarea
                            className="border p-1 w-full mb-2"
                            rows={4}
                            value={editing.description}
                            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        />
                        <div className="flex justify-end space-x-2">
                            <button className="px-3 py-1" onClick={() => setEditing(null)}>
                                Cancel
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => handleUpdate(editing)}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
