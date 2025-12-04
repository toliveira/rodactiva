// src/pages/Admin/Members.tsx
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

type Member = {
    id?: string;
    name: string;
    role: string;
    bio: string;
    imageUrl?: string;
    joinedAt: Timestamp;
};

export default function Members() {
    const PAGE_SIZE = 10;
    const [pages, setPages] = useState<Member[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<Member | null>(null);
    const [newMember, setNewMember] = useState<Partial<Member>>({});
    const [showCreate, setShowCreate] = useState(false);

    const fetchPage = async (after?: any) => {
        setLoading(true);
        const q = after
            ? query(collection(db, "members"), orderBy("joinedAt", "desc"), startAfter(after), limit(PAGE_SIZE))
            : query(collection(db, "members"), orderBy("joinedAt", "desc"), limit(PAGE_SIZE));
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
        setLoading(false);
    };

    useEffect(() => {
        fetchPage();
    }, []);

    const handleCreate = async () => {
        const docRef = doc(collection(db, "members"));
        await setDoc(docRef, {
            ...newMember,
            joinedAt: Timestamp.now(),
        } as any);
        setNewMember({});
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    const handleUpdate = async (member: Member) => {
        if (!member.id) return;
        await setDoc(doc(db, "members", member.id), { ...member } as any);
        setEditing(null);
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
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
                        <Button>New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
                        </DialogHeader>
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Name"
                            value={newMember.name || ""}
                            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        />
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Role"
                            value={newMember.role || ""}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        />
                        <textarea
                            className="border p-2 w-full mb-2"
                            placeholder="Bio"
                            rows={3}
                            value={newMember.bio || ""}
                            onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
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
                            <th className="p-2 text-left">Role</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages[pageIndex].map((m) => (
                            <tr key={m.id} className="border-b">
                                <td className="p-2">{m.name}</td>
                                <td className="p-2">{m.role}</td>
                                <td className="p-2 space-x-2">
                                    <Button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setEditing(m)}>
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
                <div className="text-center text-sm text-gray-600 py-12">No members found. Use New to add a member.</div>
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
                        <h3 className="font-semibold mb-2">Edit Member</h3>
                        <input
                            className="border p-1 w-full mb-2"
                            value={editing.name}
                            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        />
                        <input
                            className="border p-1 w-full mb-2"
                            value={editing.role}
                            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                        />
                        <textarea
                            className="border p-1 w-full mb-2"
                            rows={4}
                            value={editing.bio}
                            onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
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
