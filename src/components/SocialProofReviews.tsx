import React, { useRef, useState } from 'react';
import { Star, Play, Volume2 } from 'lucide-react';

import { Language } from '../types';

const VideoCard = ({ src, label, isEn }: { src: string; label: string; isEn: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleMouseEnter = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = false;
    vid.currentTime = 0;
    vid.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleMouseLeave = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    vid.muted = true;
    vid.currentTime = 0;
    setIsPlaying(false);
  };

  // Mobile: tap to toggle play/pause
  const handleTouchStart = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.muted = false;
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      vid.muted = true;
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="relative rounded-[2rem] overflow-hidden aspect-[9/16] w-full max-w-[280px] bg-slate-100 shadow-xl border-4 border-white transform hover:scale-[1.02] transition-transform cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover" 
        loop
        muted
        playsInline
        preload="none"
      />

      {/* Play icon overlay — visible when NOT playing */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300"
        style={{ opacity: isPlaying ? 0 : 1, pointerEvents: 'none' }}
      >
        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Play size={28} className="text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Sound indicator — visible when playing */}
      <div 
        className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 z-10 pointer-events-none transition-opacity duration-300"
        style={{ opacity: isPlaying ? 1 : 0 }}
      >
        <Volume2 size={14} className="text-white animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-wider">Sound On</span>
      </div>

      {/* Verified badge */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm z-10 pointer-events-none">
        <Star size={14} className="fill-amber-400 text-amber-400" />
        <span className="text-xs font-black text-slate-900">{isEn ? 'Verified Review' : 'Проверено'}</span>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-bold z-10 pointer-events-none drop-shadow-md">
        {label}
      </div>
    </div>
  );
};

const SocialProofReviews = ({ language }: { language: Language }) => {
  const isEn = language === Language.EN;
  
  const reviews = [
    { 
        title: isEn ? "Excellent Service" : "Отличный сервис", 
        body: isEn ? "Driver was on time and very professional. We felt extremely safe." : "Водитель приехал вовремя, был вежлив. Очень профессионально.", 
        name: "Sarah M.", 
        date: isEn ? "March 2026" : "Март 2026" 
    },
    { 
        title: isEn ? "Smooth Transfer" : "Комфортный трансфер", 
        body: isEn ? "Clean car, good driving, and free stops for pictures. Highly recommend!" : "Чистая машина, аккуратное вождение. Рекомендую всем!", 
        name: "Alexey V.", 
        date: isEn ? "March 2026" : "Март 2026" 
    },
    { 
        title: isEn ? "Best price" : "Лучшая цена", 
        body: isEn ? "Cheaper than standard taxis and much better experience. No hidden fees." : "Дешевле, чем такси, и никаких скрытых платежей. Очень удобно.", 
        name: "John D.", 
        date: isEn ? "April 2026" : "Апрель 2026" 
    }
  ];

  return (
    <div className="w-full bg-white py-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">
              {isEn ? 'Trusted by Travelers' : 'Нам доверяют путешественники'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span className="ml-2 font-black text-slate-800 text-xl">4.9/5</span>
          </div>
          <p className="mt-2 text-slate-500 font-medium tracking-wide">
             {isEn ? 'Based on 415+ verified reviews' : 'На основе 415+ проверенных отзывов'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <div key={idx} className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex text-amber-400 mb-4 gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-current" />)}
              </div>
              <h3 className="font-black text-lg text-slate-900 mb-2">{r.title}</h3>
              <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">{r.body}</p>
              <div className="flex justify-between items-center text-xs text-slate-500 font-black tracking-wider uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                    {r.name.charAt(0)}
                  </div>
                  <span>{r.name}</span>
                </div>
                <span>{r.date}</span>
              </div>
            </div>
          ))}

          {/* AI VIDEO TESTIMONIALS — HOVER TO PLAY WITH SOUND */}
          <div className="md:col-span-3 mt-8">
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">
               {isEn ? "Watch User Stories" : "Истории Наших Клиентов"}
            </h3>
            <p className="text-sm text-slate-500 text-center mb-8 font-medium">
               {isEn ? "Hover to play with sound" : "Наведите мышку для воспроизведения"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
               <VideoCard src="/video/review1.mp4" label="OrbiTrip — Kutaisi" isEn={isEn} />
               <VideoCard src="/video/review2.mp4" label="OrbiTrip Transfer" isEn={isEn} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SocialProofReviews;
