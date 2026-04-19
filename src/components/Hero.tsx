// Version History (File Level):
// v26.8.0 - Senior UI Refresh
// v26.3.0 - Senior Background Implementation

import { MapPin, Droplets, Clock, Camera, Zap } from 'lucide-react';
import { Language } from '../types';
import SeniorBackground from './SeniorBackground';

interface HeroProps {
  language?: Language;
  searchSlot?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ language = 'en', searchSlot }) => {
  const isEn = language === 'en';

  return (
    <div className="relative min-h-[100vh] md:min-h-[100vh] flex flex-col justify-center overflow-hidden">
      {/* LAYER 1: Senior Programmatic Background */}
      <SeniorBackground />

      {/* LAYER 3: Minimal Vignette (Overlay is now handled in SeniorBackground) */}
      <div className="absolute inset-0 z-[1] bg-black/10"></div>

      {/* LAYER 4: Bottom gradient fade into page body */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] z-[2] bg-gradient-to-t from-slate-50 to-transparent"></div>

      {/* LAYER 5: Content (Text + Form) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 lg:py-20">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 items-center md:mt-0">
          
          {/* Left Content (Brand Messaging) */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-4 md:space-y-8 md:col-span-7">
            <div 
              className="hidden md:inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/20 shadow-xl"
            >
              <MapPin size={18} className="text-[#f27c38]" />
              <span className="text-xs md:text-sm font-black tracking-[0.2em] uppercase text-white">
                {isEn ? "Elite Private Transfers in Georgia" : "Элитные частные трансферы в Грузии"}
              </span>
            </div>

            <h1 
              className="text-3xl sm:text-4xl md:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tighter text-white uppercase italic text-center md:text-left"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
            >
              {isEn ? 'Reliable & Direct' : 'Надежно и Прямо'} <br />
              <span className="text-[#f27c38]" style={{ filter: 'drop-shadow(0 10px 40px rgba(242,124,56,0.5))' }}>
                {isEn ? 'Transfers in Georgia' : 'Трансферы в Грузии'}
              </span>
            </h1>

            <p className="text-[10px] sm:text-xs md:text-xl text-slate-200/90 font-medium max-w-2xl leading-relaxed">
               {isEn ? 'Served by verified drivers — real customer reviews on profiles.' : 'Обслуживается проверенными водителями — реальные отзывы клиентов в профилях.'}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 lg:gap-6 pt-2 md:pt-4">
               {[
                 { icon: <Droplets size={16} className="text-blue-400" />, label: isEn ? 'Premium Water' : 'Вода' },
                 { icon: <Clock size={16} className="text-amber-400" />, label: isEn ? 'Free Waiting' : 'Ожидание' },
                 { icon: <Camera size={16} className="text-green-400" />, label: isEn ? 'Scenic Stops' : 'Остановки' },
                 { icon: <Zap size={16} className="text-[#f27c38]" />, label: isEn ? 'Fixed Pricing' : 'Цена' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all cursor-default">
                   {item.icon}
                   <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest">{item.label}</span>
                 </div>
               ))}
            </div>
            
            <div className="w-full flex justify-center md:justify-start pt-2">
              <a href="/excursions" className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-[#f27c38] hover:border-[#f27c38] border border-white/20 rounded-xl transition-all shadow-lg backdrop-blur-md">
                 <span className="text-white font-black text-[11px] md:text-sm uppercase italic tracking-tighter">
                   {isEn ? "Private Excursions" : "Авторские Экскурсии"}
                 </span>
                 <svg className="w-4 h-4 text-white transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Right Content (The Search Form) */}
          <div className="order-1 md:order-2 md:col-span-5 w-full flex flex-col gap-4 mt-2 mb-2 md:mt-0">
            <div className="w-full">
               {searchSlot}
            </div>
          </div>

        </div>
      </div>
    </div>

  );
};

export default Hero;