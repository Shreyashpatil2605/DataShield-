import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-transparent text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Minimal Navbar */}
      <header className="relative z-10 w-full border-b border-gray-800/40 bg-gray-950/20 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-wide font-sans">
              DataShield
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-medium tracking-wide text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              System Status: Secure
            </span>
            <a 
              href="#features" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Features
            </a>
            <a 
              href="#pipeline" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Process
            </a>
            <button
              onClick={handleEnter}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/95 hover:bg-indigo-500 border border-indigo-500/30 text-white transition-all shadow-md shadow-indigo-600/10"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-12">
          {/* Animated Central Security Illustration */}
          <div className="relative mb-8 group animate-fade-in-down">
            <div className="absolute inset-0 -m-6 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            
            <div className="relative p-6 rounded-3xl border border-gray-800/40 bg-gray-900/30 backdrop-blur-xl shadow-2xl flex items-center justify-center max-w-[200px] mx-auto">
              <svg className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-float-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <circle cx="12" cy="12" r="11" strokeDasharray="3 3" className="stroke-indigo-500/20 animate-spin-slow" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} className="stroke-indigo-400" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                <path strokeLinecap="round" strokeWidth={1.5} className="stroke-blue-400" d="M12 6v3m-3 3h1m4 0h1" />
                <circle cx="12" cy="9" r="1.5" fill="#818cf8" className="animate-pulse" />
                <circle cx="10" cy="12" r="1.5" fill="#60a5fa" className="animate-pulse" />
                <circle cx="14" cy="12" r="1.5" fill="#60a5fa" className="animate-pulse" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in">
            <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
              Welcome to
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 pb-2">
              DataShield
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-lg md:text-xl font-semibold text-indigo-300 max-w-2xl mb-6 tracking-wide leading-relaxed animate-slide-up-1">
            AI-Powered Privacy Protection and Personally Identifiable Information (PII) Detection System
          </h2>

          {/* Description */}
          <p className="text-base text-gray-400 max-w-3xl mb-8 leading-relaxed font-normal animate-slide-up-2">
            DataShield helps organizations detect, analyze, mask, and protect sensitive personal information using Artificial Intelligence, Natural Language Processing, OCR, and privacy-preserving technologies while maintaining complete data confidentiality.
          </p>

          {/* Glowing CTA Button */}
          <div className="animate-slide-up-3 mb-12">
            <button
              onClick={handleEnter}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/25 hover:scale-105 active:scale-98 border border-indigo-400/20"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
              Enter DataShield
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Supported Formats Banner */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-gray-500 border border-gray-800/60 rounded-full px-6 py-2 bg-gray-950/20 backdrop-blur-sm">
            <span className="font-semibold text-gray-400">Supported Formats:</span>
            {['.txt', '.pdf', '.png', '.jpg', '.jpeg', '.webp'].map((f) => (
              <span key={f} className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-indigo-400 font-mono">{f}</span>
            ))}
          </div>
        </section>

        {/* Statistics section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Detection Accuracy", value: "99.8%", desc: "Advanced LLM & NER scoring" },
            { label: "Documents Scanned", value: "12,540+", desc: "Locally analyzed & audited" },
            { label: "Supported PII Types", value: "45+", desc: "Global regulatory classifications" },
            { label: "Offline Processing", value: "100%", desc: "Zero-data transfer system" }
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-cyan-500/10 bg-gray-900/40 backdrop-blur-md hover:border-cyan-500/20 transition-all duration-300 text-center">
              <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-1 font-mono">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-200 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.desc}</div>
            </div>
          ))}
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Enterprise Privacy Shield</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-xl mx-auto">High-performance security features designed for strict regulatory compliance and absolute file safety.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI Detection Engine",
                desc: "Harness deep NLP models to auto-classify and scores risks across complex tabular, text, and binary formats.",
                icon: (
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                title: "Layout-Preserving Redaction",
                desc: "Mask and black-out PDF segments while leaving core typography, fonts, tables, and spacing completely intact.",
                icon: (
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )
              },
              {
                title: "Ledger Audit Trails",
                desc: "Anchored cryptographic proof checks. Secure hash logs stored locally for end-to-end data processing audits.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                title: "100% Offline Privacy",
                desc: "Processes everything locally in the sandbox. Zero remote caching or cloud leaks for absolute safety.",
                icon: (
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              }
            ].map((feat, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-cyan-500/10 bg-gray-900/40 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300 flex flex-col gap-4">
                <div className="p-3 rounded-lg bg-gray-800/80 border border-gray-700 w-fit">{feat.icon}</div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors duration-200">{feat.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-grow">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How DataShield Works Pipeline */}
        <section id="pipeline" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">How DataShield Works</h2>
            <p className="text-gray-400 text-sm mt-2">Continuous local processing pipeline ensuring data remains encrypted and safe.</p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl mx-auto px-4">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500/10 via-indigo-500/40 to-purple-500/10 hidden md:block -z-10"></div>

            {[
              { step: "01", name: "Upload", desc: "Drag & drop secure files" },
              { step: "02", name: "OCR Process", desc: "Extract text from canvas/image" },
              { step: "03", name: "AI Detection", desc: "Detect NER & pattern entities" },
              { step: "04", name: "Risk Analysis", desc: "Compute severity exposure" },
              { step: "05", name: "Ledger Verify", desc: "Generate ledger hash receipt" },
              { step: "06", name: "Download", desc: "Get redacted safe copies" }
            ].map((node, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-800/40 bg-gray-900/60 backdrop-blur-md w-full md:w-36 shadow-lg shadow-black/10">
                <div className="w-8 h-8 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 mb-2 font-mono">{node.step}</div>
                <div className="text-xs font-bold text-white mb-1">{node.name}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{node.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Preview Mock */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">Visual Analytics Preview</h2>
            <p className="text-gray-400 text-sm mt-2">Live monitoring dashboard with granular risk distribution, compliance, and logs.</p>
          </div>

          <div className="p-4 rounded-2xl border border-cyan-500/10 bg-gray-900/30 backdrop-blur-lg shadow-2xl max-w-5xl mx-auto">
            {/* Mock Dashboard Window Frame */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-gray-800 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="text-[10px] text-gray-600 font-mono ml-4">https://app.datashield.local/dashboard</div>
            </div>

            {/* Mock UI Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 flex flex-col gap-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Privacy Risk Score</div>
                <div className="text-3xl font-bold text-green-400 font-mono">07 <span className="text-xs text-gray-600">/ 100</span></div>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 w-fit">✓ Status: Low Risk</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 flex flex-col justify-between">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">High Risk Entities</div>
                <div className="text-3xl font-bold text-red-400 font-mono">89</div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div className="bg-red-400 h-1 rounded-full w-[12%]"></div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-800/40 border border-gray-700/50 flex flex-col justify-between">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Compliance Status</div>
                <div className="text-3xl font-bold text-indigo-400 font-mono">94%</div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div className="bg-indigo-400 h-1 rounded-full w-[94%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose DataShield */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center py-6">
          <div className="space-y-6">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enterprise Ready</div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">Advanced Data Protection & Audits Tailored for Compliance</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              We empower compliance and security teams to scan, redact, and verify all file uploads within milliseconds. Perfect for legal, financial, and tech teams operating under strict GDPR, ISO, and DPDP mandates.
            </p>
            <div className="space-y-3">
              {[
                "Strict local sandbox architecture prevents document leaks",
                "Advanced AI models with multi-language entities matching",
                "Seamless export options for clean PDFs and structured logs"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-gray-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-cyan-500/10 bg-gray-900/20 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white">Trust & Compliance Standards</h3>
            <p className="text-xs text-gray-500">DataShield is built according to industry leading privacy protection baselines.</p>
            <div className="grid grid-cols-2 gap-3">
              {["GDPR Compliant", "ISO 27001 Ready", "HIPAA Aligned", "DPDP Framework"].map((rule, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-gray-800/30 border border-gray-800 text-center text-xs font-semibold text-indigo-300">
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="relative z-10 w-full border-t border-gray-900/60 bg-gray-950/40 backdrop-blur-md pt-12 pb-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-gradient-to-tr from-blue-600 to-indigo-600">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-white text-lg">DataShield</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">AI-powered personal identifiable information detection & smart redaction logs.</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Privacy Features</a></li>
              <li><a href="#pipeline" className="hover:text-white transition-colors">OCR & Redaction</a></li>
              <li><button onClick={handleEnter} className="hover:text-white transition-colors">Risk Analyzer</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Developers</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="https://github.com" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="https://github.com" className="hover:text-white transition-colors">API Integration</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Certifications</h4>
            <div className="flex gap-2 flex-wrap">
              {["SOC2 Type II", "ISO 27001", "HIPAA", "GDPR"].map((cert) => (
                <span key={cert} className="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded border border-indigo-500/20 bg-indigo-500/5 text-indigo-300 font-mono uppercase">{cert}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-900/60 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} DataShield Security. All rights reserved. Locally Secured Processing.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
