import { useCallback, useState, useEffect } from "react";

export default function DropZone({ onFile, loading }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dynamic progress bar increments during backend analysis
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const inc = Math.floor(Math.random() * 15) + 5; // increment by 5 to 20
        return Math.min(98, prev + inc);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFile(file);
  };

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
        dragging
          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 scale-[1.01]"
          : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-850/60"
      }`}
    >
      <input
        type="file"
        className="hidden"
        accept=".txt,.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.webp"
        onChange={handleChange}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-4 max-w-sm mx-auto">
          {/* Glowing loader */}
          <div className="relative">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <div className="absolute inset-0 border border-cyan-400/10 rounded-full blur-[2px]" />
          </div>
          
          <div className="space-y-1 w-full">
            <p className="text-sm text-gray-200 font-bold tracking-tight">Analyzing File Sandbox</p>
            <p className="text-[10px] text-gray-400">Deep inspecting NER patterns & scanning layout...</p>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-cyan-400 font-bold px-1">
              <span>PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-850 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Large Secure Shield upload icon */}
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-150">
              Drag & Drop file to initiate secure scan
            </p>
            <p className="text-xs text-gray-500">
              Or click to browse from local workstation directories
            </p>
          </div>

          {/* Supported Format Tags */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-[10px]">
            {["PDF", "TEXT", "PNG", "JPG", "WEBP"].map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded border border-gray-800 bg-gray-950/40 text-gray-500 font-mono tracking-wider">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </label>
  );
}
