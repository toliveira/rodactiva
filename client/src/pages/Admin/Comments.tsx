// src/pages/Admin/Comments.tsx
import { useEffect, useState } from "react";
import {
    collectionGroup,
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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

type Comment = {
    id?: string;
    postId: string; // needed for deletion path
    comment_author: string;
    comment_content: string;
    comment_date: Timestamp;
};

export default function Comments() {
    const PAGE_SIZE = 20;
    const [pages, setPages] = useState<Comment[][]>([]);
    const [cursors, setCursors] = useState<any[]>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch all comments across all posts (collection group query)
    const fetchPage = async (after?: any) => {
        setLoading(true);
        const q = after
            ? query(
                collectionGroup(db, "comments"),
                orderBy("comment_date", "desc"),
                startAfter(after),
                limit(PAGE_SIZE)
              )
            : query(
                collectionGroup(db, "comments"),
                orderBy("comment_date", "desc"),
                limit(PAGE_SIZE)
              );

        try {
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => {
                const dData = d.data();
                return {
                    id: d.id,
                    postId: (dData as any).postId || d.ref.parent.parent?.id,
                    ...(dData as any),
                } as Comment;
            });
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
        } catch (err) {
            console.error("Error fetching comments (check indexes):", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPage();
    }, []);

    const handleDelete = async (c: Comment) => {
        if (!window.confirm("Delete this comment?")) return;
        if (!c.postId || !c.id) return;
        await deleteDoc(doc(db, "posts", c.postId, "comments", c.id));
        setPages([]);
        setCursors([]);
        setPageIndex(0);
        fetchPage();
    };

    return (
        <div>
            <h2 className="text-2xl mb-4">Comments Moderation</h2>
            <p className="mb-4 text-sm text-gray-600">
                Showing most recent comments across all posts.
            </p>

            {loading ? (
                <p>Loading…</p>
            ) : pages[pageIndex] && pages[pageIndex].length > 0 ? (
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 text-left">Author</th>
                            <th className="p-2 text-left w-1/2">Content</th>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages[pageIndex].map((c) => (
                            <tr key={c.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-medium">{c.comment_author}</td>
                                <td className="p-2 truncate max-w-xs" title={c.comment_content}>
                                    {c.comment_content}
                                </td>
                                <td className="p-2">{c.comment_date?.toDate().toLocaleString()}</td>
                                <td className="p-2">
                                    <Button
                                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                                        onClick={() => handleDelete(c)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center text-sm text-gray-600 py-12">No comments found.</div>
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
