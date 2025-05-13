import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/loading-spinner";

interface Insight {
  id?: number;
  type: "positive" | "opportunity" | "info";
  title: string;
  description: string;
}

interface InsightsCardProps {
  insights: Insight[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function InsightsCard({ insights, isLoading, onRefresh }: InsightsCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Icon components for different insight types
  const InsightIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "positive":
        return (
          <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "opportunity":
        return (
          <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "info":
        return (
          <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Background color classes based on insight type
  const getInsightClasses = (type: string) => {
    switch (type) {
      case "positive":
        return {
          bg: "bg-green-50 border-green-200",
          title: "text-green-800",
          desc: "text-green-700",
        };
      case "opportunity":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          title: "text-yellow-800",
          desc: "text-yellow-700",
        };
      case "info":
        return {
          bg: "bg-blue-50 border-blue-200",
          title: "text-blue-800",
          desc: "text-blue-700",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          title: "text-gray-800",
          desc: "text-gray-700",
        };
    }
  };

  return (
    <Card className="mb-8">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
        <Button onClick={onRefresh} disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="small" /> : "Refresh"}
        </Button>
      </div>
      <CardContent className="py-5">
        <div className="text-sm text-gray-500 mb-4">
          Generated on {formatDate(new Date())}
        </div>
        <div className="space-y-4">
          {!insights.length && !isLoading && (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p className="text-gray-600">
                No insights generated yet. Click 'Refresh' to analyze your data.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="medium" />
            </div>
          )}

          {insights.map((insight, index) => {
            const classes = getInsightClasses(insight.type);
            
            return (
              <div key={insight.id || index} className={`p-4 border rounded-md ${classes.bg}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <InsightIcon type={insight.type} />
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className={`text-sm font-medium ${classes.title}`}>
                      {insight.title}
                    </h4>
                    <div className={`mt-1 text-sm ${classes.desc}`}>
                      {insight.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
