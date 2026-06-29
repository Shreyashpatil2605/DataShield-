import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

export default function MetricCard({
  title,
  value,
  icon,
  trend = null,
  color = "blue",
  description = "",
}) {
  const { theme } = useTheme();
  const [displayVal, setDisplayVal] = useState(value);

  useEffect(() => {
    const numericStr = String(value).replace(/[^0-9]/g, "");
    const target = parseInt(numericStr, 10) || 0;
    if (target === 0) {
      setDisplayVal(value);
      return;
    }

    let start = 0;
    const duration = 800; // 0.8 seconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * target);

      let formatted = current;
      if (String(value).includes("$")) {
        formatted = `$${current.toLocaleString()}`;
      } else if (String(value).includes(",") || typeof value === "number") {
        formatted = current.toLocaleString();
      }
      setDisplayVal(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayVal(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const colorClasses = {
    blue: {
      bg: theme === "dark" ? "bg-blue-950/20" : "bg-blue-50",
      text: theme === "dark" ? "text-blue-400" : "text-blue-600",
      border: theme === "dark" ? "border-blue-500/20 hover:border-blue-500/40" : "border-blue-200",
      glow: "shadow-blue-500/5",
    },
    red: {
      bg: theme === "dark" ? "bg-red-950/20" : "bg-red-50",
      text: theme === "dark" ? "text-red-400" : "text-red-600",
      border: theme === "dark" ? "border-red-500/20 hover:border-red-500/40" : "border-red-200",
      glow: "shadow-red-500/5",
    },
    amber: {
      bg: theme === "dark" ? "bg-amber-950/20" : "bg-amber-50",
      text: theme === "dark" ? "text-amber-400" : "text-amber-600",
      border: theme === "dark" ? "border-amber-500/20 hover:border-amber-500/40" : "border-amber-200",
      glow: "shadow-amber-500/5",
    },
    purple: {
      bg: theme === "dark" ? "bg-purple-950/20" : "bg-purple-50",
      text: theme === "dark" ? "text-purple-400" : "text-purple-600",
      border: theme === "dark" ? "border-purple-500/20 hover:border-purple-500/40" : "border-purple-200",
      glow: "shadow-purple-500/5",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  // Fallback description mappings if none provided
  const defaultDesc = description || {
    "Total PII": "Identified sensitive data attributes",
    "High Risk": "Critical data exposures detected",
    "Medium Severity": "Medium risk vulnerabilities detected",
    "Loss": "Estimated regulatory exposure",
    "Estimated Financial Exposure": "Estimated regulatory exposure",
  }[title] || "Active monitor statistics";

  return (
    <div
      className={`rounded-xl border p-6 transition-all duration-300 shadow-lg ${
        colors.border
      } ${colors.glow} ${
        theme === "dark"
          ? "bg-gray-900/60 backdrop-blur-md hover:scale-[1.02]"
          : "bg-white hover:shadow-xl hover:scale-[1.02]"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg border ${
          theme === "dark" ? "border-gray-800 bg-gray-950/40" : "border-gray-200 bg-gray-50"
        } ${colors.text}`}>{icon}</div>
        {trend && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
              trend.positive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            <span>{trend.positive ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          theme === "dark" ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {title === "Loss" ? "Est. Financial Exposure" : title}
      </p>

      <p className={`text-3xl font-extrabold font-mono mb-2 tracking-tight ${
        theme === "dark" ? "text-white" : "text-gray-900"
      }`}>
        {displayVal}
      </p>

      <p className={`text-xs ${
        theme === "dark" ? "text-gray-400" : "text-gray-500"
      }`}>
        {defaultDesc}
      </p>
    </div>
  );
}
