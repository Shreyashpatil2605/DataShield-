const LEVEL_COLORS = {
  safe:     "bg-green-500",
  low:      "bg-yellow-400",
  medium:   "bg-orange-400",
  high:     "bg-red-500",
  critical: "bg-red-700",
};

const LEVEL_TEXT = {
  safe:     "text-green-400",
  low:      "text-yellow-400",
  medium:   "text-orange-400",
  high:     "text-red-400",
  critical: "text-red-300",
};

export default function RiskMeter({ risk }) {
  const barColor = LEVEL_COLORS[risk.level] || "bg-gray-400";
  const textColor = LEVEL_TEXT[risk.level] || "text-gray-700";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm font-medium text-gray-300">Privacy risk score</span>
        <span className={`text-2xl font-semibold ${textColor}`}>{risk.score} / 100</span>
      </div>
      <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${risk.score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Safe</span><span>Low</span><span>Medium</span><span>High</span><span>Critical</span>
      </div>
      <p className={`mt-3 text-sm font-medium ${textColor}`}>{risk.message}</p>

      {risk.breakdown && Object.keys(risk.breakdown).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(risk.breakdown).map(([label, weight]) => (
            <span key={label} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {label}: {weight}pts
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
