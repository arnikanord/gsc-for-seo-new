import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get date range options
export function getDateRanges() {
  const today = new Date();
  
  // Last 7 days
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  // Last 28 days
  const twentyEightDaysAgo = new Date(today);
  twentyEightDaysAgo.setDate(today.getDate() - 28);
  
  // Last 90 days
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);
  
  return {
    last7Days: {
      startDate: formatDate(sevenDaysAgo),
      endDate: formatDate(today),
      label: 'Last 7 days'
    },
    last28Days: {
      startDate: formatDate(twentyEightDaysAgo),
      endDate: formatDate(today),
      label: 'Last 28 days'
    },
    last90Days: {
      startDate: formatDate(ninetyDaysAgo),
      endDate: formatDate(today),
      label: 'Last 90 days'
    }
  };
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate percentage change between two values
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Format CTR as percentage
export function formatCTR(ctr: number): string {
  return (ctr * 100).toFixed(2) + '%';
}

// Format position to 1 decimal place
export function formatPosition(position: number): string {
  return position.toFixed(1);
}

// Get appropriate text color based on trend direction
export function getTrendColor(change: number, inverse = false): string {
  if (inverse) {
    return change <= 0 ? 'text-green-600' : 'text-red-600';
  }
  return change >= 0 ? 'text-green-600' : 'text-red-600';
}

// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch (error) {
    return url;
  }
}
