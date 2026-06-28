import { useTheme } from "../context/ThemeContext";
import SpeedometerGauge from "./SpeedometerGauge";

const LEVEL_COLORS = {
  safe: "bg-green-500",
  low: "bg-yellow-400",
  medium: "bg-orange-400",
  high: "bg-red-500",
  critical: "bg-red-700",
};

const LEVEL_TEXT = {
  safe: "text-green-400",
  low: "text-yellow-400",
  medium: "text-orange-400",
  high: "text-red-400",
  critical: "text-red-300",
};

export default function RiskMeter({ risk }) {
  const { theme } = useTheme();
  const barColor = LEVEL_COLORS[risk.level] || "bg-gray-400";
  const textColor = LEVEL_TEXT[risk.level] || "text-gray-700";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Speedometer gauge */}
      <div
        className={`rounded-xl p-6 border transition-colors ${
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
          Privacy Risk Gauge
        </h3>
        <SpeedometerGauge score={risk.score} level={risk.level} />
        <p className={`mt-4 text-center text-sm font-medium ${textColor}`}>
          {risk.message}
        </p>
      </div>

      {/* Traditional risk meter with stats */}
      <div
        className={`rounded-xl p-6 space-y-4 border transition-colors ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <span
              className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Privacy risk score
            </span>
            <span className={`text-3xl font-bold ${textColor}`}>
              {risk.score}
            </span>
            <span
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              / 100
            </span>
          </div>
          <div
            className={`h-3 rounded-full overflow-hidden ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${risk.score}%` }}
            />
          </div>
        </div>

        {/* Risk level badges */}
        <div
          className={`grid grid-cols-2 gap-2 pt-4 border-t ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`rounded p-3 ${
              theme === "dark" ? "bg-gray-900/50" : "bg-gray-100"
            }`}
          >
            <div
              className={`text-xs mb-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Level
            </div>
            <div
              className={`text-sm font-bold uppercase tracking-wide ${textColor}`}
            >
              {risk.level}
            </div>
          </div>
          <div
            className={`rounded p-3 ${
              theme === "dark" ? "bg-gray-900/50" : "bg-gray-100"
            }`}
          >
            <div
              className={`text-xs mb-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Status
            </div>
            <div
              className={`text-sm font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {risk.allowed ? "✓ Allowed" : "✗ Blocked"}
            </div>
          </div>
        </div>

        {/* Risk categories scale */}
        <div
          className={`pt-4 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
        >
          <div
            className={`text-xs font-semibold mb-3 ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Risk Scale
          </div>
          <div className="flex justify-between gap-1 text-xs">
            <div className="text-center">
              <div className="w-full h-2 bg-green-500 rounded mb-1" />
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                0-20
              </span>
            </div>
            <div className="text-center">
              <div className="w-full h-2 bg-yellow-400 rounded mb-1" />
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                21-40
              </span>
            </div>
            <div className="text-center">
              <div className="w-full h-2 bg-orange-400 rounded mb-1" />
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                41-60
              </span>
            </div>
            <div className="text-center">
              <div className="w-full h-2 bg-red-500 rounded mb-1" />
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                61-80
              </span>
            </div>
            <div className="text-center">
              <div className="w-full h-2 bg-red-700 rounded mb-1" />
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                81-100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
