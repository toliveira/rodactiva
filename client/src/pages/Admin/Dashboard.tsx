// src/pages/Admin/Dashboard.tsx
import { Route, Switch } from "wouter";
import AdminLayout from "../../components/AdminLayout";
import Posts from "./Posts";
import Events from "./Events";
import Routes from "./Routes";
import Members from "./Members";
import Comments from "./Comments";
import Users from "./Users";
import GalleriesList from "./Gallery";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

function DashboardHome() {
    const [postsData, setPostsData] = useState<any[]>([]);
    const [eventsData, setEventsData] = useState<{ upcoming: number; past: number }>({ upcoming: 0, past: 0 });
    const [routesData, setRoutesData] = useState<any[]>([]);
    const [commentsData, setCommentsData] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const postsSnap = await getDocs(collection(db, "posts"));
            const posts = postsSnap.docs.map(d => d.data() as any);
            const byMonth: Record<string, number> = {};
            posts.forEach(p => {
                const t: Timestamp | undefined = (p.createdAt as any) || (p.post_date as any);
                const date = t ? (t as Timestamp).toDate() : new Date();
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                byMonth[key] = (byMonth[key] || 0) + 1;
            });
            const months = Object.keys(byMonth).sort();
            setPostsData(months.map(m => ({ month: m, count: byMonth[m] })));

            const eventsSnap = await getDocs(collection(db, "events"));
            const events = eventsSnap.docs.map(d => d.data() as any);
            const now = new Date();
            let upcoming = 0;
            let past = 0;
            events.forEach(e => {
                const t: Timestamp | undefined = e.date as any;
                const dt = t ? (t as Timestamp).toDate() : now;
                if (dt >= now) upcoming++; else past++;
            });
            setEventsData({ upcoming, past });

            const routesSnap = await getDocs(collection(db, "routes"));
            const routes = routesSnap.docs.map(d => d.data() as any);
            const diff: Record<string, number> = { easy: 0, medium: 0, hard: 0, other: 0 };
            routes.forEach(r => {
                const d = (r.difficulty || "").toString().toLowerCase();
                if (d.includes("easy") || d.includes("fácil")) diff.easy++;
                else if (d.includes("medium") || d.includes("médio")) diff.medium++;
                else if (d.includes("hard") || d.includes("difícil")) diff.hard++;
                else diff.other++;
            });
            setRoutesData([
                { name: "Easy", value: diff.easy },
                { name: "Medium", value: diff.medium },
                { name: "Hard", value: diff.hard },
                { name: "Other", value: diff.other },
            ]);

            const commentsSnap = await getDocs(collectionGroup(db, "comments"));
            const comments = commentsSnap.docs.map(d => d.data() as any);
            const days: Record<string, number> = {};
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                days[key] = 0;
            }
            comments.forEach(c => {
                const t: Timestamp | undefined = (c.comment_date as any);
                const dt = t ? (t as Timestamp).toDate() : today;
                const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
                if (key in days) days[key]++;
            });
            const series = Object.keys(days).sort().map(k => ({ day: k, count: days[k] }));
            setCommentsData(series);
        };
        load();
    }, []);

    const pieColors = useMemo(() => ["#22c55e", "#ef4444"], []);
    const barColors = useMemo(() => ["#10b981", "#f59e0b", "#ef4444", "#64748b"], []);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Posts by Month</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ posts: { label: "Posts", color: "#2563eb" } }}>
                        <AreaChart data={postsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#93c5fd" />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Events Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ upcoming: { label: "Upcoming", color: "#22c55e" }, past: { label: "Past", color: "#ef4444" } }}>
                        <PieChart>
                            <Pie data={[{ name: "Upcoming", value: eventsData.upcoming }, { name: "Past", value: eventsData.past }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                                {[0, 1].map(i => (
                                    <Cell key={i} fill={pieColors[i]} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Routes Difficulty</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ easy: { label: "Easy", color: barColors[0] }, medium: { label: "Medium", color: barColors[1] }, hard: { label: "Hard", color: barColors[2] }, other: { label: "Other", color: barColors[3] } }}>
                        <BarChart data={routesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value">
                                {routesData.map((_, i) => (
                                    <Cell key={i} fill={barColors[i] || barColors[3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Comments (7 days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{ comments: { label: "Comments", color: "#7c3aed" } }}>
                        <LineChart data={commentsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="count" stroke="#7c3aed" />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Switch>
                <Route path="/admin/dashboard" component={DashboardHome} />
                <Route path="/admin/posts" component={Posts} />
                <Route path="/admin/events" component={Events} />
                <Route path="/admin/routes" component={Routes} />
                <Route path="/admin/members" component={Members} />
                <Route path="/admin/comments" component={Comments} />
                <Route path="/admin/users" component={Users} />
                <Route path="/admin/gallery" component={GalleriesList} />
                {/* fallback */}
                <Route component={() => <h2>Select a section from the menu.</h2>} />
            </Switch>
        </AdminLayout>
    );
}
