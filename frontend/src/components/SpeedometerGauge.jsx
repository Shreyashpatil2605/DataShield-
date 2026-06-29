import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function SpeedometerGauge({ score, level }) {
  const { theme } = useTheme();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setAnimatedScore(Math.floor(easeProgress * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(score);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Color mapping for risk levels
  const levelColors = {
    safe: "stroke-emerald-500 text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    low: "stroke-yellow-400 text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    medium: "stroke-orange-500 text-orange-400 border-orange-500/20 bg-orange-500/5",
    high: "stroke-red-500 text-red-400 border-red-500/20 bg-red-500/5",
    critical: "stroke-rose-700 text-rose-500 border-rose-500/20 bg-rose-500/5",
  };

  const currentLevelClass = levelColors[level] || levelColors.safe;

  // Circular progress calculations
  const radius = 70;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
      {/* SVG Circular Progress Ring */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${
              theme === "dark" ? "stroke-gray-800" : "stroke-gray-200"
            }`}
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Animated Glow layer (dark mode only) */}
          {theme === "dark" && (
            <circle
              cx="80"
              cy="80"
              r={radius}
              className={`${currentLevelClass.split(" ")[0]} opacity-40 blur-[4px]`}
              strokeWidth={stroke + 2}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
          {/* Active Progress Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${currentLevelClass.split(" ")[0]} transition-all duration-100`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Text Indicator */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tighter ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            {animatedScore}%
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            Risk Index
          </span>
        </div>
      </div>

      {/* Cyber Security Stats Panel */}
      <div className="grid grid-cols-2 gap-4 flex-1 w-full max-w-xs">
        {[
          { label: "Protection Level", value: String(level).toUpperCase(), color: currentLevelClass.split(" ")[1] },
          { label: "Blocked Uploads", value: "3 Events", color: "text-rose-400" },
          { label: "Detection Accuracy", value: "99.8%", color: "text-blue-400 font-mono" },
          { label: "Compliance Score", value: "94%", color: "text-purple-400 font-mono" }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              theme === "dark" ? "bg-gray-950/40 border-gray-800" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
              theme === "dark" ? "text-gray-500" : "text-gray-400"
            }`}>
              {item.label}
            </div>
            <div className={`text-sm font-extrabold ${item.color}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
