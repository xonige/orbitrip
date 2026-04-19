import React from 'react';

const SeniorBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#0f172a]">
      {/* Primary Brand Glow (Orange) */}
      <div
        className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] rounded-full bg-[#f27c38] opacity-[0.07] blur-[120px]"
      />

      {/* Secondary Depth Glow (Slate/Blue) */}
      <div
        className="absolute -bottom-[10%] -left-[5%] w-[70%] h-[70%] rounded-full bg-[#334155] opacity-20 blur-[100px]"
      />

      {/* Subtle Accent Glow */}
      <div
        className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#f27c38] opacity-[0.03] blur-[80px]"
      />

      {/* SVG Grain Texture Filter (The Senior Touch) */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* Bottom Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f172a]/80" />
    </div>
  );
};

export default SeniorBackground;
