
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Video, X } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onToolSelect: (tool: string) => void;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  isLoggedIn?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  language, 
  setLanguage, 
  onToolSelect, 
  currentLocation, 
  onLocationChange, 
  isLoggedIn = false 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tool: string) => {
      onToolSelect(tool);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = (lang: Language) => {
      setLanguage(lang);
      setIsMobileMenuOpen(false);
  };

  const isEn = language === Language.EN;

  return (
    <>
    <header 
        className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-500 ${
            isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xl py-3 border-b border-slate-100' 
            : 'bg-black/10 backdrop-blur-[2px] shadow-[0_1px_20px_rgba(0,0,0,0.1)] py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo — Premium typographic design */}
          <div 
            className="flex items-center cursor-pointer group select-none relative z-50" 
            onClick={() => handleNavClick('HOME')}
          >
            <div className="flex items-center gap-3">
              {/* Orbitrip Sleek MapPin Logo */}
              <div className="relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" className={`transition-colors duration-500 ${isScrolled ? 'fill-[var(--primary)]' : 'fill-white'}`} />
                  <path d="M18 9C14.6863 9 12 11.6863 12 15C12 19.5 18 26 18 26C18 26 24 19.5 24 15C24 11.6863 21.3137 9 18 9Z" className={`transition-colors duration-500 ${isScrolled ? 'fill-white' : 'fill-[var(--primary)]'}`} />
                  <circle cx="18" cy="15" r="2.5" className={`transition-colors duration-500 ${isScrolled ? 'fill-[var(--primary)]' : 'fill-white'}`} />
                </svg>
              </div>
              <div className="flex flex-col ml-0.5">
                <span className={`text-[26px] font-black tracking-tighter leading-none transition-colors duration-500 ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                  ORBI<span className="text-[var(--primary)]">TRIP</span>
                </span>
                <span className={`text-[8px] font-black uppercase tracking-[0.45em] leading-none mt-1 transition-colors duration-500 ${isScrolled ? 'text-slate-400' : 'text-white/70'}`}>
                  {language === Language.EN ? 'Georgia Transfers' : language === Language.RU ? 'Трансферы по Грузии' : 'Грузиядағы трансферлер'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className={`hidden md:flex items-center space-x-8 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors ${isScrolled ? 'text-gray-500' : 'text-white/80'}`}>
              <button onClick={() => handleNavClick('HOME')} className="hover:text-[var(--primary)] transition-colors py-1 border-b-2 border-transparent hover:border-[var(--primary)] outline-none">
                  {language === Language.EN ? 'Transfer' : language === Language.RU ? 'ТРАНСФЕР' : 'ТРАНСФЕР'}
              </button>
 
               <button onClick={() => handleNavClick('EXCURSIONS')} className="hover:text-amber-500 transition-colors py-1 border-b-2 border-transparent hover:border-amber-500 outline-none flex items-center gap-1">
                  {language === Language.EN ? 'Excursions' : language === Language.RU ? 'ЭКСКУРСИИ' : 'ЭКСКУРСИЯЛАР'}
                  <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-1">NEW</span>
              </button>
 
               <button onClick={() => handleNavClick('BLOG')} className="hover:text-[var(--primary)] transition-colors py-1 border-b-2 border-transparent hover:border-[var(--primary)] outline-none">
                  {language === Language.EN ? 'Blog' : language === Language.RU ? 'БЛОГ' : 'БЛОГ'}
              </button>
 
               <button onClick={() => setIsLiveOpen(true)} className="flex items-center gap-1.5 hover:text-rose-500 transition-colors py-1 border-b-2 border-transparent hover:border-rose-500 text-rose-400 outline-none">
                  <Video size={14} className="animate-pulse" />
                  {language === Language.EN ? 'Orbi Live' : language === Language.RU ? 'Орби Лайв' : 'Орби Лайв'}
              </button>
 
               <button onClick={() => handleNavClick('MY_BOOKINGS')} className="hover:text-[var(--primary)] transition-colors py-1 border-b-2 border-transparent hover:border-[var(--primary)] text-[var(--primary)] outline-none">
                  {language === Language.EN ? 'My Trips' : language === Language.RU ? 'МОИ ПОЕЗДКИ' : 'МЕНІҢ САПАРЛАРЫМ'}
              </button>
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
              
              {/* Language Switcher — Minimal pill with 3 options */}
              <div className={`relative flex p-0.5 rounded-full w-[108px] h-8 overflow-hidden transition-colors ${isScrolled ? 'bg-gray-100 border border-gray-200' : 'bg-white/15 border border-white/20 backdrop-blur-sm'}`}>
                  <div 
                      className={`absolute top-0.5 bottom-0.5 w-[34px] bg-[var(--primary)] rounded-full shadow-sm transition-transform duration-150 ease-out`}
                      style={{ transform: `translateX(${language === Language.EN ? 0 : language === Language.RU ? 35 : 70}px)` }}
                  ></div>
                  
                  <button 
                      onClick={() => toggleLanguage(Language.EN)}
                      className={`relative z-10 flex-1 text-[10px] font-semibold transition-colors duration-300 ${language === Language.EN ? 'text-white' : isScrolled ? 'text-gray-400' : 'text-white/60'}`}
                  >
                      EN
                  </button>

                  <button 
                      onClick={() => toggleLanguage(Language.RU)}
                      className={`relative z-10 flex-1 text-[10px] font-semibold transition-colors duration-300 ${language === Language.RU ? 'text-white' : isScrolled ? 'text-gray-400' : 'text-white/60'}`}
                  >
                      RU
                  </button>

                  <button 
                      onClick={() => toggleLanguage(Language.KZ)}
                      className={`relative z-10 flex-1 text-[10px] font-semibold transition-colors duration-300 ${language === Language.KZ ? 'text-white' : isScrolled ? 'text-gray-400' : 'text-white/60'}`}
                  >
                      KZ
                  </button>
              </div>
              
              <button 
                  onClick={() => handleNavClick(isLoggedIn ? 'DRIVER_DASHBOARD' : 'ADMIN_LOGIN')}
                  className="text-[10px] font-black text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] transition-all px-5 py-2.5 rounded-full uppercase tracking-[0.12em] shadow-md shadow-[var(--primary)]/20 active:scale-95"
              >
                  {isLoggedIn ? (language === Language.EN ? 'Dashboard' : language === Language.RU ? 'КАБИНЕТ' : 'ЖЕКЕ КАБИНЕТ') : (language === Language.EN ? 'Sign in' : language === Language.RU ? 'Войти' : 'Кіру')}
              </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={language === Language.EN ? "Toggle Menu" : language === Language.RU ? "Открыть меню" : "Мәзірді ашу"}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${isScrolled ? 'text-slate-900 bg-white shadow-sm border border-slate-200' : 'text-[var(--primary)] bg-white shadow-xl'}`}
             >
                 {isMobileMenuOpen ? (
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 ) : (
                   <div className="flex flex-col gap-1.5 items-end justify-center">
                      <div className="w-7 h-[3px] bg-current rounded-full"></div>
                      <div className="w-5 h-[3px] bg-current rounded-full"></div>
                      <div className="w-7 h-[3px] bg-current rounded-full"></div>
                   </div>
                 )}
             </button>
          </div>
        </div>
      </div>

    </header>

      {/* Mobile Menu — Extracted outside of header to avoid backdrop-blur containing block issues */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[10000] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div 
            className="absolute top-0 right-0 w-[85%] max-w-[360px] h-[100dvh] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <span className="text-lg font-black text-slate-900 tracking-tight">ORBI<span className="text-[var(--primary)]">TRIP</span></span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={language === Language.EN ? "Close Menu" : language === Language.RU ? "Закрыть меню" : "Мәзірді жабу"}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-90 transition-transform"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col px-6 pt-6">
              <button onClick={() => handleNavClick('HOME')} className="text-left py-4 border-b border-slate-100 flex justify-between items-center outline-none">
                <span className="text-lg font-black text-slate-900">{language === Language.EN ? 'Transfers' : language === Language.RU ? 'Трансферы' : 'Трансферлер'}</span>
                <span className="text-[var(--primary)] text-xl">→</span>
              </button>

              <button onClick={() => handleNavClick('EXCURSIONS')} className="text-left py-4 border-b border-slate-100 flex justify-between items-center outline-none">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-500 uppercase italic tracking-tighter">{language === Language.EN ? 'Excursions' : language === Language.RU ? 'Экскурсии' : 'Экскурсиялар'}</span>
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg">NEW</span>
                </div>
                <span className="text-[var(--primary)] text-xl">→</span>
              </button>

              <button onClick={() => handleNavClick('BLOG')} className="text-left py-4 border-b border-slate-100 flex justify-between items-center outline-none">
                <span className="text-lg font-black text-slate-900">{language === Language.EN ? 'Blog' : language === Language.RU ? 'Блог' : 'Блог'}</span>
                <span className="text-[var(--primary)] text-xl">→</span>
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsLiveOpen(true); }} 
                className="text-left py-4 border-b border-slate-100 flex justify-between items-center group"
              >
                <div className="flex items-center gap-2 text-rose-500">
                    <Video size={20} className="animate-pulse group-active:scale-95 transition-transform" />
                    <span className="text-lg font-black text-rose-500 tracking-tight">{language === Language.EN ? 'Orbi Live' : language === Language.RU ? 'Орби Лайв' : 'Орби Лайв'}</span>
                </div>
                <span className="text-rose-500 text-xl">→</span>
              </button>
              <button onClick={() => handleNavClick('MY_BOOKINGS')} className="text-left py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-lg font-black text-[var(--primary)]">{language === Language.EN ? 'My Trips' : language === Language.RU ? 'Мои Поездки' : 'Менің сапарларым'}</span>
                <span className="text-[var(--primary)] text-xl">→</span>
              </button>
            </nav>

            {/* Language Switcher */}
            <div className="px-6 pt-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {language === Language.EN ? 'Language' : language === Language.RU ? 'Язык' : 'Тіл'}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleLanguage(Language.EN)} 
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${language === Language.EN ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'bg-slate-100 text-slate-400'}`}
                >EN</button>

                <button 
                  onClick={() => toggleLanguage(Language.RU)} 
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${language === Language.RU ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'bg-slate-100 text-slate-400'}`}
                >RU</button>

                <button 
                  onClick={() => toggleLanguage(Language.KZ)} 
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${language === Language.KZ ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'bg-slate-100 text-slate-400'}`}
                >KZ</button>
              </div>
            </div>

            {/* Sign In Button — pinned to bottom */}
            <div className="mt-auto px-6 pb-8">
              <button 
                onClick={() => handleNavClick(isLoggedIn ? 'DRIVER_DASHBOARD' : 'ADMIN_LOGIN')}
                className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-transform"
              >
                {isLoggedIn ? (language === Language.EN ? 'Dashboard' : language === Language.RU ? 'КАБИНЕТ' : 'ЖЕКЕ КАБИНЕТ') : (language === Language.EN ? 'Sign in' : language === Language.RU ? 'Войти' : 'Кіру')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORBI LIVE MODAL */}
      {isLiveOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 md:p-8" onClick={() => setIsLiveOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"></div>
          
          <div className="relative w-full max-w-6xl h-[90vh] md:h-auto max-h-full bg-slate-900 border border-white/10 rounded-2xl md:rounded-[32px] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-white/10 bg-slate-950/50">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                    <h2 className="text-white text-lg md:text-xl font-black uppercase tracking-wider">ORBI <span className="text-rose-500">LIVE</span></h2>
                </div>
                <button onClick={() => setIsLiveOpen(false)} className="text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-all">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-950/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 h-full">
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <iframe className="w-full h-full" src="https://rtsp.me/embed/567EFTFd/?autoplay=1" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
                    </div>
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <iframe className="w-full h-full" src="https://rtsp.me/embed/TaHRrstz/?autoplay=1" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
                    </div>
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <iframe className="w-full h-full" src="https://rtsp.me/embed/nTZHrAd9/?autoplay=1" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
                    </div>
                    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-inner">
                        <iframe className="w-full h-full" src="https://rtsp.me/embed/AZ28Sih4/?autoplay=1" frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
