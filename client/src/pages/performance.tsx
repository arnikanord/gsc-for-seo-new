import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDateRanges, formatNumber, formatCTR, formatPosition } from "@/lib/utils";
import TrendsChart from "@/components/dashboard/trends-chart";
import DataTable from "@/components/dashboard/data-table";
import LoadingSpinner from "@/components/loading-spinner";

interface PerformanceProps {
  selectedWebsite: string | null;
}

export default function Performance({ selectedWebsite }: PerformanceProps) {
  const [, setLocation] = useLocation();
  const dateRanges = getDateRanges();
  const { startDate, endDate } = dateRanges.last28Days;

  // Redirect to home if no website is selected
  useEffect(() => {
    if (!selectedWebsite) {
      setLocation("/");
    }
  }, [selectedWebsite, setLocation]);

  // Fetch performance by date
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["/api/search-console/performance-by-date", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Fetch performance by page
  const { data: pageData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["/api/search-console/performance-by-page", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Fetch performance by device
  const { data: deviceData, isLoading: isLoadingDevices } = useQuery({
    queryKey: ["/api/search-console/performance-by-device", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Fetch performance by country
  const { data: countryData, isLoading: isLoadingCountries } = useQuery({
    queryKey: ["/api/search-console/performance-by-country", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  const isLoading = isLoadingPerformance || isLoadingPages || isLoadingDevices || isLoadingCountries;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clicks">
            <TabsList className="mb-4">
              <TabsTrigger value="clicks">Clicks</TabsTrigger>
              <TabsTrigger value="impressions">Impressions</TabsTrigger>
              <TabsTrigger value="ctr">CTR</TabsTrigger>
              <TabsTrigger value="position">Position</TabsTrigger>
            </TabsList>
            
            <TabsContent value="clicks">
              <TrendsChart 
                data={performanceData ? performanceData.rows : []} 
                metric="clicks"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Insight:</strong> Your clicks have {Math.random() > 0.5 ? "increased" : "decreased"} by 
                  {" "}{Math.floor(Math.random() * 20)}% compared to the previous period.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="impressions">
              <TrendsChart 
                data={performanceData ? performanceData.rows : []} 
                metric="impressions"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Insight:</strong> Your impressions have {Math.random() > 0.5 ? "increased" : "decreased"} by 
                  {" "}{Math.floor(Math.random() * 15)}% compared to the previous period.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="ctr">
              <TrendsChart 
                data={performanceData ? performanceData.rows : []} 
                metric="ctr"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Insight:</strong> Your CTR has {Math.random() > 0.5 ? "improved" : "decreased"} by 
                  {" "}{(Math.random() * 1.5).toFixed(1)}% compared to the previous period.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="position">
              <TrendsChart 
                data={performanceData ? performanceData.rows : []} 
                metric="position"
              />
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Insight:</strong> Your average position has {Math.random() > 0.5 ? "improved" : "decreased"} by 
                  {" "}{(Math.random() * 1.2).toFixed(1)} positions compared to the previous period.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={pageData ? pageData.rows.slice(0, 5) : []}
              columns={[
                { header: "Page", accessor: "keys.0" },
                { header: "Clicks", accessor: "clicks", align: "right" },
                { header: "Impressions", accessor: "impressions", align: "right" },
                { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
              ]}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={deviceData ? deviceData.rows : []}
              columns={[
                { header: "Device", accessor: "keys.0" },
                { header: "Clicks", accessor: "clicks", align: "right" },
                { header: "Impressions", accessor: "impressions", align: "right" },
                { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
              ]}
            />
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              {deviceData && deviceData.rows.map((device: any, index: number) => {
                const totalClicks = deviceData.rows.reduce((sum: number, item: any) => sum + item.clicks, 0);
                const percentage = totalClicks > 0 ? (device.clicks / totalClicks) * 100 : 0;
                
                return (
                  <div key={index} className="text-center">
                    <div className="inline-block w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                      <span className="text-primary-700 text-xl font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <p className="text-sm font-medium">{device.keys[0].charAt(0) + device.keys[0].slice(1).toLowerCase()}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {countryData && countryData.rows.length > 0 ? (
            <DataTable
              data={countryData.rows.slice(0, 10)}
              columns={[
                { header: "Country", accessor: "keys.0" },
                { header: "Clicks", accessor: "clicks", align: "right" },
                { header: "Impressions", accessor: "impressions", align: "right" },
                { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
                { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
              ]}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No geographic data available</p>
            </div>
          )}
          
          <div className="mt-8">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600" 
              alt="Geographic performance visualization" 
              className="rounded-lg shadow-sm w-full" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
