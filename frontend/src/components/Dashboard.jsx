import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import MetricCard from "./MetricCard";
import RiskMeter from "./RiskMeter";
import DropZone from "./DropZone";
import DemoDataSummary from "./DemoDataSummary";
import {
  generateDemoDashboardData,
} from "../utils/demoData";
import { dashboardDemoData } from "../utils/demoDashboardData";

export default function Dashboard({
  stats = null,
  onFile = null,
  loading = false,
}) {
  const { theme } = useTheme();

  // Create initial stats from demo data
  const initialStats = {
    totalPII: dashboardDemoData.summary.total_pii,
    highRisk: dashboardDemoData.summary.high_risk,
    mediumSeverity: dashboardDemoData.summary.medium_severity,
    loss: dashboardDemoData.summary.loss,
    riskScore: Math.round((dashboardDemoData.summary.high_risk / dashboardDemoData.summary.total_pii) * 100),
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return "critical";
    if (score >= 60) return "high";
    if (score >= 40) return "medium";
    if (score >= 20) return "low";
    return "safe";
  };

  const [dynamicStats, setDynamicStats] = useState(stats || initialStats);
  const [previousStats, setPreviousStats] = useState(null);
  const [chartData, setChartData] = useState(
    dashboardDemoData.risk_levels_by_day.map((day) => day.risk_score),
  );

  const calculateTrend = (current, previous) => {
    if (!previous) return { positive: true, value: 2 };
    const change = ((current - previous) / previous) * 100;
    return { positive: change > 0, value: Math.round(Math.abs(change)) || 1 };
  };

  // Update dynamic data when stats prop changes
  useEffect(() => {
    if (stats) {
      setDynamicStats(stats);
    }
  }, [stats]);

  // Generate demo data updates every 4 seconds (only when no file is being analyzed)
  useEffect(() => {
    if (stats) return;

    const timeoutId = setTimeout(() => {
      const interval = setInterval(() => {
        setDynamicStats((prev) => {
          setPreviousStats(prev);
          return generateDemoDashboardData(prev, 8);
        });

        setChartData((prev) => {
          const newData = [...prev];
          newData.shift();
          const lastValue = newData[newData.length - 1];
          const fluctuation = Math.floor(Math.random() * 20) - 10;
          const newValue = Math.max(10, Math.min(90, lastValue + fluctuation));
          newData.push(newValue);
          return newData;
        });
      }, 4000);

      window._dashboardInterval = interval;
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
      if (window._dashboardInterval) {
        clearInterval(window._dashboardInterval);
      }
    };
  }, [stats]);

  const displayStats = stats || dynamicStats;

  const IconProps = {
    className: "w-5 h-5",
    strokeWidth: 2,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2
            className={`text-2xl font-bold tracking-tight ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            SecOps Control Center
          </h2>
          <p
            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Real-time PII intelligence and compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold font-mono">
            AGENT v1.0.0
          </span>
          <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold font-mono">
            SANDBOX SECURE
          </span>
        </div>
      </div>

      {/* Redesigned SaaS Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total PII"
          value={displayStats.totalPII.toLocaleString()}
          color="blue"
          icon={
            <svg {...IconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          trend={calculateTrend(displayStats.totalPII, previousStats?.totalPII)}
          description="Total detected personally identifiable values"
        />
        <MetricCard
          title="High Risk"
          value={displayStats.highRisk.toLocaleString()}
          color="red"
          icon={
            <svg {...IconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          trend={
            previousStats
              ? {
                  positive: displayStats.highRisk > previousStats.highRisk,
                  value: Math.abs(calculateTrend(displayStats.highRisk, previousStats.highRisk).value),
                }
              : { positive: false, value: 0 }
          }
          description="Critical items (e.g. Aadhaar, credit cards)"
        />
        <MetricCard
          title="Medium Severity"
          value={displayStats.mediumSeverity.toLocaleString()}
          color="amber"
          icon={
            <svg {...IconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={calculateTrend(displayStats.mediumSeverity, previousStats?.mediumSeverity)}
          description="Medium severity indicators (e.g. Phone, email)"
        />
        <MetricCard
          title="Estimated Financial Exposure"
          value={`$${(displayStats.loss || displayStats.totalPII * 100).toLocaleString()}`}
          color="purple"
          icon={
            <svg {...IconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          trend={
            previousStats
              ? {
                  positive: (displayStats.loss || displayStats.totalPII * 100) > (previousStats.loss || previousStats.totalPII * 100),
                  value: Math.abs(calculateTrend((displayStats.loss || displayStats.totalPII * 100), (previousStats.loss || previousStats.totalPII * 100)).value),
                }
              : { positive: false, value: 0 }
          }
          description="Potential liability exposure before redaction"
        />
      </div>

      {/* SVG Circular Progress Gauge & traditional metrics slider */}
      <RiskMeter
        risk={{
          score: Math.round((displayStats.highRisk / Math.max(1, displayStats.totalPII)) * 100) || 7,
          level: getRiskLevel(Math.round((displayStats.highRisk / Math.max(1, displayStats.totalPII)) * 100) || 7),
          message: `Overall Privacy Risk calculated from active threats`,
          allowed: displayStats.highRisk < 100,
        }}
      />

      {/* Four-Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: PII Distribution Donut Chart */}
        <div
          className={`rounded-xl border p-6 transition-colors ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`text-base font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            PII Distribution
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-64">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke={theme === "dark" ? "#1f2937" : "#f3f4f6"} strokeWidth="12" fill="transparent" />
                {/* Simulated segments */}
                <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" fill="transparent" />
                <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="130" fill="transparent" className="opacity-80" />
                <circle cx="50" cy="50" r="40" stroke="#ec4899" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="180" fill="transparent" className="opacity-70" />
              </svg>
              <div className="absolute text-center">
                <span className={`text-lg font-extrabold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Classified</span>
              </div>
            </div>
            <div className="space-y-2 text-xs flex-grow sm:max-w-xs">
              {Object.entries(dashboardDemoData.pii_breakdown).map(([type, percentage], idx) => {
                const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500"];
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-400">
                      <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></span>
                      {type}
                    </span>
                    <span className={`font-mono font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Risk Trend Line Chart */}
        <div
          className={`rounded-xl border p-6 transition-colors ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`text-base font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Risk Trend Timeline
          </h3>
          <div className="relative h-64 flex flex-col justify-between">
            <svg className="w-full h-48" viewBox="0 0 400 200" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="400" y2="50" stroke={theme === "dark" ? "#1f2937" : "#e5e7eb"} strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="400" y2="100" stroke={theme === "dark" ? "#1f2937" : "#e5e7eb"} strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="400" y2="150" stroke={theme === "dark" ? "#1f2937" : "#e5e7eb"} strokeWidth="1" strokeDasharray="3 3" />
              {chartData.length > 0 && (
                <>
                  <polyline
                    points={chartData
                      .map((value, i) => {
                        const x = (i / (chartData.length - 1)) * 400;
                        const y = 200 - value * 1.8;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polygon
                    points={`${chartData
                      .map((value, i) => {
                        const x = (i / (chartData.length - 1)) * 400;
                        const y = 200 - value * 1.8;
                        return `${x},${y}`;
                      })
                      .join(" ")} 400,200 0,200`}
                    fill="url(#trendGrad)"
                    opacity="0.12"
                  />
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Highlight dots */}
                  {chartData.map((val, i) => {
                    const x = (i / (chartData.length - 1)) * 400;
                    const y = 200 - val * 1.8;
                    return <circle key={i} cx={x} cy={y} r="4" fill="#a78bfa" className="stroke-gray-900 stroke-2" />;
                  })}
                </>
              )}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold uppercase font-mono px-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Compliance Score Progress */}
        <div
          className={`rounded-xl border p-6 transition-colors ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`text-base font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Regulatory Compliance Audits
          </h3>
          <div className="space-y-4 h-64 overflow-y-auto pr-1">
            {[
              { std: "GDPR (EU Privacy)", score: 92, color: "bg-blue-500" },
              { std: "DPDP (India)", score: 88, color: "bg-purple-500" },
              { std: "HIPAA (Healthcare)", score: 95, color: "bg-emerald-500" },
              { std: "PCI DSS (Payments)", score: 90, color: "bg-cyan-500" },
              { std: "ISO 27001 (Security)", score: 85, color: "bg-amber-500" }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-400">{item.std}</span>
                  <span className="font-mono font-bold text-white">{item.score}% Passed</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}>
                  <div className={`h-full rounded-full transition-all duration-1000 ${item.color}`} style={{ width: `${item.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Detection Timeline (Horizontal Event timeline) */}
        <div
          className={`rounded-xl border p-6 transition-colors ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className={`text-base font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Threat Detection Timeline
          </h3>
          <div className="space-y-4 h-64 overflow-y-auto pr-1 text-xs">
            {[
              { time: "10:14 AM", event: "High Risk Entity Detected (Aadhaar Card)", file: "employee_docs.pdf", alert: "Critical" },
              { time: "09:42 AM", event: "Email addresses redacted from server dump", file: "syslog_export.txt", alert: "Secured" },
              { time: "08:15 AM", event: "Automated batch compliance test completed", file: "audit_ledger", alert: "Audit" },
              { time: "07:30 AM", event: "API Gateway key validation triggered", file: "System", alert: "Info" }
            ].map((node, i) => (
              <div key={i} className="flex gap-4 items-start border-l-2 border-indigo-500/30 pl-4 py-1 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute -left-[6px] top-2 border border-gray-900"></div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{node.event}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{node.time}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[10px]">
                    <span>File: {node.file}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      node.alert === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      node.alert === "Secured" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      "bg-gray-800 text-gray-400"
                    }`}>{node.alert}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Status */}
      <div className={`p-6 rounded-xl border ${
        theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <h3 className={`text-base font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          Platform Systems Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {[
            { name: "API Gateway Node", status: "Operational", desc: "12ms avg latency", indicator: "bg-emerald-500" },
            { name: "NER Analysis Model", status: "Loaded / Warm", desc: "Transformer initialized", indicator: "bg-emerald-500" },
            { name: "Ledger Redactor Node", status: "Secure Sandbox", desc: "Zero telemetry connection", indicator: "bg-emerald-500" }
          ].map((node, i) => (
            <div key={i} className={`p-4 rounded-lg border ${
              theme === "dark" ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-150"
            } flex items-center justify-between`}>
              <div className="space-y-1">
                <span className="font-semibold text-gray-400 block">{node.name}</span>
                <span className="text-[10px] text-gray-500 block">{node.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${node.indicator} animate-pulse`}></span>
                <span className="font-mono font-bold text-white text-[10px]">{node.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Statistics summary fallback */}
      <DemoDataSummary />

      {/* Upload Section */}
      {onFile && (
        <div className="space-y-4">
          <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Secure File Sandbox Upload
          </h3>
          <DropZone onFile={onFile} loading={loading} />
        </div>
      )}
    </div>
  );
}
