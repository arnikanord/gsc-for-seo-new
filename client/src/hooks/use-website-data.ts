import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDateRanges } from "@/lib/utils";

export function useWebsiteData(selectedWebsite: string | null, dateRange?: any) {
  const queryClient = useQueryClient();
  const ranges = getDateRanges();
  
  // Use provided date range or default to last 28 days
  const { startDate, endDate } = dateRange || ranges.last28Days;

  // Get analytics data
  const analytics = useQuery({
    queryKey: ["/api/search-console/analytics", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Get performance by date
  const performance = useQuery({
    queryKey: ["/api/search-console/performance-by-date", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Get page data
  const pages = useQuery({
    queryKey: ["/api/search-console/performance-by-page", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Get device data
  const devices = useQuery({
    queryKey: ["/api/search-console/performance-by-device", selectedWebsite, startDate, endDate],
    enabled: !!selectedWebsite,
  });

  // Calculate summary metrics
  const calculateSummary = () => {
    if (!analytics.data?.rows?.length) {
      return {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        clicksChange: 0,
        impressionsChange: 0,
        ctrChange: 0,
        positionChange: 0,
      };
    }

    const rows = analytics.data.rows;
    
    // Calculate totals
    const totalClicks = rows.reduce((sum: number, row: any) => sum + row.clicks, 0);
    const totalImpressions = rows.reduce((sum: number, row: any) => sum + row.impressions, 0);
    const avgCtr = (totalClicks / totalImpressions) * 100;
    
    // Calculate weighted average position (weighted by impressions)
    const avgPosition = rows.reduce((sum: number, row: any) => sum + (row.position * row.impressions), 0) / totalImpressions;
    
    // For now, generate random changes for demonstration
    // In a real app, you'd compare with previous period
    return {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: avgCtr,
      position: avgPosition,
      clicksChange: Math.round((Math.random() * 20) - 5),
      impressionsChange: Math.round((Math.random() * 15) - 3),
      ctrChange: Math.round((Math.random() * 8) - 2),
      positionChange: Math.round((Math.random() * 2) - 1),
    };
  };

  return {
    analytics,
    performance,
    pages,
    devices,
    summary: calculateSummary(),
    isLoading: analytics.isLoading || performance.isLoading || pages.isLoading || devices.isLoading,
    isError: analytics.isError || performance.isError || pages.isError || devices.isError,
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-console/analytics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search-console/performance-by-date"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search-console/performance-by-page"] });
      queryClient.invalidateQueries({ queryKey: ["/api/search-console/performance-by-device"] });
    },
  };
}
