import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import MetricCard from "./MetricCard";
import RiskMeter from "./RiskMeter";
import DropZone from "./DropZone";
import DemoDataSummary from "./DemoDataSummary";
import {
  generateDemoDashboardData,
  generateChartPoints,
} from "../utils/demoData";
import { dashboardDemoData } from "../utils/demoDashboardData";

export default function Dashboard({
  stats = null,
  onFile = null,
  loading = false,
}) {
  const { theme } = useTheme();

  // Create initial stats from demo data
  const initialStats = {
    totalPII: dashboardDemoData.summary.total_pii,
    highRisk: dashboardDemoData.summary.high_risk,
    mediumSeverity: dashboardDemoData.summary.medium_severity,
    loss: dashboardDemoData.summary.loss,
    riskScore: Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100),
  };

  // Calculate overall risk score from summary
  function calculateOverallRiskScore() {
    return Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100);
  }

  // Calculate risk level based on score
  function getRiskLevel(score) {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    if (score >= 20) return "low";
    return "safe";
  }

  const [dynamicStats, setDynamicStats] = useState(stats || initialStats);
  const [previousStats, setPreviousStats] = useState(null);
  const [chartData, setChartData] = useState(
    dashboardDemoData.risk_levels_by_day.map((day) => day.risk_score),
  );

  // Calculate trend (positive if increased, negative if decreased)
  const calculateTrend = (current, previous) => {
    if (!previous) return { positive: true, value: 0 };
    const change = ((current - previous) / previous) * 100;
    return { positive: change > 0, value: Math.round(Math.abs(change)) };
  };

  // Update dynamic data when stats prop changes
  useEffect(() => {
    if (stats) {
      setDynamicStats(stats);
    }
  }, [stats]);

  // Generate demo data updates every 4 seconds (only when no file is being analyzed)
  useEffect(() => {
    if (stats) return; // Don't update if real stats are provided

    // Start interval after 4 seconds - don't call on initial render
    const timeoutId = setTimeout(() => {
      const interval = setInterval(() => {
        setDynamicStats((prev) => {
          setPreviousStats(prev); // Store previous for trend calculation
          return generateDemoDashboardData(prev, 8);
        });

        // Update chart data with new trend point
        setChartData((prev) => {
          const newData = [...prev];
          newData.shift(); // Remove first point
          const lastValue = newData[newData.length - 1];
          const fluctuation = Math.floor(Math.random() * 20) - 10; // -10 to +10
          const newValue = Math.max(10, Math.min(90, lastValue + fluctuation));
          newData.push(newValue);
          return newData;
        });
      }, 4000); // Update every 4 seconds

      // Store interval ID so we can clear it on cleanup
      window._dashboardInterval = interval;
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
      if (window._dashboardInterval) {
        clearInterval(window._dashboardInterval);
      }
    };
  }, [stats]);

  // Use dynamic stats if no real stats provided, otherwise use real stats
  const displayStats = stats || dynamicStats;

  const IconProps = {
    className: "w-6 h-6",
    strokeWidth: 2,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h2
          className={`text-3xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Dashboard
        </h2>
        <p
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Monitor your PII detection and risk metrics
        </p>
      </div>

  {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total PII"
          value={dashboardDemoData.summary.total_pii.toLocaleString()}
          color="blue"
          icon={
            <svg
              {...IconProps}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6h6" />
            </svg>
          }
          trend={calculateTrend(dashboardDemoData.summary.total_pii, previousStats?.totalPII)}
        />
        <MetricCard
          title="High Risk"
          value={dashboardDemoData.summary.high_risk.toLocaleString()}
          color="red"
          icon={
            <svg
              {...IconProps}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              <path d="M12 16l-2-2m0 0l2-2m-2 2h4" />
            </svg>
          }
          trend={
            previousStats
              ? {
                  positive: dashboardDemoData.summary.high_risk < previousStats.highRisk,
                  value: Math.abs(
                    calculateTrend(
                      dashboardDemoData.summary.high_risk,
                      previousStats.highRisk,
                    ).value,
                  ),
                }
              : { positive: false, value: 0 }
          }
        />
        <MetricCard
          title="Medium Severity"
          value={dashboardDemoData.summary.medium_severity.toLocaleString()}
          color="amber"
          icon={
            <svg
              {...IconProps}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 2L2 20h20L12 2z" />
              <path d="M12 9v4m0 4v.01" />
            </svg>
          }
          trend={calculateTrend(
            dashboardDemoData.summary.medium_severity,
            previousStats?.mediumSeverity,
          )}
        />
        <MetricCard
          title="Loss"
          value={`$${dashboardDemoData.summary.loss.toLocaleString()}`}
          color="purple"
          icon={
            <svg
              {...IconProps}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 1v22m11-9H1" />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              />
            </svg>
          }
          trend={
            previousStats
              ? {
                  positive: dashboardDemoData.summary.loss < previousStats.loss,
                  value: Math.abs(
                    calculateTrend(dashboardDemoData.summary.loss, previousStats.loss).value,
                  ),
                }
              : { positive: false, value: 0 }
          }
        />
      </div>

      {/* Privacy Risk Meter */}
      <RiskMeter
        risk={{
          score: Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100),
          level: getRiskLevel(Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100)),
          message: `Overall Privacy Risk: ${Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100)}%`,
        }}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PII Breakdown */}
        <div
          className={`rounded-lg border p-6 transition-colors ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            PII Breakdown
          </h3>
          <div className="flex items-center justify-center h-64">
            <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative flex items-center justify-center">
              <div
                className={`w-40 h-40 rounded-full flex items-center justify-center ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <span
                  className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  100%
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(dashboardDemoData.pii_breakdown).map(
              ([type, percentage], idx) => {
                const colors = [
                  "bg-blue-500",
                  "bg-purple-500",
                  "bg-pink-500",
                  "bg-cyan-500",
                  "bg-orange-500",
                  "bg-green-500",
                ];
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span
                      className={`flex items-center gap-2 ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}
                      ></span>
                      {type}
                    </span>
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Risk Levels Over Time */}
        <div
          className={`rounded-lg border p-6 transition-colors ${
            theme === "dark"
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Risk Levels Over Time
          </h3>
          <svg
            className="w-full h-64"
            viewBox="0 0 400 200"
            preserveAspectRatio="none"
          >
            {/* Grid */}
            <line
              x1="0"
              y1="50"
              x2="400"
              y2="50"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="100"
              x2="400"
              y2="100"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="150"
              x2="400"
              y2="150"
              stroke={theme === "dark" ? "#374151" : "#e5e7eb"}
              strokeWidth="1"
            />

            {/* Line Chart - Dynamic */}
            {chartData.length > 0 && (
              <>
                <polyline
                  points={chartData
                    .map((value, i) => {
                      const x = (i / (chartData.length - 1)) * 400;
                      const y = 200 - value * 2;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Area under line */}
                <polygon
                  points={`${chartData
                    .map((value, i) => {
                      const x = (i / (chartData.length - 1)) * 400;
                      const y = 200 - value * 2;
                      return `${x},${y}`;
                    })
                    .join(" ")} 400,200 0,200`}
                  fill="#3b82f6"
                  opacity="0.1"
                />
              </>
            )}
          </svg>
          <div className="mt-4 flex justify-between text-xs">
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Mon
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Tue
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Wed
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Thu
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Fri
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Sat
            </span>
            <span
              className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
            >
              Sun
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <DemoDataSummary />

      {/* Upload Section */}
      {onFile && <DropZone onFile={onFile} loading={loading} />}
    </div>
  );
}
