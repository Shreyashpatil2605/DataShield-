import { useEffect, useRef } from "react";

export default function SpeedometerGauge({ score, level }) {
  const canvasRef = useRef(null);

  // Color mapping for risk levels
  const levelColors = {
    safe: "#22c55e", // green
    low: "#facc15", // yellow
    medium: "#fb923c", // orange
    high: "#ef4444", // red
    critical: "#991b1b", // dark red
  };

  const getLevelColor = (s) => {
    if (s <= 20) return levelColors.safe;
    if (s <= 40) return levelColors.low;
    if (s <= 60) return levelColors.medium;
    if (s <= 80) return levelColors.high;
    return levelColors.critical;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.7;
    const radius = 90;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw outer circle border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Draw colored gauge segments
    const segments = [
      { color: "#22c55e", start: 0, end: 20, label: "Safe" },
      { color: "#facc15", start: 20, end: 40, label: "Low" },
      { color: "#fb923c", start: 40, end: 60, label: "Medium" },
      { color: "#ef4444", start: 60, end: 80, label: "High" },
      { color: "#991b1b", start: 80, end: 100, label: "Critical" },
    ];

    segments.forEach((segment) => {
      const startAngle = Math.PI + (segment.start / 100) * Math.PI;
      const endAngle = Math.PI + (segment.end / 100) * Math.PI;

      // Draw segment
      ctx.fillStyle = segment.color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
    });

    // Draw outer ring
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Draw tick marks and labels
    for (let i = 0; i <= 100; i += 20) {
      const angle = Math.PI + (i / 100) * Math.PI;
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + 12);
      const y2 = centerY + Math.sin(angle) * (radius + 12);

      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw number labels
      const labelX = centerX + Math.cos(angle) * (radius + 28);
      const labelY = centerY + Math.sin(angle) * (radius + 28);
      ctx.fillStyle = "#374151";
      ctx.font = "bold 13px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i, labelX, labelY);
    }

    // Draw needle
    const needleAngle = Math.PI + (score / 100) * Math.PI;
    const needleLength = radius * 0.75;
    const needleX = centerX + Math.cos(needleAngle) * needleLength;
    const needleY = centerY + Math.sin(needleAngle) * needleLength;

    // Needle glow effect
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw thick bold black needle
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(needleX, needleY);
    ctx.stroke();

    // Draw needle highlight (lighter shade on top)
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - 2, centerY - 2);
    ctx.lineTo(needleX - 2, needleY - 2);
    ctx.stroke();

    // Draw center circle
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Draw inner circle - larger and more visible
    ctx.fillStyle = getLevelColor(score);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw score display at bottom
    ctx.fillStyle = getLevelColor(score);
    ctx.font = "bold 56px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(score, centerX, centerY + 35);

    // Draw score label
    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillText("Risk Score", centerX, centerY + 100);
  }, [score, level]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={300}
        height={280}
        className="drop-shadow-lg"
      />
      <div className="flex gap-3 justify-center flex-wrap text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-gray-600">Safe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <span className="text-gray-600">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-gray-600">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-900" />
          <span className="text-gray-600">Critical</span>
        </div>
      </div>
    </div>
  );
}
