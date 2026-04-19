import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, ArrowRight, Car, Star, Utensils, Camera, RefreshCw, CheckCircle, Map as MapIcon, Brain, Terminal, Gem, Clock } from 'lucide-react';
import { Language, Driver, Tour, TripSearch } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { generateItineraryJSON, smartPhotoSearch } from '../services/skyGemini';

interface SkyPlannerProps {
  language: Language;
  drivers: Driver[];
  onBook: (search: TripSearch, guests: number, driver: Driver, tour?: Tour) => void;
}

const LOADING_LOGS = {
    en: [
        "Analyzing your vibe...",
        "Scanning hidden mountain passes...",
        "Checking local family wineries...",
        "Optimizing travel logistics...",
        "Generating immersive itinerary...",
        "Sourcing high-res photography..."
    ],
    ru: [
        "Анализируем ваш вкус...",
        "Сканируем скрытые горные тропы...",
        "Проверяем местные винодельни...",
        "Оптимизируем логистику...",
        "Создаем детальный маршрут...",
        "Подбираем фотографии..."
    ]
};

const SkyPlanner: React.FC<SkyPlannerProps> = ({ language, drivers, onBook }) => {
    const [prompt, setPrompt] = useState('');
    const [step, setStep] = useState<'idle' | 'thinking' | 'completed'>('idle');
    const [itinerary, setItinerary] = useState<any>(null);
    const [photos, setPhotos] = useState<Record<string, string>>({});
    const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
    const [matchedDrivers, setMatchedDrivers] = useState<any[]>([]);
    
    const isEn = language === Language.EN;

    // Driver Calculation Logic (ported from Orbitrip)
    const calculateDrivers = (km: number) => {
        const active = drivers.filter(d => d.status === 'ACTIVE');
        return active.map(d => {
            const complexity = 1.2; // AI Tours are usually more complex
            const baseCost = (km * d.pricePerKm * complexity) + (d.basePrice || 30);
            return { ...d, calculatedPrice: Math.ceil(baseCost) };
        }).sort((a, b) => a.calculatedPrice - b.calculatedPrice).slice(0, 3);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setStep('thinking');
        setVisibleLogs([isEn ? LOADING_LOGS.en[0] : LOADING_LOGS.ru[0]]);
        
        // Log cycle
        const logInt = setInterval(() => {
            setVisibleLogs(prev => {
                const logs = isEn ? LOADING_LOGS.en : LOADING_LOGS.ru;
                const next = logs[prev.length % logs.length];
                return [...prev, next].slice(-5);
            });
        }, 1500);

        try {
            const result = await generateItineraryJSON(prompt, new Date().toISOString(), "Sunny, 22C");
            
            // Fetch Photos
            const mainPhoto = await smartPhotoSearch(result.image_search_query || result.title_en);
            const stopPhotos: Record<string, string> = { "main": mainPhoto.url };
            
            for (const stop of result.itinerary.slice(0, 3)) { // Limit parallel fetches
                const p = await smartPhotoSearch(stop.stop_name_en);
                stopPhotos[stop.stop_name_en] = p.url;
            }

            setPhotos(stopPhotos);
            setItinerary(result);
            setMatchedDrivers(calculateDrivers(150)); // Assume 150km for AI Generated tours as estimate
            
            clearInterval(logInt);
            setStep('completed');
        } catch (err: any) {
            console.error(err);
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('429') || msg.includes('quota')) {
                alert(isEn ? "AI service is temporarily busy. Please try again in 1 minute." : "AI сервис временно перегружен. Попробуйте через 1 минуту.");
            } else {
                alert(isEn ? "AI generation failed. Please try again." : "Ошибка AI. Попробуйте снова.");
            }
            setStep('idle');
            clearInterval(logInt);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-12">
            {step === 'idle' && (
                <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-fade-in">
                    <div className="flex flex-col items-center text-center mb-10">
                         <div className="bg-indigo-600 text-white p-3 rounded-2xl mb-6 shadow-lg shadow-indigo-200">
                             <Brain size={32} className="animate-pulse" />
                         </div>
                         <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                             {isEn ? "AI Adventure Planner" : "AI Планировщик"}
                         </h2>
                         <p className="text-slate-600 text-lg max-w-xl">
                             {isEn ? "Tell us your dream vibe - we'll handle the secret spots and logistics." : "Опишите ваш идеальный отдых - мы найдем скрытые места и организуем всё за вас."}
                         </p>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={isEn ? "Describe your mood (e.g. 'Hidden waterfalls and abandoned sanatoriums near Kutaisi'...)" : "Опишите настроение (напр. 'Заброшенные санатории и водопады около Кутаиси'...)"}
                            className="w-full h-40 p-8 rounded-3xl bg-white/60 border-2 border-transparent focus:border-indigo-400 focus:bg-white transition-all outline-none text-xl shadow-inner-lg"
                        />
                        <button 
                            onClick={handleGenerate}
                            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition active:scale-95"
                        >
                            {isEn ? "Let's Go" : "Поехали"} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {step === 'thinking' && (
                <div className="h-[500px] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
                    
                    <div className="relative z-10 w-full max-w-md">
                        <div className="text-center mb-12">
                            <div className="inline-block p-4 bg-indigo-500/20 rounded-full mb-6 border border-indigo-500/30">
                                <Sparkles size={40} className="text-indigo-400 animate-spin-slow" />
                            </div>
                            <h3 className="text-2xl font-bold">
                                {isEn ? "Crafting Your Journey..." : "Создаем ваш маршрут..."}
                            </h3>
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm shadow-inner">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2 text-slate-500">
                                <Terminal size={14} /> <span>agent_v1.0.exe</span>
                            </div>
                            {visibleLogs.map((log, i) => (
                                <div key={i} className="flex gap-2 text-indigo-300 animate-fade-in whitespace-nowrap overflow-hidden">
                                    <span className="text-slate-600">{'>'}</span> {log}
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-indigo-500 animate-pulse mt-2"></div>
                        </div>
                    </div>
                </div>
            )}

            {step === 'completed' && itinerary && (
                <div className="space-y-8 animate-fade-in">
                    {/* Header Card */}
                    <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden group shadow-2xl">
                        <img 
                            src={photos["main"]} 
                            className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" 
                            alt="Cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-10 md:p-16">
                            <h1 className="text-4xl md:text-7xl font-black text-white mb-4 drop-shadow-xl">
                                {isEn ? itinerary.title_en : itinerary.title_ru}
                            </h1>
                            <div className="flex gap-4">
                                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold border border-white/30">
                                   {isEn ? itinerary.category : itinerary.category}
                                </span>
                                <button onClick={() => setStep('idle')} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition">
                                    {isEn ? "Generate Again" : "Заново"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Itinerary */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[2rem] border border-white/50">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Description</h3>
                                <p className="text-xl text-slate-800 leading-relaxed font-medium italic">
                                    "{isEn ? itinerary.description_en : itinerary.description_ru}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                {itinerary.itinerary.map((stop: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 items-start group">
                                        <div className="flex flex-col items-center pt-4">
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.2)]"></div>
                                            <div className="flex-1 w-0.5 bg-slate-200 mt-2"></div>
                                        </div>
                                        <div className="flex-1 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/50 shadow-lg transition hover:shadow-xl hover:bg-white">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {photos[stop.stop_name_en] && (
                                                    <img src={photos[stop.stop_name_en]} className="w-full md:w-32 h-32 rounded-2xl object-cover" alt={stop.stop_name_en} />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                                                            {stop.start_time} - {stop.stay_duration}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase">{stop.activity_type}</span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                                                        {isEn ? stop.stop_name_en : stop.stop_name_ru}
                                                    </h4>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {stop.activity_description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Driver Selection */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl sticky top-24">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                   <Car size={24} className="text-indigo-400" /> {isEn ? "Select Your Pilot" : "Выберите пилота"}
                                </h3>
                                
                                <div className="space-y-4">
                                    {matchedDrivers.map(d => (
                                        <div key={d.id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition-all">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={getOptimizedImageUrl(d.photoUrl)} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30" alt={d.name} />
                                                <div className="flex-1">
                                                    <div className="font-bold">{d.name}</div>
                                                    <div className="text-xs text-slate-400">{d.carModel} • {d.vehicleType}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-black text-blue-400">{d.calculatedPrice} GEL</div>
                                                    <div className="text-[10px] text-slate-400">ESTIMATED TOTAL</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const search: TripSearch = {
                                                        stops: itinerary.itinerary.map((s: any) => s.stop_name_en),
                                                        date: new Date().toISOString().split('T')[0],
                                                        totalDistance: 150
                                                    };
                                                    const tour: Tour = {
                                                        id: 'ai-gen-' + Date.now(),
                                                        titleEn: itinerary.title_en,
                                                        titleRu: itinerary.title_ru,
                                                        image: photos["main"],
                                                        price: `${d.calculatedPrice} GEL`,
                                                        category: 'AI_TOUR',
                                                        descriptionEn: itinerary.description_en,
                                                        descriptionRu: itinerary.description_ru,
                                                        duration: 'Full Day',
                                                        rating: 5,
                                                        priceOptions: [],
                                                        routeStops: itinerary.itinerary.map((s: any) => s.stop_name_en),
                                                        itineraryEn: itinerary.itinerary.map((s: any) => s.activity_description),
                                                        itineraryRu: itinerary.itinerary.map((s: any) => s.activity_description),
                                                        pricePerPerson: 0
                                                    };
                                                    onBook(search, 2, d, tour);
                                                }}
                                                className="w-full bg-indigo-600 group-hover:bg-indigo-500 text-white py-2 rounded-xl font-bold text-sm transition"
                                            >
                                                {isEn ? "Book with " + d.name.split(' ')[0] : "Заказать у " + d.name.split(' ')[0]}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Included:</span>
                                        <span className="text-white font-medium">Fuel, Guide, Insurance</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total KM:</span>
                                        <span className="text-white font-medium">~150km</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkyPlanner;
