import { useTheme } from "../context/ThemeContext";

export default function MetricCard({
  title,
  value,
  icon,
  trend = null,
  color = "blue",
}) {
  const { theme } = useTheme();

  const colorClasses = {
    blue: {
      bg: theme === "dark" ? "bg-blue-900/20" : "bg-blue-50",
      text: theme === "dark" ? "text-blue-400" : "text-blue-600",
      border: theme === "dark" ? "border-blue-800" : "border-blue-200",
    },
    red: {
      bg: theme === "dark" ? "bg-red-900/20" : "bg-red-50",
      text: theme === "dark" ? "text-red-400" : "text-red-600",
      border: theme === "dark" ? "border-red-800" : "border-red-200",
    },
    amber: {
      bg: theme === "dark" ? "bg-amber-900/20" : "bg-amber-50",
      text: theme === "dark" ? "text-amber-400" : "text-amber-600",
      border: theme === "dark" ? "border-amber-800" : "border-amber-200",
    },
    purple: {
      bg: theme === "dark" ? "bg-purple-900/20" : "bg-purple-50",
      text: theme === "dark" ? "text-purple-400" : "text-purple-600",
      border: theme === "dark" ? "border-purple-800" : "border-purple-200",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`rounded-lg border p-6 transition-all ${
        colors.bg
      } ${colors.border} ${
        theme === "dark" ? "hover:bg-opacity-80" : "hover:bg-opacity-80"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>{icon}</div>
        {trend && (
          <div
            className={`text-sm font-semibold px-2 py-1 rounded ${
              trend.positive
                ? "bg-green-500/20 text-green-600"
                : "bg-red-500/20 text-red-600"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </div>
      <p
        className={`text-sm font-medium mb-2 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {title}
      </p>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
    </div>
  );
}
