import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatNumber, formatCTR, formatPosition, getTrendColor, getDateRanges } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import SummaryCard from "@/components/dashboard/summary-card";
import TrendsChart from "@/components/dashboard/trends-chart";
import InsightsCard from "@/components/dashboard/insights-card";
import DataTable from "@/components/dashboard/data-table";
import LoadingSpinner from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardProps {
  selectedWebsite: string | null;
}

export default function Dashboard({ selectedWebsite }: DashboardProps) {
  const [, setLocation] = useLocation();
  const [dateRange, setDateRange] = useState(getDateRanges().last28Days);
  const [chartMetric, setChartMetric] = useState<"clicks" | "impressions" | "ctr" | "position">("clicks");
  const [isAnalyzingData, setIsAnalyzingData] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Redirect to home if no website is selected
  useEffect(() => {
    if (!selectedWebsite) {
      setLocation("/");
    }
  }, [selectedWebsite, setLocation]);

  // Fetch search analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["/api/search-console/analytics", selectedWebsite, dateRange.startDate, dateRange.endDate],
    enabled: !!selectedWebsite,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch performance by date for chart
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["/api/search-console/performance-by-date", selectedWebsite, dateRange.startDate, dateRange.endDate],
    enabled: !!selectedWebsite,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch top pages
  const { data: topPagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ["/api/search-console/performance-by-page", selectedWebsite, dateRange.startDate, dateRange.endDate],
    enabled: !!selectedWebsite,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate summary stats
  const summary = {
    clicks: analyticsData?.rows?.reduce((sum: number, row: any) => sum + row.clicks, 0) || 0,
    impressions: analyticsData?.rows?.reduce((sum: number, row: any) => sum + row.impressions, 0) || 0,
    ctr: analyticsData?.rows?.length 
      ? (analyticsData.rows.reduce((sum: number, row: any) => sum + row.clicks, 0) / 
         analyticsData.rows.reduce((sum: number, row: any) => sum + row.impressions, 0)) * 100 
      : 0,
    position: analyticsData?.rows?.length
      ? analyticsData.rows.reduce((sum: number, row: any) => sum + (row.position * row.impressions), 0) /
        analyticsData.rows.reduce((sum: number, row: any) => sum + row.impressions, 0)
      : 0,
    // For demo, we'll generate random changes
    clicksChange: Math.round((Math.random() * 20) - 5),
    impressionsChange: Math.round((Math.random() * 15) - 3),
    ctrChange: Math.round((Math.random() * 8) - 2),
    positionChange: Math.round((Math.random() * 2) - 1),
  };

  // Handle analyze data with Anthropic
  const handleAnalyzeData = async () => {
    if (!analyticsData) return;
    
    setIsAnalyzingData(true);
    try {
      const response = await apiRequest("POST", "/api/analyze/search-data", { data: analyticsData });
      const result = await response.json();
      
      if (result.insights) {
        setAiInsights(result.insights);
      }
    } catch (error) {
      console.error("Failed to analyze data:", error);
    } finally {
      setIsAnalyzingData(false);
    }
  };

  // Loading state
  const isLoading = isLoadingAnalytics || isLoadingPerformance || isLoadingPages;

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600">Loading search analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Clicks"
            value={formatNumber(summary.clicks)}
            change={summary.clicksChange}
            icon={
              <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            }
            iconBgColor="bg-primary-100"
          />
          
          <SummaryCard
            title="Impressions"
            value={formatNumber(summary.impressions)}
            change={summary.impressionsChange}
            icon={
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            iconBgColor="bg-blue-100"
          />
          
          <SummaryCard
            title="CTR"
            value={`${formatCTR(summary.ctr / 100)}`}
            change={summary.ctrChange}
            icon={
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            iconBgColor="bg-green-100"
          />
          
          <SummaryCard
            title="Avg. Position"
            value={formatPosition(summary.position)}
            change={summary.positionChange}
            icon={
              <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            }
            iconBgColor="bg-yellow-100"
            inverse={true}
          />
        </div>
      </div>
      
      {/* AI Insights Card */}
      <InsightsCard 
        insights={aiInsights}
        isLoading={isAnalyzingData}
        onRefresh={handleAnalyzeData}
      />
      
      {/* Performance Trends */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <Button 
                  variant={chartMetric === 'clicks' ? 'secondary' : 'ghost'} 
                  onClick={() => setChartMetric('clicks')}
                  size="sm"
                >
                  Clicks
                </Button>
                <Button 
                  variant={chartMetric === 'impressions' ? 'secondary' : 'ghost'} 
                  onClick={() => setChartMetric('impressions')}
                  size="sm"
                >
                  Impressions
                </Button>
                <Button 
                  variant={chartMetric === 'ctr' ? 'secondary' : 'ghost'} 
                  onClick={() => setChartMetric('ctr')}
                  size="sm"
                >
                  CTR
                </Button>
                <Button 
                  variant={chartMetric === 'position' ? 'secondary' : 'ghost'} 
                  onClick={() => setChartMetric('position')}
                  size="sm"
                >
                  Position
                </Button>
              </div>
              
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={dateRange.label}
                onChange={(e) => {
                  const ranges = getDateRanges();
                  const label = e.target.value;
                  if (label === ranges.last7Days.label) {
                    setDateRange(ranges.last7Days);
                  } else if (label === ranges.last28Days.label) {
                    setDateRange(ranges.last28Days);
                  } else if (label === ranges.last90Days.label) {
                    setDateRange(ranges.last90Days);
                  }
                }}
              >
                <option value={getDateRanges().last7Days.label}>Last 7 days</option>
                <option value={getDateRanges().last28Days.label}>Last 28 days</option>
                <option value={getDateRanges().last90Days.label}>Last 90 days</option>
              </select>
            </div>
            
            <TrendsChart 
              data={performanceData ? performanceData.rows : []} 
              metric={chartMetric}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Top Queries and Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Queries */}
        <DataTable
          title="Top Queries"
          data={analyticsData ? analyticsData.rows.slice(0, 5) : []}
          columns={[
            { header: "Query", accessor: "keys.0" },
            { header: "Clicks", accessor: "clicks", align: "right" },
            { header: "Impressions", accessor: "impressions", align: "right" },
            { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
            { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
          ]}
        />
        
        {/* Top Pages */}
        <DataTable
          title="Top Pages"
          data={topPagesData ? topPagesData.rows.slice(0, 5) : []}
          columns={[
            { header: "Page", accessor: "keys.0" },
            { header: "Clicks", accessor: "clicks", align: "right" },
            { header: "Impressions", accessor: "impressions", align: "right" },
            { header: "CTR", accessor: "ctr", format: (value) => formatCTR(value), align: "right" },
            { header: "Position", accessor: "position", format: (value) => formatPosition(value), align: "right" },
          ]}
        />
      </div>
    </div>
  );
}
