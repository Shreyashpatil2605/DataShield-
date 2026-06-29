import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { exportService } from "../services/exportService";

export default function ExportMenu({
  redactedText,
  filename,
  redactedPdfId,
  entities = [],
  decision = {},
}) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportFormat, setExportFormat] = useState("");
  const [coords, setCoords] = useState({ top: "auto", bottom: "auto", left: 0, openUp: false });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Calculate viewport boundaries and set smart floating position
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 310; 
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < dropdownHeight;

      const dropdownWidth = 224; 
      let leftPos = rect.right - dropdownWidth;
      if (leftPos < 8) {
        leftPos = 8; 
      } else if (leftPos + dropdownWidth > window.innerWidth - 8) {
        leftPos = window.innerWidth - dropdownWidth - 8;
      }

      setCoords({
        top: openUp ? "auto" : rect.bottom + 8,
        bottom: openUp ? window.innerHeight - rect.top + 8 : "auto",
        left: leftPos,
        openUp,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const triggerToast = (title) => {
    setToast({
      title: `✅ ${title} exported successfully`,
      body: "Saved to Downloads",
      subtext: "Open Folder"
    });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleExport = (format) => {
    setIsOpen(false);
    setExportFormat(format);
    setIsExporting(true);
    setExportProgress(0);

    // Simulate progress bar loading (0% to 100% over 800ms)
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress >= 100) {
        setExportProgress(100);
        clearInterval(interval);
        
        // Trigger the actual download after a tiny delay
        setTimeout(async () => {
          setIsExporting(false);
          try {
            if (format === "PDF") {
              await exportService.exportPDF(redactedText, filename, redactedPdfId);
              triggerToast("PDF");
            } else if (format === "TXT") {
              const riskVal = decision?.risk?.level || "low";
              exportService.exportTXT(redactedText, filename, riskVal, entities.length);
              triggerToast("TXT");
            } else if (format === "JSON") {
              exportService.exportJSON(filename, decision, entities, redactedText);
              triggerToast("JSON");
            } else if (format === "CSV") {
              exportService.exportCSV(filename, entities);
              triggerToast("CSV");
            } else if (format === "Report") {
              exportService.exportReport(filename, decision, entities, redactedText);
              triggerToast("Report");
            }
          } catch (err) {
            console.error(`${format} export failed:`, err);
          }
        }, 200);
      } else {
        setExportProgress(currentProgress);
      }
    }, 80);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 border border-emerald-500/20"
      >
        <span>📥 Export</span>
        <span className="text-[10px] transform transition-transform duration-200">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: coords.top !== "auto" ? `${coords.top}px` : "auto",
            bottom: coords.bottom !== "auto" ? `${coords.bottom}px` : "auto",
            left: `${coords.left}px`,
            maxHeight: "310px",
            overflowY: "auto",
          }}
          className={`w-56 rounded-xl border p-2 shadow-2xl z-50 backdrop-blur-xl transition-all duration-200 ${
            theme === "dark"
              ? "bg-gray-900/90 border-cyan-500/10 text-gray-200"
              : "bg-white border-gray-200 text-gray-700"
          }`}
        >
          {/* Active formats */}
          <div className="space-y-1">
            {[
              { id: "PDF", label: "Export as PDF", icon: "📄" },
              { id: "TXT", label: "Export as TXT", icon: "📝" },
              { id: "JSON", label: "Export as JSON", icon: "📊" },
              { id: "CSV", label: "Export as CSV", icon: "📈" },
              { id: "Report", label: "Export Analysis Report", icon: "📋" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleExport(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors duration-200 ${
                  theme === "dark"
                    ? "hover:bg-cyan-500/10 hover:text-white"
                    : "hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={`my-2 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-150"}`} />

          {/* Coming Soon / Disabled formats */}
          <div className="space-y-1">
            {[
              { label: "Excel (.xlsx)", icon: "📊" },
              { label: "Word (.docx)", icon: "📝" },
              { label: "Zip Archive (.zip)", icon: "📦" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-500 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                  Soon
                </span>
                
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-950 text-white text-[9px] font-bold px-2 py-1 rounded border border-gray-800 shadow-xl whitespace-nowrap z-50">
                  Coming Soon
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preparing Export Progress Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-gray-950/75 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-gray-900 border border-cyan-500/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-white tracking-wide">Preparing Export...</h3>
              <p className="text-[11px] text-gray-500">Compiling your secured {exportFormat} data</p>
            </div>
            
            {/* Progress Bar Container */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex justify-end text-[10px] font-mono text-gray-400">
                {exportProgress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Multi-line Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up-1">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-gray-900/95 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5 min-w-[260px] text-left">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white tracking-wide">{toast.title}</span>
              <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
              <span>{toast.body}</span>
              <span className="text-emerald-400 hover:underline cursor-pointer font-bold">{toast.subtext}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
