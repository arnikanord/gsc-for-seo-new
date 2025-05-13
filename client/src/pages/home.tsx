import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/loading-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/user");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setLocation("/dashboard");
        }
      } catch (error) {
        console.error("Not authenticated");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  // Handle connect to Search Console
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest("GET", "/api/search-console/auth-url");
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to generate auth URL", error);
      toast({
        title: "Authentication Required",
        description: "Please login or register first before connecting to Search Console.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await apiRequest("POST", "/api/auth/login", loginForm);
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Login Successful",
          description: "You've been logged in successfully",
        });
        setUser(data.user);
        setLocation("/dashboard");
      } else {
        const error = await res.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await apiRequest("POST", "/api/auth/register", registerForm);
      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully",
        });
        setUser(data);
        setLocation("/dashboard");
      } else {
        const error = await res.json();
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
          Search Console Insights
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect to Google Search Console and get AI-powered insights and summaries of your website's search performance
        </p>
        
        {showLogin ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Log In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Enter your username" 
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="small" /> : "Log In"}
                </Button>
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setShowLogin(false);
                      setShowRegister(false);
                    }}
                  >
                    Back to Home
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : showRegister ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Create an Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input 
                    id="reg-username" 
                    type="text" 
                    placeholder="Choose a username" 
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="Create a password" 
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="small" /> : "Register"}
                </Button>
                <div className="text-center mt-4">
                  <Button 
                    variant="link" 
                    onClick={() => {
                      setShowLogin(false);
                      setShowRegister(false);
                    }}
                  >
                    Back to Home
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button 
                onClick={() => setShowLogin(true)} 
                variant="outline" 
                size="lg"
                className="font-medium"
              >
                Log In
              </Button>
              <Button 
                onClick={() => setShowRegister(true)} 
                size="lg"
                className="font-medium"
              >
                Create Account
              </Button>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleConnect} 
                disabled={isLoading} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isLoading ? <LoadingSpinner size="small" /> : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M17 17h-3a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3"></path>
                      <path d="M8 5c-.2 0-1 0-2 .2"></path>
                      <path d="M6 8c0 .2 0 1-.2 2"></path>
                      <path d="M8.1 19c.2 0 2 0 2-.2"></path>
                      <path d="M11.9 19c-.2 0-2.1 0-2.1-.2"></path>
                      <path d="M13.9 5.2c.2 0 2-.2 2 0"></path>
                      <path d="M16.1 8c0-.2 0-1 .2-2"></path>
                      <path d="M16.1 16c0 .2 0 1-.2 2"></path>
                    </svg>
                    Connect to Search Console
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        
        {/* Search analytics dashboard image */}
        {!showLogin && !showRegister && (
          <div className="mt-12">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600" 
              alt="Search analytics dashboard" 
              className="rounded-lg shadow-xl w-full max-w-3xl mx-auto mt-8"
            />
            <p className="text-sm text-gray-500 mt-4">Get comprehensive insights about your website's search performance</p>
          </div>
        )}
      </div>
    </div>
  );
}