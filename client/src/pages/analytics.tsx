import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDateRanges, formatNumber, formatCTR, formatPosition } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-spinner";

interface AnalyticsProps {
  selectedWebsite: string | null;
}

export default function Analytics({ selectedWebsite }: AnalyticsProps) {
  const [, setLocation] = useLocation();
  const dateRanges = getDateRanges();
  const { startDate, endDate } = dateRanges.last28Days;

  // Redirect to home if no website is selected
  useEffect(() => {
    if (!selectedWebsite) {
      setLocation("/");
    }
  }, [selectedWebsite, setLocation]);

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

  const isLoading = isLoadingDevices || isLoadingCountries;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h2>
          
          {/* Data visualization image placeholder */}
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600" 
            alt="Data visualization elements" 
            className="rounded-lg shadow mb-6 w-full" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Range</h3>
                <div className="mt-1 text-base font-semibold">Last 28 Days</div>
              </div>
              <div className="mt-4">
                <Button variant="link" className="px-0 h-auto">
                  <span className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                    Change
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Filters</h3>
                <div className="mt-1 text-base font-semibold">None Applied</div>
              </div>
              <div className="mt-4">
                <Button variant="link" className="px-0 h-auto">
                  <span className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                    Add Filter
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Comparison</h3>
                <div className="mt-1 text-base font-semibold">vs. Previous Period</div>
              </div>
              <div className="mt-4">
                <Button variant="link" className="px-0 h-auto">
                  <span className="flex items-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                    Change
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Organic Sessions</p>
                      <p className="mt-1 text-2xl font-semibold">24,589</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      +12.3%
                    </Badge>
                  </div>
                  <div className="mt-4 h-10 w-full">
                    <div className="bg-green-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{width: "65%"}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Bounce Rate</p>
                      <p className="mt-1 text-2xl font-semibold">42.8%</p>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                      +3.1%
                    </Badge>
                  </div>
                  <div className="mt-4 h-10 w-full">
                    <div className="bg-red-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{width: "42.8%"}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Session Duration</p>
                      <p className="mt-1 text-2xl font-semibold">3m 42s</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                      +0.8%
                    </Badge>
                  </div>
                  <div className="mt-4 h-10 w-full">
                    <div className="bg-green-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{width: "58%"}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pages per Session</p>
                      <p className="mt-1 text-2xl font-semibold">2.4</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      -0.2%
                    </Badge>
                  </div>
                  <div className="mt-4 h-10 w-full">
                    <div className="bg-yellow-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full" style={{width: "48%"}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Search Performance by Device</CardTitle>
        </CardHeader>
        <CardContent>
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600" 
            alt="Analytics data visualization dashboard" 
            className="rounded-lg shadow mb-6 w-full" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deviceData && deviceData.rows.map((device: any, index: number) => {
              const deviceName = device.keys[0];
              const colors = {
                DESKTOP: { bg: "bg-blue-50", border: "border-gray-200", text: "text-blue-800" },
                MOBILE: { bg: "bg-green-50", border: "border-gray-200", text: "text-green-800" },
                TABLET: { bg: "bg-purple-50", border: "border-gray-200", text: "text-purple-800" },
              };
              
              // Default color if device type is not in our mapping
              const color = colors[deviceName] || { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800" };
              
              return (
                <div key={index} className={`rounded-lg overflow-hidden border ${color.border}`}>
                  <div className={`${color.bg} px-4 py-3 border-b border-gray-200`}>
                    <h3 className={`text-sm font-medium ${color.text}`}>
                      {deviceName.charAt(0).toUpperCase() + deviceName.slice(1).toLowerCase()}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Clicks</p>
                        <p className="text-lg font-medium">{formatNumber(device.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Impressions</p>
                        <p className="text-lg font-medium">{formatNumber(device.impressions)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="text-lg font-medium">{formatCTR(device.ctr)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Position</p>
                        <p className="text-lg font-medium">{formatPosition(device.position)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
