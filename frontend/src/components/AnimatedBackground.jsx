import { useEffect, useState } from "react";

export default function AnimatedBackground() {
  const [particles, setParticles] = useState([]);

  // Generate lightweight, subtle particles (maximum 30 for performance)
  useEffect(() => {
    const generatedParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 3, // 3px to 9px, smaller and more subtle
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 15 + 15}s`, // 15s to 30s for a very slow, calm flow
      opacity: Math.random() * 0.15 + 0.05, // low opacity (5% to 20%) to keep it background-only
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none bg-gray-950"
      style={{ zIndex: 0 }}
    >
      {/* Background Glowing Gradients (Soft, low opacity blue/purple circles) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft glowing purple circle - Top Left */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] animate-pulse duration-[10000ms]"></div>
        
        {/* Soft glowing blue circle - Bottom Right */}
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[130px] animate-pulse duration-[14000ms]"></div>
        
        {/* Cybersecurity Grid Overlay (Fixed pattern with a subtle scanning laser grid line) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]">
          {/* Subtle horizontal scanning line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent animate-scanline pointer-events-none"></div>
        </div>
      </div>

      {/* Floating Particles - Very subtle and performance-friendly */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-indigo-500/40 animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              opacity: particle.opacity,
              boxShadow: `0 0 8px 1px rgba(99, 102, 241, 0.25)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
