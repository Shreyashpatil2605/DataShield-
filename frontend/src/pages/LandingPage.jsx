import { useNavigate } from "react-router-dom";

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
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              Docs
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center py-16 md:py-24">
        {/* Animated Central Security Illustration */}
        <div className="relative mb-8 group animate-fade-in-down">
          {/* Glassmorphic Background Blur Ring */}
          <div className="absolute inset-0 -m-6 rounded-full bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
          
          <div className="relative p-6 rounded-3xl border border-gray-800/40 bg-gray-900/30 backdrop-blur-xl shadow-2xl flex items-center justify-center max-w-[200px] mx-auto">
            {/* Tech AI & Shield Illustration */}
            <svg className="w-24 h-24 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] animate-float-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              {/* Outer tech circuit circle */}
              <circle cx="12" cy="12" r="11" strokeDasharray="3 3" className="stroke-indigo-500/20 animate-spin-slow" />
              {/* Shield */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} className="stroke-indigo-400" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              {/* Internal Circuit Lines */}
              <path strokeLinecap="round" strokeWidth={1.5} className="stroke-blue-400" d="M12 6v3m-3 3h1m4 0h1" />
              {/* Neural Node Points */}
              <circle cx="12" cy="9" r="1" fill="#818cf8" />
              <circle cx="10" cy="12" r="1" fill="#60a5fa" />
              <circle cx="14" cy="12" r="1" fill="#60a5fa" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in">
          <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-350">
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
        <p className="text-base text-gray-400 max-w-3xl mb-12 leading-relaxed font-normal animate-slide-up-2">
          DataShield helps organizations detect, analyze, mask, and protect sensitive personal information using Artificial Intelligence, Natural Language Processing, OCR, and privacy-preserving technologies while maintaining complete data confidentiality.
        </p>

        {/* Glowing CTA Button */}
        <div className="animate-slide-up-3">
          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-xl shadow-indigo-600/10 hover:shadow-indigo-500/25 hover:scale-105 active:scale-98 border border-indigo-400/20"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
            
            Enter DataShield
            
            {/* SVG Shield / Arrow Icon */}
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full text-center py-6 text-xs text-gray-600 border-t border-gray-900/40 bg-gray-950/10 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} DataShield Security. All rights reserved. Locally Secured Processing.</p>
      </footer>
    </div>
  );
}
