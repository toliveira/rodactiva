// src/pages/Admin/Dashboard.tsx
import { Route, Switch } from "wouter";
import AdminLayout from "../../components/AdminLayout";
import Posts from "./Posts";
import Events from "./Events";
import Routes from "./Routes";
import Members from "./Members";
import Comments from "./Comments";
import Users from "./Users";

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Switch>
                <Route path="/admin/dashboard" component={() => <h1 className="text-2xl">Welcome, Admin!</h1>} />
                <Route path="/admin/posts" component={Posts} />
                <Route path="/admin/events" component={Events} />
                <Route path="/admin/routes" component={Routes} />
                <Route path="/admin/members" component={Members} />
                <Route path="/admin/comments" component={Comments} />
                <Route path="/admin/users" component={Users} />
                {/* fallback */}
                <Route component={() => <h2>Select a section from the menu.</h2>} />
            </Switch>
        </AdminLayout>
    );
}
