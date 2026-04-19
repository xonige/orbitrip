import React, { useState, useMemo, useEffect } from 'react';
import { Language, LocationOption } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';
import { mapService } from '../services/mapService';
import { getStartingPrice } from '../services/pricingEngine';
import { 
    Clock, 
    Navigation2, 
    ArrowRight, 
    Search, 
    Zap, 
    MapPin, 
    Navigation,
    Flag,
    ArrowUpDown,
    Tag,
    Globe,
    ShieldCheck,
    CarFront
} from 'lucide-react';
import SEO from './SEO';

interface SitemapViewProps {
  language: Language;
  onLinkClick: (from: string, to: string) => void;
}

const SitemapView: React.FC<SitemapViewProps> = ({ language, onLinkClick }) => {
    const isEn = language === Language.EN;
    const [searchTerm, setSearchTerm] = useState('');
    const [calculatedRoutes, setCalculatedRoutes] = useState<Record<string, { distance: number, duration: number }>>({});

    // 1. Logic: Group all locations by Major Hubs
    const GROUPED_ROUTES = useMemo(() => {
        const hubs = GEORGIAN_LOCATIONS.filter(loc => loc.type === 'CITY' || loc.type === 'AIRPORT');
        const destinations = GEORGIAN_LOCATIONS;
        
        const MAJOR_HUBS = ['tbilisi', 'batumi', 'kutaisi', 'mestia', 'kazbegi'];
        const groups: Record<string, { from: LocationOption, to: LocationOption }[]> = {};
        
        MAJOR_HUBS.forEach(hubId => {
            const hubLabel = GEORGIAN_LOCATIONS.find(l => l.id === hubId);
            if (hubLabel) {
                const label = isEn ? `From ${hubLabel.nameEn}` : `Из ${hubLabel.nameRu}`;
                groups[label] = [];
            }
        });
        groups[isEn ? 'Other Regions' : 'Другие регионы'] = [];

        hubs.forEach(h => {
             destinations.forEach(d => {
                 if (h.id !== d.id) {
                     const fromName = isEn ? h.nameEn : h.nameRu;
                     const toName = isEn ? d.nameEn : d.nameRu;
                     
                     const query = searchTerm.toLowerCase().trim();
                     if (query && !fromName.toLowerCase().includes(query) && !toName.toLowerCase().includes(query)) {
                         return;
                     }
                     
                     const hubLabel = GEORGIAN_LOCATIONS.find(l => l.id === h.id);
                     let groupKey = isEn ? 'Other Regions' : 'Другие регионы';
                     if (MAJOR_HUBS.includes(h.id)) {
                         groupKey = isEn ? `From ${hubLabel?.nameEn}` : `Из ${hubLabel?.nameRu}`;
                     }
                     
                     if (!groups[groupKey]) groups[groupKey] = [];
                     groups[groupKey].push({ from: h, to: d });
                 }
             });
        });
        
        // Remove empty groups
        Object.keys(groups).forEach(key => {
            if (groups[key].length === 0) delete groups[key];
        });

        return groups;
    }, [isEn, searchTerm]);

    // 2. Pre-calculate/Fetch from Local DB
    useEffect(() => {
        const fetchAll = async () => {
            const results: Record<string, { distance: number, duration: number }> = {};
            const allHubs = GEORGIAN_LOCATIONS.filter(loc => loc.type === 'CITY' || loc.type === 'AIRPORT');
            const allDests = GEORGIAN_LOCATIONS;

            // To avoid blocking the JS thread for 12k lookups, we do it in smaller batches or just for visible hubs
            // Actually, with LOCAL_ROUTE_DB it's an O(1) property lookup, so it's super fast.
            for (const h of allHubs) {
                for (const d of allDests) {
                    if (h.id === d.id) continue;
                    const key = `${h.id}->${d.id}`;
                    const res = await mapService.calculateSegment(h.id, d.id, d.isMountainous);
                    results[key] = res;
                }
            }
            setCalculatedRoutes(results);
        };
        fetchAll();
    }, []); // Only on mount

    // 3. Structured Data for Google (ItemList Schema)
    const sitemapSchema = useMemo(() => ({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": isEn ? "Georgia Private Transfer Library" : "Библиотека трансферов Грузии",
        "description": isEn ? "Complete directory of private transfers and taxi services across Georgia with fixed prices." : "Полный каталог частных трансферов и такси по Грузии с фиксированными ценами.",
        "numberOfItems": Object.values(GROUPED_ROUTES).flat().length,
        "itemListElement": Object.values(GROUPED_ROUTES).flat().slice(0, 50).map((r, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": `${r.from.nameEn} to ${r.to.nameEn} Transfer`,
            "url": `https://orbitrip.ge/routes?from=${r.from.id}&to=${r.to.id}`
        }))
    }), [isEn, GROUPED_ROUTES]);

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <SEO 
                title={isEn ? "Transfer Library & Route Matrix" : "Библиотека всех трансферов"}
                description={isEn 
                    ? "Explore 8,500+ private transfer routes across Georgia. Real-time distances, durations, and fixed prices from Tbilisi, Batumi, Kutaisi." 
                    : "Исследуйте 8,500+ маршрутов частных трансферов по Грузии. Цены, расстояния и время в пути."}
                schema={sitemapSchema}
            />
            {/* Header / Search */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                                {isEn ? 'Transfer' : 'Библиотека'}{' '}
                                <span className="text-[var(--primary)]">{isEn ? 'Library' : 'Трансферов'}</span>
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                                {isEn ? 'Direct metrics and instant booking for 8,500+ routes' : 'Метрики и бронирование для 8,500+ маршрутов'}
                            </p>
                        </div>
                        
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[var(--primary)] transition-colors" size={18} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={isEn ? "Search by city..." : "Найти город..."}
                                className="w-full bg-slate-100 hover:bg-white border-2 border-transparent hover:border-[var(--primary)] focus:bg-white focus:border-[var(--primary)] rounded-2xl h-14 pl-12 pr-4 text-sm font-black text-slate-900 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full mt-6">
                        {Object.keys(GROUPED_ROUTES).map(group => (
                            <button
                                key={group}
                                onClick={() => {
                                    const el = document.getElementById(group);
                                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all rounded-xl"
                            >
                                {group}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {Object.keys(GROUPED_ROUTES).map((group, gIdx) => (
                    <div key={gIdx} id={group} className="mb-24 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter">{group}</h2>
                            <div className="h-[2px] flex-1 bg-slate-200 opacity-30 mt-2"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{GROUPED_ROUTES[group].length} {isEn ? 'Routes' : 'Маршрута'}</span>
                        </div>
                        
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {GROUPED_ROUTES[group].map((route, rIdx) => {
                                const dbRes = calculatedRoutes[`${route.from.id}->${route.to.id}`];
                                return (
                                    <div 
                                        key={rIdx} 
                                        onClick={() => onLinkClick(isEn ? route.from.nameEn : route.from.nameRu, isEn ? route.to.nameEn : route.to.nameRu)}
                                        className="p-8 bg-white border border-slate-100 rounded-[32px] cursor-pointer hover:shadow-2xl transition-all group relative border-b-4 border-b-slate-50 hover:border-b-[var(--primary)] overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="space-y-1">
                                                <h4 className="text-xl font-black text-slate-900 group-hover:text-[var(--primary)] transition-colors uppercase italic leading-tight">
                                                    {isEn ? route.to.nameEn : route.to.nameRu}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                    <MapPin size={10} />
                                                    {isEn ? route.from.nameEn : route.from.nameRu}
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary)] group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <Navigation size={18} />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 relative z-10">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-tight">
                                               <Zap size={10} fill="currentColor" /> 
                                               {dbRes ? `${dbRes.distance} KM` : '...'}
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-tight shadow-lg shadow-slate-900/20">
                                               <Tag size={10} /> 
                                               {dbRes ? `FROM ${getStartingPrice(dbRes.distance, route.to.isMountainous)} GEL` : '...'}
                                            </div>
                                        </div>

                                        {/* Background Decor */}
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50 z-0" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {Object.keys(GROUPED_ROUTES).length === 0 && (
                <div className="flex flex-col items-center justify-center py-64 text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-200">
                        <MapPin size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">{isEn ? 'No Routes Found' : 'Маршруты не найдены'}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                        {isEn ? 'Try searching for another city' : 'Попробуйте поискать другой город'}
                    </p>
                </div>
            )}
            {/* 4. SEO CONTENT FOOTER — Topical Authority */}
            <div className="bg-white border-t border-slate-200 py-32 mt-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">
                                {isEn ? "Reliable Logistics Across Georgia" : "Надежная логистика по всей Грузии"}
                            </h3>
                            <div className="space-y-6 text-base font-bold text-slate-400 leading-relaxed">
                                <p>
                                    {isEn 
                                        ? "OrbiTrip projects a sophisticated route matrix covering every corner of Georgia. From the Caucasian mountains of Mestia to the Black Sea coast of Batumi, our fleet is ready for any terrain."
                                        : "OrbiTrip проектирует сложную матрицу маршрутов, охватывающую все уголки Грузии. От кавказских гор Местии до черноморского побережья Батуми."}
                                </p>
                                <p>
                                    {isEn 
                                        ? "Our dynamic pricing engine (v10) ensuring 100% financial consistency across 8,500+ route combinations, protecting both passengers and drivers with transparent, fixed quotes."
                                        : "Наш динамический ценовой движок (v10) обеспечивает 100% стабильность на 8,500+ маршрутах, защищая пассажиров и водителей прозрачными фиксированными ценами."}
                                </p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 shadow-sm">
                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                                {isEn ? "Service Continuity FAQ" : "Популярные вопросы"}
                             </h4>
                             <ul className="space-y-6">
                                 {[
                                     { q: isEn ? "Is the price absolutely fixed?" : "Цена действительно фиксирована?", a: isEn ? "Yes. Our pricing engine calculates the final amount based on exact distance and service types. No hidden fees." : "Да. Наш движок рассчитывает финальную сумму на основе точного расстояния и типа сервиса." },
                                     { q: isEn ? "Can I add sightseeing stops?" : "Можно ли добавить обзорные остановки?", a: isEn ? "Absolutely. Our platform allows adding unlimited stops to any transfer, making it a custom tour." : "Конечно. Наша платформа позволяет добавлять неограниченное количество остановок к любому трансферу." }
                                 ].map((faq, i) => (
                                     <li key={i} className="space-y-2">
                                         <p className="text-slate-900 font-black text-sm">{faq.q}</p>
                                         <p className="text-slate-500 text-xs font-bold leading-relaxed">{faq.a}</p>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SitemapView;
