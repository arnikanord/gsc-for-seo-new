import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDateRanges, formatNumber, formatCTR, formatPosition } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import LoadingSpinner from "@/components/loading-spinner";
import DataTable from "@/components/dashboard/data-table";

interface KeywordsProps {
  selectedWebsite: string | null;
}

export default function Keywords({ selectedWebsite }: KeywordsProps) {
  const [, setLocation] = useLocation();
  const dateRanges = getDateRanges();
  const { startDate, endDate } = dateRanges.last28Days;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const queryClient = useQueryClient();

  // Redirect to home if no website is selected
  useEffect(() => {
    if (!selectedWebsite) {
      setLocation("/");
    }
  }, [selectedWebsite, setLocation]);

  // Fetch search analytics data with query dimension
  const { data: keywordsData, isLoading: isLoadingKeywords } = useQuery({
    queryKey: ["/api/search-console/analytics", selectedWebsite, startDate, endDate, "query"],
    enabled: !!selectedWebsite,
  });

  // Get specific recommendations for a keyword
  const getRecommendations = async (keyword: string) => {
    if (!keywordsData) return;
    
    setIsLoadingRecommendations(true);
    setSelectedKeyword(keyword);
    
    try {
      // Find the keyword data
      const keywordData = keywordsData.rows.find((row: any) => row.keys[0] === keyword);
      
      if (keywordData) {
        const response = await apiRequest("POST", "/api/analyze/query-recommendations", {
          query: keyword,
          data: keywordData
        });
        
        const result = await response.json();
        setRecommendations(result.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Filter keywords based on search term
  const filteredKeywords = keywordsData?.rows?.filter((row: any) => 
    row.keys[0].toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Loading state
  if (isLoadingKeywords) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading keywords data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold mb-2">Keywords</h1>
          <p className="text-gray-600">
            Analyze and optimize your search keywords
          </p>
        </div>
        
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Keywords</TabsTrigger>
          <TabsTrigger value="top">Top Performing</TabsTrigger>
          <TabsTrigger value="low">Low Performing</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredKeywords.slice(0, 10).map((row: any, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.keys[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatNumber(row.clicks)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatNumber(row.impressions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCTR(row.ctr)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatPosition(row.position)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => getRecommendations(row.keys[0])}
                          >
                            Analyze
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          {selectedKeyword && (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Recommendations for: <Badge variant="outline">{selectedKeyword}</Badge></span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="py-8 flex justify-center">
                    <LoadingSpinner size="medium" />
                  </div>
                ) : recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="p-3 bg-blue-50 rounded-md text-blue-900">
                        <div className="flex">
                          <span className="mr-2">•</span>
                          <p>{rec}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 py-4">Select a keyword to get AI-powered recommendations.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={keywordsData?.rows
                  ?.sort((a: any, b: any) => b.clicks - a.clicks)
                  .slice(0, 10) || []}
                columns={[
                  { header: "Keyword", accessor: "keys.0" },
                  { header: "Clicks", accessor: "clicks", align: "right" },
                  { header: "Impressions", accessor: "impressions", align: "right" },
                  { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                  { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low">
          <Card>
            <CardHeader>
              <CardTitle>Low Performing Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={keywordsData?.rows
                  ?.filter((row: any) => row.impressions > 10) // Only consider keywords with some impressions
                  ?.sort((a: any, b: any) => a.ctr - b.ctr) // Sort by lowest CTR
                  .slice(0, 10) || []}
                columns={[
                  { header: "Keyword", accessor: "keys.0" },
                  { header: "Clicks", accessor: "clicks", align: "right" },
                  { header: "Impressions", accessor: "impressions", align: "right" },
                  { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                  { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={keywordsData?.rows
                  ?.filter((row: any) => row.position > 10 && row.position < 20 && row.impressions > 20)
                  ?.sort((a: any, b: any) => a.position - b.position)
                  .slice(0, 10) || []}
                columns={[
                  { header: "Keyword", accessor: "keys.0" },
                  { header: "Clicks", accessor: "clicks", align: "right" },
                  { header: "Impressions", accessor: "impressions", align: "right" },
                  { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                  { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
                ]}
              />
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Opportunity Insight
                </h3>
                <p className="text-sm text-yellow-700">
                  These keywords are ranking on page 2 of search results and have decent impressions. 
                  Improving their content could move them to page 1, significantly increasing traffic.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
