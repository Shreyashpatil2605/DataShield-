export default function EntityTable({ entities }) {
  if (!entities || entities.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 bg-gray-900/50 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">
          Detected Entities
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-300">
                Label
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-300">
                Text
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-300">
                Source
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-300">
                Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {entities.map((entity, idx) => (
              <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-300 text-xs font-semibold">
                    {entity.label}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-100 font-mono text-xs">
                  {entity.text.length > 50
                    ? entity.text.substring(0, 50) + "…"
                    : entity.text}
                </td>
                <td className="px-6 py-3 text-gray-400">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {entity.source}
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-gray-400">
                  {(entity.score * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
