import { useTheme } from "../context/ThemeContext";

export default function EntityHeatmap({ entities }) {
  const { theme } = useTheme();

  if (!entities || entities.length === 0) {
    return null;
  }

  // Get risk level from score (0-1 scale)
  const getRiskLevel = (score) => {
    const percentage = score * 100;
    if (percentage <= 20)
      return { level: "safe", color: "#22c55e", bg: "bg-green-500/20" };
    if (percentage <= 40)
      return { level: "low", color: "#facc15", bg: "bg-yellow-500/20" };
    if (percentage <= 60)
      return { level: "medium", color: "#fb923c", bg: "bg-orange-500/20" };
    if (percentage <= 80)
      return { level: "high", color: "#ef4444", bg: "bg-red-500/20" };
    return { level: "critical", color: "#991b1b", bg: "bg-red-900/20" };
  };

  // Group entities by label
  const entityByLabel = {};
  entities.forEach((entity) => {
    if (!entityByLabel[entity.label]) {
      entityByLabel[entity.label] = [];
    }
    entityByLabel[entity.label].push(entity);
  });

  return (
    <div
      className={`rounded-xl p-5 border transition-colors ${
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
        Entity Risk Heatmap
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(entityByLabel).map(([label, labelEntities]) => {
          const avgScore =
            labelEntities.reduce((sum, e) => sum + e.score, 0) /
            labelEntities.length;
          const riskInfo = getRiskLevel(avgScore);
          const maxScore = Math.max(...labelEntities.map((e) => e.score));

          return (
            <div
              key={label}
              className={`p-4 rounded-lg border backdrop-blur transition-colors ${
                theme === "dark"
                  ? "bg-gray-900/40 border-gray-600"
                  : "bg-gray-50 border-gray-300"
              }`}
              style={{ borderColor: riskInfo.color }}
            >
              {/* Label header */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: riskInfo.color + "33",
                    color: riskInfo.color,
                  }}
                >
                  {label}
                </span>
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: riskInfo.color + "44",
                    color: riskInfo.color,
                  }}
                >
                  {riskInfo.level.toUpperCase()}
                </span>
              </div>

              {/* Heat bar visualization */}
              <div className="space-y-2 mb-3">
                <div
                  className={`flex justify-between text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span>Count: {labelEntities.length}</span>
                  <span>Avg: {(avgScore * 100).toFixed(0)}%</span>
                </div>

                {/* Gradient heat bar */}
                <div
                  className={`h-6 rounded-lg overflow-hidden border transition-colors ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-300 border-gray-400"
                  }`}
                >
                  {/* Show distribution of scores */}
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${avgScore * 100}%`,
                      background: `linear-gradient(90deg, #22c55e, #facc15, #fb923c, #ef4444, #991b1b)`,
                    }}
                  />
                </div>
              </div>

              {/* Top entity detail */}
              <div
                className={`text-xs rounded p-2 border transition-colors ${
                  theme === "dark"
                    ? "bg-gray-900/40 border-gray-600/50"
                    : "bg-gray-100 border-gray-300/50"
                }`}
              >
                <div
                  className={`mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Highest Risk Entity:
                </div>
                <div
                  className={`font-mono truncate mb-1 ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  "
                  {labelEntities
                    .find((e) => e.score === maxScore)
                    ?.text?.substring(0, 25)}
                  ..."
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: getRiskLevel(maxScore).color }}
                >
                  Score: {(maxScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        className={`mt-4 pt-4 border-t transition-colors grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Safe
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Low
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400" />
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Medium
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            High
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-900" />
          <span
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            Critical
          </span>
        </div>
      </div>
    </div>
  );
}
