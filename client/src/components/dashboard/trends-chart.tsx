import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { formatDate, formatNumber, formatCTR, formatPosition } from "@/lib/utils";

// Register Chart.js components
Chart.register(...registerables);

interface TrendsChartProps {
  data: any[];
  metric: "clicks" | "impressions" | "ctr" | "position";
}

export default function TrendsChart({ data, metric }: TrendsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Colors for different metrics
  const colors = {
    clicks: {
      border: "rgba(79, 70, 229, 1)",
      background: "rgba(79, 70, 229, 0.1)",
    },
    impressions: {
      border: "rgba(59, 130, 246, 1)",
      background: "rgba(59, 130, 246, 0.1)",
    },
    ctr: {
      border: "rgba(16, 185, 129, 1)",
      background: "rgba(16, 185, 129, 0.1)",
    },
    position: {
      border: "rgba(245, 158, 11, 1)",
      background: "rgba(245, 158, 11, 0.1)",
    },
  };

  // Format value based on metric type
  const formatValue = (value: number, metricType: string) => {
    switch (metricType) {
      case "clicks":
      case "impressions":
        return formatNumber(value);
      case "ctr":
        return formatCTR(value);
      case "position":
        return formatPosition(value);
      default:
        return value.toString();
    }
  };

  // Setup chart
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare chart data
    const labels = data.map((row) => {
      const dateStr = row.keys?.[0] || "";
      // Format date from YYYY-MM-DD to more readable format if needed
      return dateStr;
    });

    const values = data.map((row) => row[metric]);

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: metric.charAt(0).toUpperCase() + metric.slice(1),
            data: values,
            backgroundColor: colors[metric].background,
            borderColor: colors[metric].border,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: colors[metric].border,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(17, 24, 39, 0.9)",
            titleColor: "#fff",
            bodyColor: "#fff",
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 13,
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                return `${label}: ${formatValue(value, metric)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: metric !== "position",
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
            ticks: {
              color: "rgba(107, 114, 128, 1)",
              callback: (value) => formatValue(value as number, metric),
            },
            // For position, inverted is better (lower is better)
            reverse: metric === "position",
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "rgba(107, 114, 128, 1)",
            },
          },
        },
      },
    });

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, metric]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
}
