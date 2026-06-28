import { useTheme } from "../context/ThemeContext";

export default function RiskBreakdownBars({ breakdown }) {
  const { theme } = useTheme();

  if (!breakdown || Object.keys(breakdown).length === 0) {
    return null;
  }

  // Get max value for scaling
  const maxValue = Math.max(...Object.values(breakdown));

  // Color mapping for risk categories
  const categoryColors = {
    ssn: "#ef4444",
    email: "#f97316",
    phone: "#fb923c",
    credit_card: "#eab308",
    password: "#ef4444",
    api_key: "#ec4899",
    pii: "#8b5cf6",
    medical: "#06b6d4",
    default: "#6366f1",
  };

  const getCategoryColor = (category) => {
    return categoryColors[category] || categoryColors.default;
  };

  const getCategoryLabel = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div
      className={`rounded-xl p-5 space-y-4 border transition-colors ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-4 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Risk Breakdown
      </h3>

      {Object.entries(breakdown).map(([category, value]) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {getCategoryLabel(category)}
            </label>
            <span
              className={`text-sm font-semibold ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {value} pts
            </span>
          </div>

          {/* Animated progress bar */}
          <div
            className={`h-3 rounded-full overflow-hidden border transition-colors ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-300 border-gray-400"
            }`}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(value / maxValue) * 100}%`,
                backgroundColor: getCategoryColor(category),
                boxShadow: `0 0 12px ${getCategoryColor(category)}80`,
              }}
            />
          </div>

          {/* Percentage indicator */}
          <div
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {(
              (value / (maxValue * Object.keys(breakdown).length)) *
              100
            ).toFixed(1)}
            % of total
          </div>
        </div>
      ))}

      {/* Total risk score summary */}
      <div
        className={`mt-6 pt-4 border-t transition-colors ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center">
          <span
            className={`text-sm font-medium ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Total Risk Weight
          </span>
          <span
            className={`text-lg font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {Object.values(breakdown).reduce((a, b) => a + b, 0)} pts
          </span>
        </div>
      </div>
    </div>
  );
}
