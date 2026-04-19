// v29.0.0 - Global De-Framerization & Atomic Refresh
// v28.0.0 - Nuclear Reset & Recovery (Guaranteed Stability)
// v27.1.0 - Multi-Layer Stability Wrap
// v27.0.2 - Master Deployment Stabilization
// v26.9.5 - Calendar UI Refinement
import React from 'react';
import { 
    Phone, 
    Mail, 
    Globe,
    Headset,
    MessageCircle,
    Instagram,
    ChevronRight,
    History
} from 'lucide-react';
import { Language, SystemSettings } from '../types';

interface FooterProps {
  language: Language;
  settings: SystemSettings | null;
  onNavigate: (view: string, path: string) => void;
}

/**
 * OrbiTrip Premium Footer (v26.8.2)
 * Optimized for Conversion and Trust
 */
const Footer: React.FC<FooterProps> = ({ language, settings, onNavigate }) => {
  const isEn = language === Language.EN;
  const year = new Date().getFullYear();

  const rawPhone = settings?.adminPhoneNumber || '995593456876';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const telLink = `tel:+${cleanPhone.startsWith('995') ? cleanPhone : '995' + cleanPhone}`;
  
  const formattedPhone = `+995 (${cleanPhone.substring(3, 6)}) ${cleanPhone.substring(6, 9)} ${cleanPhone.substring(9)}`;
  const email = 'support@orbitrip.ge';

  return (
    <footer className="bg-slate-50 text-slate-700 font-sans py-16 md:py-24 border-t border-slate-200 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-24">
          
          <div className="flex flex-col space-y-6 max-w-sm">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => onNavigate('HOME', '/')}
            >
              <img src="/logo_small.webp" alt="OrbiTrip" className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                ORBI<span className="text-orange-600 not-italic">TRIP</span>
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <p className="text-slate-500 text-[10px] md:text-sm font-medium tracking-tighter">V29.0.0 Stable Deployment & Atomic Synchronization (Framer-Free)</p>
              <p className="text-slate-500 font-bold text-sm tracking-tight opacity-80">Kutaisi, Rustaveli 12/4, 4600</p>
              <a href={`mailto:${email}`} className="block text-slate-900 font-black text-sm hover:text-orange-600 transition-colors mt-2">{email}</a>
            </div>
          </div>

          <div className="flex flex-col md:items-end w-full md:w-auto">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 md:text-right">
              {isEn ? "Direct Contact" : "Связаться напрямую"}
            </p>
            <a 
                href={telLink} 
                className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter hover:text-orange-600 transition-all active:scale-95 flex items-center gap-3"
            >
              {formattedPhone}
            </a>
            <div className="flex items-center gap-4 mt-6">
                <a href={telLink} className="p-3 bg-white border border-slate-200 rounded-full hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
                    <Phone size={20} />
                </a>
                <a href="https://instagram.com/orbitrip.ge" target="_blank" rel="noopener" className="p-3 bg-white border border-slate-200 rounded-full hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
                    <Instagram size={20} />
                </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">
                <p>© {year} OrbiTrip Georgia. Stable V29.0.0</p>
                <div className="flex items-center gap-6">
                    <span className="cursor-pointer hover:text-slate-900 transition-colors">Privacy</span>
                    <span className="cursor-pointer hover:text-slate-900 transition-colors">Terms</span>
                </div>
            </div>

            <details className="bg-white/70 backdrop-blur-md rounded-[24px] p-6 border border-slate-200 group transition-all duration-500 open:shadow-2xl open:shadow-slate-200/50">
                <summary className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] cursor-pointer flex items-center justify-between list-none">
                    <div className="flex items-center gap-3">
                        <History size={14} className="text-orange-600" />
                        Platform Update History (Last 10)
                    </div>
                    <li className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="font-medium">V29.0.0 Release (Major): Total De-Framerization & 100% Stability Fix.</span>
                  </li>
                  <li className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    <span className="font-medium">API v2 Migration: bypassing all edge and browser data caches.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-300 rounded-full"></span>
                    <span className="text-slate-400">V28.0.2 Deployment Audit Passed (Master Sync).</span>
                  </li>
                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform text-slate-400" />
                </summary>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <HistoryItem version="V28.0.0" date="Apr 20, 2026" desc="Nuclear Environment Reset & Multi-Layer Cache Purge" active />
                    <HistoryItem version="V27.1.0" date="Apr 20, 2026" desc="Stability Wrap (React Crash Fixed & Cache Eliminated)" />
                    <HistoryItem version="V27.0.2" date="Apr 19, 2026" desc="Master Deployment Stabilization (Sudo/Rsync)" />
                    <HistoryItem version="V26.9.5" date="Apr 19, 2026" desc="Calendar UI Refinement (Upward opening & Mobile Portal)" />
                    <HistoryItem version="V26.9.0" date="Apr 19, 2026" desc="Search Flow Polish & Mobile Autofocus Fix" />
                    <HistoryItem version="V26.8.9" date="Apr 19, 2026" desc="Dynamic Reviews Resync & Console Warning Fix" />
                    <HistoryItem version="V26.8.8" date="Apr 19, 2026" desc="Calendar Fix (Desktop+Mobile Portal) & Reviews Restored" />
                    <HistoryItem version="V26.8.7" date="Apr 19, 2026" desc="Stable Pricing (NaN Fix) & Unique Route Imagery" />
                    <HistoryItem version="V26.8.4" date="Apr 19, 2026" desc="Recovery & Landing Page Stabilization" />
                    <HistoryItem version="V26.8.2" date="Apr 19, 2026" desc="Metrica-Driven UX & Deployment Asset Stability" />
                </div>
            </details>
        </div>
      </div>
    </footer>
  );
};

const HistoryItem = ({ version, date, desc, active }: { version: string, date: string, desc: string, active?: boolean }) => (
    <div className={`p-3 rounded-xl border ${active ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50/50 border-slate-100'} hover:bg-white transition-colors`}>
        <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-orange-600' : 'text-slate-900'}`}>{version}</span>
            <span className="text-[9px] font-bold text-slate-400">{date}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-600 leading-tight">{desc}</p>
    </div>
);

export default Footer;

