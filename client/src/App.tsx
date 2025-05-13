import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Dashboard from "@/pages/dashboard";
import Analytics from "@/pages/analytics";
import Keywords from "@/pages/keywords";
import Performance from "@/pages/performance";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Layout components
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useState, useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

// Main App component
function App() {
  const [location] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/user");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Not authenticated", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Determine if we should show the sidebar/header
  const showLayout = location !== "/" && !isLoading;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex">
          {showLayout && <Sidebar />}
          <div className="flex-1 flex flex-col">
            {showLayout && (
              <Header 
                selectedWebsite={selectedWebsite} 
                setSelectedWebsite={setSelectedWebsite} 
              />
            )}
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/dashboard">
                  <Dashboard selectedWebsite={selectedWebsite} />
                </Route>
                <Route path="/analytics">
                  <Analytics selectedWebsite={selectedWebsite} />
                </Route>
                <Route path="/keywords">
                  <Keywords selectedWebsite={selectedWebsite} />
                </Route>
                <Route path="/performance">
                  <Performance selectedWebsite={selectedWebsite} />
                </Route>
                <Route path="/settings" component={Settings} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
