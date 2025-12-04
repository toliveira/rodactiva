// src/components/AdminLayout.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Redirect, Link } from "wouter";
import { auth } from "../lib/firebase";
import { Button } from "./ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setChecking(false);
        });
        return () => unsub();
    }, []);

    if (checking) return null; // avoid flicker

    if (!user) return <Redirect to="/admin/login" />;

    // custom claim "admin" is attached in the token (see grant‑admin script)
    if (!user?.token?.admin) return <Redirect to="/403" />;

    return (
        <div className="flex min-h-screen bg-neutral-100 text-neutral-900">
            <aside className="w-64 bg-neutral-900 text-neutral-100 border-r border-neutral-800 p-4">
                <h2 className="text-xl font-semibold mb-4">Admin</h2>
                <nav className="space-y-2 flex flex-col">
                    <Link href="/admin/dashboard" className="hover:bg-neutral-800 rounded px-2 py-1">Dashboard</Link>
                    <Link href="/admin/posts" className="hover:bg-neutral-800 rounded px-2 py-1">Posts</Link>
                    <Link href="/admin/events" className="hover:bg-neutral-800 rounded px-2 py-1">Events</Link>
                    <Link href="/admin/routes" className="hover:bg-neutral-800 rounded px-2 py-1">Routes</Link>
                    <Link href="/admin/members" className="hover:bg-neutral-800 rounded px-2 py-1">Members</Link>
                    <Link href="/admin/comments" className="hover:bg-neutral-800 rounded px-2 py-1">Comments</Link>
                    <Link href="/admin/users" className="hover:bg-neutral-800 rounded px-2 py-1">Users</Link>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Admin Panel</h1>
                    <Button variant="outline" onClick={() => signOut(auth)}>Sign Out</Button>
                </div>
                <div className="bg-white border rounded-lg shadow-sm p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
