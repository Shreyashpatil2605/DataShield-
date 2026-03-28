export default function ExplanationPanel({ reasons, explanations, allowed }) {
  const severityColors = {
    critical: "bg-red-900/30 border-red-700 text-red-300",
    high: "bg-orange-900/30 border-orange-700 text-orange-300",
    medium: "bg-yellow-900/30 border-yellow-700 text-yellow-300",
    low: "bg-blue-900/30 border-blue-700 text-blue-300",
  };

  const severityBadgeColors = {
    critical: "bg-red-900/50 text-red-300",
    high: "bg-orange-900/50 text-orange-300",
    medium: "bg-yellow-900/50 text-yellow-300",
    low: "bg-blue-900/50 text-blue-300",
  };

  return (
    <div className="space-y-4">
      {/* Decision reasons */}
      {reasons && reasons.length > 0 && (
        <div
          className={`p-4 rounded-lg border ${allowed ? "bg-green-900/30 border-green-700 text-green-300" : "bg-red-900/30 border-red-700 text-red-300"}`}
        >
          <p className="text-sm font-semibold mb-2">
            {allowed ? "Allowed" : "Blocked"}
          </p>
          <ul className="space-y-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-sm">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Entity explanations */}
      {explanations && explanations.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Why These Entities Matter
          </h3>
          <div className="space-y-3">
            {explanations.map((exp, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${severityColors[exp.severity] || severityColors.low}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${severityBadgeColors[exp.severity] || severityBadgeColors.low} whitespace-nowrap mt-0.5`}
                  >
                    {exp.severity.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">{exp.what}</p>
                    <p className="text-sm mt-1 text-gray-300">{exp.why}</p>
                    <p className="text-xs mt-2 text-gray-400">
                      Relevant law: {exp.law}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
