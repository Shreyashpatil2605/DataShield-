export default function RedactedPreview({ text }) {
  const maxLength = 300;
  const isLonger = text && text.length > maxLength;

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Redacted Text</h3>
      <div className="bg-gray-900/50 p-4 rounded border border-gray-700 font-mono text-sm text-gray-300 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
        {isLonger ? text.substring(0, maxLength) + "…" : text}
      </div>
      {isLonger && (
        <p className="text-xs text-gray-400 mt-2">
          (Showing first {maxLength} characters. Download to see full text.)
        </p>
      )}
    </div>
  );
}
