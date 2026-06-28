import { jsPDF } from "jspdf";

// EntityTable.jsx
export function EntityTable({ entities }) {
  if (!entities?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Detected entities ({entities.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left pb-2 font-medium">Label</th>
              <th className="text-left pb-2 font-medium">Text</th>
              <th className="text-left pb-2 font-medium">Source</th>
              <th className="text-right pb-2 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-4">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                    {e.label}
                  </span>
                </td>
                <td className="py-2 pr-4 text-gray-800 font-mono text-xs">
                  {e.text.length > 40 ? e.text.slice(0, 40) + "…" : e.text}
                </td>
                <td className="py-2 pr-4 text-gray-400 text-xs">{e.source}</td>
                <td className="py-2 text-right text-gray-600 text-xs">
                  {(e.score * 100).toFixed(0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ExplanationPanel.jsx
export function ExplanationPanel({ reasons, explanations, allowed }) {
  const bg = allowed ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";
  const title = allowed ? "text-yellow-800" : "text-red-800";
  const body = allowed ? "text-yellow-700" : "text-red-700";

  return (
    <div className={`border rounded-xl p-5 ${bg}`}>
      <h2 className={`text-sm font-semibold mb-2 ${title}`}>
        {allowed ? "Review recommended" : "Upload blocked"}
      </h2>
      {reasons.map((r, i) => (
        <p key={i} className={`text-sm mb-2 ${body}`}>{r}</p>
      ))}
      {explanations?.length > 0 && (
        <div className="mt-3 space-y-2">
          {explanations.map((ex, i) => (
            <div key={i} className="text-xs text-gray-600">
              <span className="font-semibold">{ex.what}:</span> {ex.why}
              <span className="text-gray-400 ml-1">({ex.law})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// RedactedPreview.jsx
export function RedactedPreview({ text }) {
  if (!text) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Redacted text preview</h2>
      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
        {text.slice(0, 3000)}{text.length > 3000 ? "\n… (truncated)" : ""}
      </pre>
    </div>
  );
}

// ActionBar.jsx
export function ActionBar({ redactedText, filename, redactedPdfId }) {
  const downloadRedacted = () => {
    if (redactedPdfId) {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const element = document.createElement("a");
      element.href = `${API_BASE}/download/${redactedPdfId}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const name = filename
        ? filename.replace(/\.[^/.]+$/, "") + "_redacted.pdf"
        : "redacted_output.pdf";

      const margin = 15;
      const pageHeight = doc.internal.pageSize.height;
      const maxLineWidth = 180;
      const lineHeight = 6;
      
      const splitText = doc.splitTextToSize(redactedText || "", maxLineWidth);

      let y = margin;
      for (let i = 0; i < splitText.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitText[i], margin, y);
        y += lineHeight;
      }
      doc.save(name);
    } catch (err) {
      console.error("PDF generation failed, falling back to TXT download:", err);
      const blob = new Blob([redactedText], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${filename?.replace(/\.[^.]+$/, "") || "document"}_redacted.txt`;
      a.click();
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={downloadRedacted}
        className="flex-1 min-w-[160px] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        Download redacted file
      </button>
      <button
        onClick={() => navigator.clipboard.writeText(redactedText)}
        className="flex-1 min-w-[160px] bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-300 transition-colors"
      >
        Copy to clipboard
      </button>
    </div>
  );
}

export default EntityTable;
