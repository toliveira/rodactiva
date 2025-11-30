import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function PrivateArea() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login successful");
        } catch (error: any) {
            toast.error("Login failed: " + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out");
        } catch (error: any) {
            toast.error("Logout failed: " + error.message);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Private Area Login</CardTitle>
                        <CardDescription>Please sign in to access member-only content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">Sign In</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Private Area</h1>
                <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Member Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Access internal documents and reports.</p>
                        <Button className="mt-4" variant="secondary">View Documents</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Event Registration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Manage your event registrations.</p>
                        <Button className="mt-4" variant="secondary">My Events</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Update your personal information.</p>
                        <Button className="mt-4" variant="secondary">Edit Profile</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
