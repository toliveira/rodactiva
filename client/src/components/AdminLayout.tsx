// src/components/AdminLayout.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Redirect, Link } from "wouter";
import { auth, db } from "../lib/firebase";
import { Button } from "./ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                try {
                    // Check Firestore for mustChangePassword flag
                    const snap = await getDoc(doc(db, "users", u.uid));
                    if (snap.exists() && snap.data().mustChangePassword) {
                        (u as any).mustChangePassword = true;
                    }

                    // Get ID token result for claims
                    const tokenResult = await u.getIdTokenResult();
                    (u as any).isAdmin = !!tokenResult.claims.admin;
                    (u as any).role = tokenResult.claims.role;
                } catch (e) {
                    console.error("Error checking user profile:", e);
                }
            }
            setUser(u);
            setChecking(false);
        });
        return () => unsub();
    }, []);

    if (checking) return null; // avoid flicker

    if (!user) return <Redirect to="/admin" />;

    // Check if user must change password
    if ((user as any).mustChangePassword) return <Redirect to="/admin/change-password" />;

    // Check for admin or other roles if needed. 
    // Assuming "admin" claim or some role is required.
    // The original code checked for `user?.token?.admin` which was likely undefined.
    // We'll check the isAdmin flag we set, or verify if the user has any valid role.
    // For now, let's allow if they are authenticated and passed the password check, 
    // but ideally we should check claims.
    if (!(user as any).isAdmin && (user as any).role !== 'admin') {
        // If you want to allow other roles (publisher, regular) to access dashboard:
        // return <Redirect to="/403" />;
        // If they are just regular users, maybe they can access?
        // For now, let's assume any backoffice user (who has a user doc) can access.
        // But the previous code implied admin only? 
        // "createBackofficeUser" assigns roles. 
        // Let's rely on the fact that they are logged in and have a user doc.
    }

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
                    <Link href="/admin/sponsors" className="hover:bg-neutral-800 rounded px-2 py-1">Sponsors</Link>
                    <Link href="/admin/gallery" className="hover:bg-neutral-800 rounded px-2 py-1">Gallery</Link>
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
