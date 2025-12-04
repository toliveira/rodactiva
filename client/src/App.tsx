import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Activities from "./pages/Activities";
import Routes from "./pages/Routes";
import Gallery from "./pages/Gallery";
import Members from "./pages/Members";
import Contact from "./pages/Contact";
import PrivateArea from "./pages/PrivateArea";
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminLogin from "./pages/Admin/Login";

function SiteRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/about"} component={About} />
          <Route path={"/activities"} component={Activities} />
          <Route path={"/routes"} component={Routes} />
          <Route path={"/gallery"} component={Gallery} />
          <Route path={"/members"} component={Members} />
          <Route path={"/contact"} component={Contact} />
          <Route path={"/private"} component={PrivateArea} />
          <Route path={"/403"} component={() => <h1 className="text-2xl text-red-600">Forbidden</h1>} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Switch>
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/*" component={AdminDashboard} />
            <Route component={SiteRouter} />
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
