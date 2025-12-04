// src/pages/Admin/Posts.tsx
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

type Post = {
    id?: string;
    title: string;
    content: string;
    createdAt: Timestamp;
};

export default function Posts() {
    const PAGE_SIZE = 10;
    const [pages, setPages] = useState<Post[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<Post | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const fetchPage = async (after?: any) => {
        setLoading(true);
        const q = after
            ? query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(after), limit(PAGE_SIZE))
            : query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
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
        if (!newTitle.trim()) return;
        const docRef = doc(collection(db, "posts"));
        await setDoc(docRef, {
            title: newTitle,
            content: newContent,
            createdAt: Timestamp.now(),
        });
        setNewTitle("");
        setNewContent("");
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    const handleUpdate = async (post: Post) => {
        if (!post.id) return;
        await setDoc(doc(db, "posts", post.id), {
            title: post.title,
            content: post.content,
            createdAt: post.createdAt,
        });
        setEditing(null);
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this post?")) return;
        await deleteDoc(doc(db, "posts", id));
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">Posts Management</h2>
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogTrigger asChild>
                        <Button>New</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Post</DialogTitle>
                        </DialogHeader>
                        <input
                            className="border p-2 w-full mb-2"
                            placeholder="Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            className="border p-2 w-full mb-2"
                            placeholder="Content"
                            rows={4}
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                        />
                        <DialogFooter>
                            <Button onClick={handleCreate}>Add</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* CREATE FORM */}
            

            {/* LIST */}
            {loading ? (
                <p>Loading…</p>
            ) : pages[pageIndex] && pages[pageIndex].length > 0 ? (
                <table className="w-full border-collapse">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 text-left">Title</th>
                            <th className="p-2 text-left">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages[pageIndex].map((p) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-2">{p.title}</td>
                                <td className="p-2">{p.createdAt?.toDate().toLocaleDateString()}</td>
                                <td className="p-2 space-x-2">
                                    <Button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => setEditing(p)}>
                                        Edit
                                    </Button>
                                    <Button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => p.id && handleDelete(p.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-sm text-gray-600 py-12">No posts found. Use New to create your first post.</div>
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
                        <h3 className="font-semibold mb-2">Edit Post</h3>
                        <input
                            className="border p-1 w-full mb-2"
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        />
                        <textarea
                            className="border p-1 w-full mb-2"
                            rows={4}
                            value={editing.content}
                            onChange={(e) => setEditing({ ...editing, content: e.target.value })}
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
