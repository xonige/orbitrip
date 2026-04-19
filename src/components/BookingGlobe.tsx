import React, { useState, useEffect } from 'react';

const BookingGlobe: React.FC = () => {
  const [pings, setPings] = useState<{ id: number; x: number; y: number; city: string }[]>([]);
  
  const CITIES = [
    { name: 'London', x: 48, y: 35 },
    { name: 'Berlin', x: 52, y: 38 },
    { name: 'Rome', x: 52, y: 45 },
    { name: 'Dubai', x: 62, y: 55 },
    { name: 'Tel Aviv', x: 58, y: 50 },
    { name: 'New York', x: 25, y: 40 },
    { name: 'Paris', x: 49, y: 38 },
    { name: 'Moscow', x: 58, y: 32 },
    { name: 'Warsaw', x: 54, y: 36 },
  ];

  const GEORGIA_POS = { x: 56, y: 44 };

  useEffect(() => {
    const interval = setInterval(() => {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const newPing = {
        id: Date.now(),
        x: city.x,
        y: city.y,
        city: city.name
      };
      
      setPings(prev => [...prev.slice(-4), newPing]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 group pointer-events-none select-none">
      {/* 360-degree Atmospheric Glow */}
      <div 
        className="absolute inset-0 bg-amber-400/30 rounded-full blur-[60px]" 
      />
      
      {/* The Globe Sphere */}
      <div className="relative w-full h-full rounded-full border-[6px] border-white/20 shadow-[0_0_100px_rgba(251,191,36,0.3)] overflow-hidden bg-slate-950 group-hover:scale-105 transition-transform duration-1000">
        
        {/* Deep Oceans Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#1e293b_0%,_#0f172a_100%)] opacity-80" />

        {/* Animated Rotating Map Texture (Live Look) */}
        <div 
          className="absolute inset-0 w-[400%] h-full opacity-70 mix-blend-screen"
          style={{ 
            backgroundImage: `url('/minimalist_world_map_light_amber_1775218388516.png')`,
            backgroundSize: '25% 100%',
          }}
        />

        {/* Sphere Depth / Lighting */}
        <div className="absolute inset-0 rounded-full shadow-[inset_-30px_-30px_60px_rgba(0,0,0,0.8),inset_20px_20px_50px_rgba(255,255,255,0.1)]" />
        
        {/* Pulsing Atmosphere Edge */}
        <div 
           className="absolute inset-0 rounded-full border border-amber-500/30"
        />

        {/* Dynamic Booking Pings & Animated Arcs */}
        <>
          {pings.map((p) => (
            <React.Fragment key={p.id}>
              {/* Origin Liquid Ping */}
              <div className="absolute w-4 h-4 -translate-x-2 -translate-y-2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                  <div
                    className="absolute inset-0 bg-amber-400 rounded-full"
                  />
                  <div className="absolute inset-[30%] bg-amber-400 rounded-full shadow-[0_0_15px_#fbbf24]" />
              </div>
              
              {/* Transit Arc to Georgia */}
              <svg 
                className="absolute inset-0 w-full h-full"
              >
                <path
                  d={`M ${p.x}% ${p.y}% Q ${(p.x + GEORGIA_POS.x)/2}% ${(p.y + GEORGIA_POS.y)/2 - 15}% ${GEORGIA_POS.x}% ${GEORGIA_POS.y}%`}
                  fill="none"
                  stroke="url(#arcGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="1 5"
                />
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </React.Fragment>
          ))}
        </>

        {/* Georgia Destination Pulse (The Hub) */}
        <div className="absolute left-[56%] top-[44%] -translate-x-1/2 -translate-y-1/2">
            <div 
               className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_20px_#34d399]"
            />
            <div className="absolute inset-0 bg-emerald-400 rounded-full" />
        </div>

        {/* Real-time Status Badge */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 shadow-2xl">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Global Network Active</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookingGlobe;
