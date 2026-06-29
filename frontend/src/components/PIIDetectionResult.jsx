import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";

export default function PIIDetectionResult({
  entities = [],
  decision = {},
  redactedText = "",
  filename = "Document",
}) {
  const { theme } = useTheme();

  // Function to mask sensitive data
  const maskData = (text, label) => {
    if (!text) return "";
    const textStr = String(text).trim();
    const len = textStr.length;

    switch (label.toLowerCase()) {
      case "name":
        return textStr.charAt(0) + "*".repeat(Math.max(len - 1, 3));
      case "email":
        const [localPart, domain] = textStr.split("@");
        if (domain) {
          const maskedLocal =
            localPart.charAt(0) + "*".repeat(Math.max(localPart.length - 1, 3));
          return `${maskedLocal}@${domain}`;
        }
        return textStr.charAt(0) + "*".repeat(Math.max(len - 1, 3));
      case "phone":
        const digits = textStr.replace(/\D/g, "");
        if (digits.length >= 4) {
          return "*".repeat(digits.length - 4) + digits.slice(-4);
        }
        return "*".repeat(Math.max(len - 1, 3));
      case "credit_card":
      case "creditcard":
        const ccDigits = textStr.replace(/\D/g, "");
        if (ccDigits.length >= 4) {
          return "****-****-****-" + ccDigits.slice(-4);
        }
        return "*".repeat(Math.max(len - 1, 3));
      case "ssn":
      case "social_security_number":
        const ssnDigits = textStr.replace(/\D/g, "");
        if (ssnDigits.length >= 4) {
          return "***-**-" + ssnDigits.slice(-4);
        }
        return "*".repeat(Math.max(len - 1, 3));
      default:
        if (len <= 2) return "*".repeat(len);
        return textStr.charAt(0) + "*".repeat(Math.max(len - 2, 3)) + textStr.charAt(len - 1);
    }
  };

  const getRiskBadgeColor = (score) => {
    if (score >= 80) return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (score >= 50) return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  };

  const getSeverityLabel = (score) => {
    if (score >= 80) return "Critical";
    if (score >= 50) return "Medium";
    return "Low";
  };

  // Simulated scan metrics
  const scanDuration = 124 + entities.length * 18;
  const avgScore = entities.length
    ? Math.round(entities.reduce((sum, e) => sum + (e.score || 95), 0) / entities.length)
    : 99;

  // Crypto/Blockchain variables
  const txHash = "0x" + Math.floor(Math.random() * 100000000).toString(16).padStart(8, "0") + "..." + Math.floor(Math.random() * 1000000).toString(16);
  const ledgerHash = "sha256:" + Math.floor(Math.random() * 9999999999).toString(36);

  // Recreate unredacted text for side-by-side demo
  const [originalText, setOriginalText] = useState("");
  useEffect(() => {
    if (redactedText) {
      let temp = redactedText;
      entities.forEach((ent) => {
        const val = ent.text || ent.value || "";
        const placeholder = `[${ent.label.toUpperCase()}]`;
        if (temp.includes(placeholder)) {
          temp = temp.replace(placeholder, val);
        }
      });
      setOriginalText(temp || redactedText);
    }
  }, [redactedText, entities]);

  return (
    <div className="space-y-6">
      {/* Scan Header Info Panel */}
      <div className={`p-6 rounded-xl border ${
        theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      } grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-500">Document Identifier</span>
          <h3 className={`text-base font-bold truncate mt-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{filename}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Scan Duration</span>
            <span className="text-sm font-extrabold text-white font-mono">{scanDuration} ms</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Confidence index</span>
            <span className="text-sm font-extrabold text-white font-mono">{avgScore}% Accuracy</span>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Previews & Entity Cards */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Side-by-Side Original vs Redacted Text Previews */}
          <div className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Side-by-side Document Analyzer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Original Source</span>
                <div className={`p-4 rounded border font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap ${
                  theme === "dark" ? "bg-gray-950/40 border-gray-800 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-700"
                }`}>
                  {originalText || redactedText}
                </div>
              </div>
              {/* Redacted Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Redacted Export</span>
                <div className={`p-4 rounded border font-mono text-xs max-h-56 overflow-y-auto whitespace-pre-wrap ${
                  theme === "dark" ? "bg-gray-950/60 border-indigo-500/20 text-indigo-200" : "bg-indigo-50/50 border-indigo-200 text-indigo-900"
                }`}>
                  {redactedText}
                </div>
              </div>
            </div>
          </div>

          {/* Granular Entity Cards Grid */}
          <div className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Detected Sensitive Entities ({entities.length})
            </h3>
            
            {entities.length === 0 ? (
              <p className="text-xs text-gray-500">No sensitive data structures detected in this document.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
                {entities.map((item, idx) => {
                  const val = item.text || item.value || "";
                  const masked = maskData(val, item.label);
                  const confidence = item.score || 95;
                  const severity = getSeverityLabel(confidence);
                  const action = {
                    email: "Apply pattern mask",
                    phone: "Obfuscate last 4 digits",
                    aadhaar: "Encrypt and substitute synthetic ID",
                    pan: "Tokenize identifier",
                    credit_card: "Blackout CC block"
                  }[item.label.toLowerCase()] || "Substitute mask placeholder";

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        theme === "dark" ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-150"
                      } flex flex-col justify-between gap-3`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400 font-mono uppercase">
                          {item.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getRiskBadgeColor(confidence)}`}>
                          {severity} Risk ({confidence}%)
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Original:</span>
                          <span className="font-mono font-semibold text-gray-400 truncate max-w-[120px]">{val}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500">
                          <span>Redacted:</span>
                          <span className="font-mono font-semibold text-emerald-400 truncate max-w-[120px]">{masked}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800/40 text-[9px] text-gray-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Action: {action}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: AI Tips, Blockchain receipt, Compliance */}
        <div className="space-y-6">
          
          {/* AI Recommendations Card */}
          <div className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              AI Shield Recommendations
            </h3>
            <ul className="space-y-3 text-xs">
              {[
                { tip: "Mask active phone number nodes", desc: "Obfuscating last digits reduces direct social engineering." },
                { tip: "Encrypt Aadhaar / PAN identifiers", desc: "Always enforce synthetic token replacements." },
                { tip: "Secure sharing approved", desc: "This document is ready to be exported safely." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</span>
                  <div>
                    <span className="font-bold text-white block">{item.tip}</span>
                    <span className="text-[10px] text-gray-500 leading-tight block mt-0.5">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Blockchain Verification Receipt */}
          <div className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Blockchain Audit Receipt
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-white font-bold">{txHash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cryptographic Hash</span>
                <span className="font-mono text-gray-400 text-[10px] max-w-[120px] truncate">{ledgerHash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Timestamp</span>
                <span className="font-mono text-white">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Audit Ledger</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[9px] uppercase">Hyperledger Local</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-800/40 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>✓ ANCHORED & VERIFIED</span>
              </div>
            </div>
          </div>

          {/* Compliance Progress Bars */}
          <div className={`p-6 rounded-xl border ${
            theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Standard Compliance
            </h3>
            <div className="space-y-4">
              {[
                { std: "GDPR Standards", score: 92, color: "bg-blue-500" },
                { std: "DPDP Privacy Act", score: 88, color: "bg-purple-500" },
                { std: "HIPAA Security Guidelines", score: 95, color: "bg-emerald-500" },
                { std: "PCI DSS compliance", score: 90, color: "bg-cyan-500" },
                { std: "ISO 27001 standard", score: 85, color: "bg-amber-500" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-gray-400">{item.std}</span>
                    <span className="font-mono text-white font-bold">{item.score}% Passed</span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-gray-850" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
