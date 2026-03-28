import { useState, useCallback } from "react";
import DropZone from "./components/DropZone";
import RiskMeter from "./components/RiskMeter";
import EntityTable from "./components/EntityTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RedactedPreview from "./components/RedactedPreview";
import ActionBar from "./components/ActionBar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("replace");

  const handleFile = useCallback(
    async (file) => {
      setLoading(true);
      setError(null);
      setResult(null);

      const form = new FormData();
      form.append("file", file);

      try {
        const res = await fetch(`${API_BASE}/analyze?mode=${mode}`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();

        if (!res.ok) {
          // Extract error message from response
          const errorMsg =
            data?.error ||
            data?.detail ||
            data?.message ||
            `Error: ${res.status} ${res.statusText}`;
          throw new Error(errorMsg);
        }

        setResult(data);
      } catch (e) {
        // Extract message properly (handle both Error objects and strings)
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(errorMessage);
        console.error("Upload error:", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [mode],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-6 font-sans">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-white">PII Guard</h1>
        <p className="text-gray-400 mt-2">
          Privacy-first PII detection — processed locally, never uploaded to the
          cloud.
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <label className="text-sm text-gray-400">Redaction mode:</label>
          {["replace", "hash", "mask", "synthetic"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded border transition-all ${
                mode === m
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <DropZone onFile={handleFile} loading={loading} />

        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-red-400 mb-2">Error</p>
            <p className="text-sm text-red-300 font-mono">{error}</p>
          </div>
        )}

        {result && (
          <>
            <RiskMeter risk={result.decision.risk} />
            <ExplanationPanel
              reasons={result.decision.reasons}
              explanations={result.explanations}
              allowed={result.decision.allowed}
            />
            <EntityTable entities={result.entities} />
            <RedactedPreview text={result.redacted_text} />
            <ActionBar
              redactedText={result.redacted_text}
              filename={result.filename}
            />
          </>
        )}
      </main>
    </div>
  );
}
