import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/loading-spinner";

export default function Settings() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [dataSummaryFrequency, setDataSummaryFrequency] = useState("weekly");
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);

  // Get user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const handleSavePreferences = () => {
    // In a real implementation, this would save to the backend
    toast({
      title: "Preferences Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleDisconnectGSC = () => {
    // In a real implementation, this would disconnect from Google Search Console
    toast({
      title: "Account Disconnected",
      description: "Your Google Search Console account has been disconnected.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="medium" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  defaultValue={userData?.user?.username || ""}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={userData?.user?.email || ""}
                  placeholder="Your email address"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Dark Mode</Label>
                <Switch id="theme" />
              </div>
              
              <Button onClick={handleSavePreferences}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" className="mb-1 block">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Data Summary Frequency</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="daily" 
                      value="daily" 
                      name="frequency"
                      checked={dataSummaryFrequency === "daily"}
                      onChange={() => setDataSummaryFrequency("daily")}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="daily" className="cursor-pointer">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="weekly" 
                      value="weekly" 
                      name="frequency"
                      checked={dataSummaryFrequency === "weekly"}
                      onChange={() => setDataSummaryFrequency("weekly")}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="weekly" className="cursor-pointer">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="monthly" 
                      value="monthly" 
                      name="frequency"
                      checked={dataSummaryFrequency === "monthly"}
                      onChange={() => setDataSummaryFrequency("monthly")}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage your connected accounts and services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">Google Search Console</h3>
                  <p className="text-sm text-gray-500 mt-1">Connected to fetch search analytics data</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Connected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleDisconnectGSC}>
                    Disconnect
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium">Anthropic AI</h3>
                  <p className="text-sm text-gray-500 mt-1">Used for data analysis and insights</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-insights" className="mr-2">Enable AI Insights</Label>
                    <Switch 
                      id="ai-insights" 
                      checked={aiInsightsEnabled}
                      onCheckedChange={setAiInsightsEnabled}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSavePreferences}>Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced options and data management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period</Label>
                <select 
                  id="data-retention" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Historical data will be retained for this period
                </p>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500">
                  These actions cannot be undone. Be careful.
                </p>
                
                <div className="pt-4 space-y-4">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    Clear All Analytics Data
                  </Button>
                  
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
