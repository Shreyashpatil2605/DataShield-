import { useTheme } from "../context/ThemeContext";
import { dashboardDemoData } from "../utils/demoDashboardData";

export default function DemoDataSummary() {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl border p-6 transition-colors ${
        theme === "dark"
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          className={`text-lg font-semibold mb-2 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Detailed Statistics
        </h3>
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Comprehensive PII detection analytics
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Entity Statistics */}
        {Object.entries(dashboardDemoData.entity_statistics).map(
          ([type, stats]) => (
            <div
              key={type}
              className={`p-4 rounded-lg border ${
                theme === "dark"
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-medium mb-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {type}
              </p>
              <div className="space-y-1">
                <p className="text-xl font-bold text-blue-600">{stats.count}</p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Risk: {stats.average_risk}/100
                </p>
                <p className={`text-xs text-green-600`}>
                  ✓ {stats.masked} masked
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Risk Distribution */}
      <div className="mb-8">
        <h4
          className={`text-sm font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Risk Distribution
        </h4>
        <div className="space-y-3">
          {Object.entries(dashboardDemoData.risk_distribution).map(
            ([level, count]) => {
              const total = Object.values(
                dashboardDemoData.risk_distribution,
              ).reduce((a, b) => a + b, 0);
              const percentage = Math.round((count / total) * 100);
              const colorMap = {
                safe: "bg-green-500",
                low: "bg-yellow-500",
                medium: "bg-orange-500",
                high: "bg-red-500",
                critical: "bg-red-900",
              };

              return (
                <div key={level}>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm font-medium capitalize ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {level}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        theme === "dark" ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div
                    className={`h-2 rounded-full overflow-hidden ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`h-full ${colorMap[level]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      {/* Compliance Status */}
      <div>
        <h4
          className={`text-sm font-semibold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Compliance Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(dashboardDemoData.compliance).map(
            ([standard, score]) => (
              <div
                key={standard}
                className={`p-3 rounded-lg border text-center ${
                  theme === "dark"
                    ? "bg-gray-900/50 border-gray-700"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p
                  className={`text-xs font-medium mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {standard.replace("_", " ")}
                </p>
                <p
                  className={`text-lg font-bold ${
                    score >= 95
                      ? "text-green-600"
                      : score >= 90
                        ? "text-yellow-600"
                        : "text-orange-600"
                  }`}
                >
                  {score}%
                </p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
