import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useSearchConsole() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get website list from Search Console
  const websites = useQuery({
    queryKey: ["/api/search-console/sites"],
  });

  // Connect to Google Search Console
  const connectToSearchConsole = async () => {
    setIsConnecting(true);
    try {
      const res = await apiRequest("GET", "/api/search-console/auth-url");
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to generate auth URL:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Search Console. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Analyze search data with Anthropic
  const analyzeData = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/analyze/search-data", { data });
      return response.json();
    },
    onSuccess: (data) => {
      // Save insights to storage if needed
      if (data.insights && data.insights.length > 0) {
        saveInsights(data.insights);
      }
      return data;
    },
    onError: (error) => {
      console.error("Failed to analyze data:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze search data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save insights to storage
  const saveInsights = async (insights: any[]) => {
    if (!insights || !insights.length) return;
    
    try {
      // In a real implementation, you'd include the website ID
      await apiRequest("POST", "/api/insights", { 
        websiteId: 1, // This would be the actual website ID
        insights 
      });
      
      // Invalidate insights queries
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
    } catch (error) {
      console.error("Failed to save insights:", error);
    }
  };

  // Get query recommendations
  const getQueryRecommendations = useMutation({
    mutationFn: async ({ query, data }: { query: string; data: any }) => {
      const response = await apiRequest("POST", "/api/analyze/query-recommendations", { query, data });
      return response.json();
    },
    onError: (error) => {
      console.error("Failed to get query recommendations:", error);
      toast({
        title: "Recommendations Failed",
        description: "Could not generate recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    websites: websites.data?.sites || [],
    isLoadingWebsites: websites.isLoading,
    isConnecting,
    connectToSearchConsole,
    analyzeData,
    getQueryRecommendations,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-console/sites"] });
    },
  };
}
