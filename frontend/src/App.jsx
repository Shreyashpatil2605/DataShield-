import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import DashboardHeader from "./components/DashboardHeader";
import Dashboard from "./components/Dashboard";
import DropZone from "./components/DropZone";
import RiskMeter from "./components/RiskMeter";
import RiskBreakdownBars from "./components/RiskBreakdownBars";
import EntityHeatmap from "./components/EntityHeatmap";
import PIIDetectionResult from "./components/PIIDetectionResult";
import EntityTable from "./components/EntityTable";
import ExplanationPanel from "./components/ExplanationPanel";
import RedactedPreview from "./components/RedactedPreview";
import ActionBar from "./components/ActionBar";
import LandingPage from "./pages/LandingPage";
import AnimatedBackground from "./components/AnimatedBackground";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const { theme } = useTheme();
  const location = useLocation();
  
  // Transition stage & displayLocation to coordinate smooth CSS transitions
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("page-enter-active");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("page-exit-active");
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("page-enter");
      }, 300); // Matches the exit transition duration
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "page-enter") {
      const timer = setTimeout(() => {
        setTransitionStage("page-enter-active");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [transitionStage]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("replace");
  const [stats, setStats] = useState({
    totalPII: 0,
    highRisk: 0,
    mediumSeverity: 0,
    loss: 0,
  });

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
          const errorMsg =
            data?.error ||
            data?.detail ||
            data?.message ||
            `Error: ${res.status} ${res.statusText}`;
          throw new Error(errorMsg);
        }

        setResult(data);

        const riskScore = data.decision.risk.score || 0;
        const highRiskCount = data.entities.filter((e) => e.score >= 80).length;
        const mediumCount = data.entities.filter(
          (e) => e.score >= 40 && e.score < 80,
        ).length;

        setStats({
          totalPII: data.entities.length,
          highRisk: highRiskCount,
          mediumSeverity: mediumCount,
          loss: Math.round(riskScore * 100),
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(errorMessage);
        console.error("Upload error:", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [mode],
  );

  const renderDashboard = () => {
    return (
      <div
        className="min-h-screen bg-transparent transition-colors duration-300"
      >
        <DashboardHeader />

        {!result ? (
          <Dashboard stats={stats} onFile={handleFile} loading={loading} />
        ) : (
          <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setResult(null)}
              className={`flex items-center gap-2 font-medium transition-colors ${
                theme === "dark"
                  ? "text-indigo-400 hover:text-indigo-300"
                  : "text-indigo-600 hover:text-indigo-700"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </button>

            {/* Analysis Results */}
            <div>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Analysis Results
              </h2>
              <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                {result.filename || "Document"}
              </p>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <label
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Redaction mode:
              </label>
              {["replace", "hash", "mask", "synthetic"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-xs rounded border transition-all ${
                    mode === m
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : theme === "dark"
                        ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                        : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 hover:border-gray-400"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {error && (
              <div
                className={`rounded-lg p-4 shadow-sm border ${
                  theme === "dark"
                    ? "bg-red-900/20 border-red-800"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p
                  className={`font-semibold mb-2 ${
                    theme === "dark" ? "text-red-400" : "text-red-700"
                  }`}
                >
                  Error
                </p>
                <p
                  className={`text-sm font-mono ${
                    theme === "dark" ? "text-red-300" : "text-red-600"
                  }`}
                >
                  {error}
                </p>
              </div>
            )}

            <RiskMeter risk={result.decision.risk} />
            <PIIDetectionResult
              entities={result.entities}
              decision={result.decision}
            />
            <RiskBreakdownBars breakdown={result.decision.risk.breakdown} />
            <EntityHeatmap entities={result.entities} />
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
              redactedPdfId={result.redacted_pdf_id}
            />
          </main>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <div className={`relative z-10 page-transition-wrapper ${transitionStage}`}>
        <Routes location={displayLocation}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={renderDashboard()} />
        </Routes>
      </div>
    </div>
  );
}

