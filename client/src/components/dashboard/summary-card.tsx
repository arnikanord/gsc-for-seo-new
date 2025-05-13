import { cn, getTrendColor } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
  inverse?: boolean;
}

export default function SummaryCard({
  title,
  value,
  change,
  icon,
  iconBgColor,
  inverse = false,
}: SummaryCardProps) {
  const trendIcon = change >= 0 ? (
    <svg className="h-4 w-4 self-center" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <svg className="h-4 w-4 self-center" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const trendColor = getTrendColor(change, inverse);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                <div className={cn("ml-2 flex items-baseline text-sm font-semibold", trendColor)}>
                  {trendIcon}
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
