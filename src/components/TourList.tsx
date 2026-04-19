
import React, { useState, useMemo } from 'react';
import { Language, Tour, Driver } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';

interface TourListProps {
  tours: Tour[];
  language: Language;
  onViewDetails: (tour: Tour, startLocationId: string) => void;
  drivers?: Driver[]; 
}

const CATEGORIES = [
    { id: 'ALL', labelEn: 'All Types', labelRu: 'Все типы', icon: '♾️' },
    { id: 'AUTHOR', labelEn: "Author's Tours", labelRu: 'Авторские Туры', icon: '⭐' }, // NEW CATEGORY
    { id: 'CULTURE', labelEn: 'Culture', labelRu: 'Культура', icon: '🏛️' },
    { id: 'MOUNTAINS', labelEn: 'Mountains', labelRu: 'Горы', icon: '🏔️' },
    { id: 'WINE', labelEn: 'Wine', labelRu: 'Вино', icon: '🍷' },
    { id: 'SEA', labelEn: 'Sea', labelRu: 'Море', icon: '🌊' },
    { id: 'NATURE', labelEn: 'Nature', labelRu: 'Природа', icon: '🌿' }
];

const START_LOCATIONS = [
    { id: 'tbilisi', labelEn: 'From Tbilisi', labelRu: 'Из Тбилиси', icon: '🏙️' },
    { id: 'kutaisi', labelEn: 'From Kutaisi', labelRu: 'Из Кутаиси', icon: '✈️' },
    { id: 'batumi', labelEn: 'From Batumi', labelRu: 'Из Батуми', icon: '🌊' },
];

const LOCATION_SYNONYMS: Record<string, string[]> = {
    'tbilisi': ['tbilisi', 'tbs', 'rustavi', 'mtskheta', 'tbilisi airport', 'natakhtari'],
    'kutaisi': ['kutaisi', 'kut', 'tskantubo', 'kopitnari', 'bagdati', 'promethe'],
    'batumi': ['batumi', 'bus', 'kobuleti', 'gonio', 'chakvi', 'kvariati', 'ureki', 'shekvetili']
};

const ITEMS_PER_PAGE = 12;

const TourList: React.FC<TourListProps> = ({ tours, language, onViewDetails, drivers = [] }) => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [userLocation, setUserLocation] = useState('tbilisi');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [hasSearched, setHasSearched] = useState(false);
  const [viatorTours, setViatorTours] = useState<Tour[]>([]);

  // Sync with URL city param
  React.useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const city = urlParams.get('city')?.toLowerCase();
      if (city) {
          setHasSearched(true);
          if (city.includes('tbilisi')) setUserLocation('tbilisi');
          else if (city.includes('kutaisi')) setUserLocation('kutaisi');
          else if (city.includes('batumi')) setUserLocation('batumi');
      }
  }, []);

  // Fetch Viator Tours whenever location changes
  React.useEffect(() => {
     if (userLocation !== 'all') {
         fetch(`http://127.0.0.1:5000/api/viator-tours?city=${userLocation}`)
            .then(res => res.json())
            .then(data => setViatorTours(data))
            .catch(err => console.error("Viator fetch err:", err));
     }
  }, [userLocation]);

  // Inject Viator Widget Script
  React.useEffect(() => {
    // Function to load/reload Viator script
    const loadViator = () => {
      const oldScript = document.querySelector('script[src="https://www.viator.com/orion/partner/widget.js"]');
      if (oldScript) oldScript.remove();
      
      const script = document.createElement("script");
      script.src = "https://www.viator.com/orion/partner/widget.js";
      script.async = true;
      document.body.appendChild(script);
    };

    // Small delay to ensure the div is in the DOM
    const timer = setTimeout(loadViator, 100);
    return () => clearTimeout(timer);
  }, []);

  const calculateDisplayPrices = (tour: Tour) => {
      // 1. Try to get city-specific price
      if (tour.pricesByCity && tour.pricesByCity[userLocation]) {
          return { original: `${tour.pricesByCity[userLocation]} GEL` };
      }
      
      // 2. Fallback to basePrice if city-specific not found
      let base = tour.basePrice && tour.basePrice > 0 ? tour.basePrice : 0;
      
      if (base === 0 && tour.price) {
          const extracted = parseFloat(tour.price.replace(/[^0-9.]/g, ''));
          if (!isNaN(extracted)) base = extracted;
      }
      if (base === 0) return { original: 'Request' };
      return { original: `${base} GEL` };
  };

  const filteredTours = useMemo(() => {
      let list = [...tours, ...viatorTours];
      
      if (activeCategory !== 'ALL') {
          list = list.filter(t => t.category === activeCategory);
      }

      if (userLocation !== 'all') {
          list = list.filter(t => {
              const searchKey = userLocation.toLowerCase();
              const allowedKeywords = LOCATION_SYNONYMS[searchKey] || [searchKey];
              let startPoint = '';
              if (Array.isArray(t.routeStops) && t.routeStops.length > 0) {
                  const firstStop = t.routeStops[0];
                  if (firstStop && typeof firstStop === 'string') startPoint = firstStop.toLowerCase();
              } else if (Array.isArray(t.itineraryEn) && t.itineraryEn.length > 0) {
                   startPoint = t.itineraryEn[0].toLowerCase();
              } else {
                  startPoint = (t.titleEn || '').toLowerCase();
              }
              return allowedKeywords.some(keyword => startPoint.includes(keyword));
          });
      }
      
      list.sort((a, b) => {
          // Prioritize Author Tours
          if (a.category === 'AUTHOR' && b.category !== 'AUTHOR') return -1;
          if (b.category === 'AUTHOR' && a.category !== 'AUTHOR') return 1;

          const isAiA = a.id.startsWith('ai-gen');
          const isAiB = b.id.startsWith('ai-gen');
          
          // Prioritize AI Generated routes as they are "fresh"
          if (isAiA && !isAiB) return -1;
          if (!isAiA && isAiB) return 1;
          return b.id.localeCompare(a.id);
      });

      return list;
  }, [tours, activeCategory, userLocation]);

  const currentTours = useMemo(() => {
      return filteredTours.slice(0, visibleCount);
  }, [filteredTours, visibleCount]);

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };
  
  // Helper to find author
  const getAuthor = (tour: Tour) => {
      if (tour.category === 'AUTHOR' && tour.authorId && drivers) {
          return drivers.find(d => d.id === tour.authorId);
      }
      return null;
  };

  return (
    <div className="py-20 md:py-32 bg-transparent" id="tours-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- INFORMATIONAL LANDING (Shows when no search) --- */}
        {!hasSearched && (
            <div className="mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="bg-indigo-600 rounded-[40px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[100px]" />
                    </div>
                    
                    <div className="relative z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-widest mb-6">
                            {language === Language.EN ? '🗺️ Your Journey Starts Here' : '🗺️ Ваше путешествие начинается здесь'}
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black mb-6 leading-none italic uppercase tracking-tighter">
                            {language === Language.EN ? 'Private Excursions' : 'Авторские экскурсии'}
                        </h1>
                        <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                            {language === Language.EN 
                                ? 'Discover Georgia through the eyes of local experts. No crowded buses, no strict schedules — just you, your driver, and the beauty of our country.' 
                                : 'Откройте Грузию глазами местных экспертов. Без переполненных автобусов и жесткого расписания — только вы, ваш водитель и красота нашей страны.'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="text-2xl mb-3">📍</div>
                                <h3 className="font-bold mb-2">{language === Language.EN ? 'Tailored to You' : 'Под вас'}</h3>
                                <p className="text-indigo-100 text-sm opacity-80">{language === Language.EN ? 'Tbilisi, Kutaisi or Batumi. We pick you up at your door.' : 'Тбилиси, Кутаиси или Батуми. Заберем прямо от двери.'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="text-2xl mb-3">📸</div>
                                <h3 className="font-bold mb-2">{language === Language.EN ? 'Total Freedom' : 'Полная свобода'}</h3>
                                <p className="text-indigo-100 text-sm opacity-80">{language === Language.EN ? 'Stop anytime for photos or coffee. This is your personal experience.' : 'Останавливайтесь в любое время для фото или кофе.'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="text-2xl mb-3">⭐</div>
                                <h3 className="font-bold mb-2">{language === Language.EN ? 'Verified Drivers' : 'Проверенные водители'}</h3>
                                <p className="text-indigo-100 text-sm opacity-80">{language === Language.EN ? 'Read real reviews on every driver profile before booking.' : 'Читайте реальные отзывы в профилях водителей перед бронированием.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- TOUR RESULTS (Only when hasSearched) --- */}
        {hasSearched && (
        <div className="animate-in fade-in duration-500">
            {/* HEADER & FILTERS */}
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight drop-shadow-sm">
                    {language === Language.EN ? 'Top Trending Tours' : 'Популярные Туры'}
                </h2>
                
                <div className="bg-white/60 backdrop-blur-lg p-2 rounded-[2rem] inline-flex flex-wrap justify-center gap-2 shadow-sm border border-white/50 mb-8">
                    {START_LOCATIONS.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => { setUserLocation(loc.id); setVisibleCount(ITEMS_PER_PAGE); }}
                            className={`
                                flex items-center px-6 py-3 rounded-full text-sm font-bold transition-all duration-300
                                ${userLocation === loc.id 
                                    ? 'bg-slate-900 text-white shadow-lg transform scale-105' 
                                    : 'bg-transparent text-gray-500 hover:bg-white hover:text-indigo-600'}
                            `}
                        >
                            <span className="mr-2 text-lg">{loc.icon}</span>
                            {language === Language.EN ? loc.labelEn : loc.labelRu}
                        </button>
                    ))}
                </div>

                <div className="w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex justify-start sm:justify-center">
                    <div className="flex gap-3">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    flex-shrink-0 flex items-center px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all border
                                    ${activeCategory === cat.id 
                                        ? 'bg-indigo-50/90 backdrop-blur border-indigo-200 text-indigo-700 shadow-md transform scale-105' 
                                        : 'bg-white/80 backdrop-blur border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700 hover:bg-white'}
                                `}
                            >
                                <span className="mr-2 text-base grayscale opacity-70">{cat.icon}</span>
                                {language === Language.EN ? cat.labelEn : cat.labelRu}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {currentTours.map((tour) => {
                    const prices = calculateDisplayPrices(tour);
                    const isAiGenerated = tour.id.startsWith('ai-gen');
                    const isAuthor = tour.category === 'AUTHOR';
                    const author = getAuthor(tour);
                    
                    return (
                        <div key={tour.id} 
                             onClick={() => onViewDetails(tour, userLocation === 'all' ? 'tbilisi' : userLocation)} 
                             className={`
                                group flex flex-col bg-white rounded-3xl overflow-hidden cursor-pointer relative z-10
                                hover:z-20 transition-all duration-500 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                                hover:shadow-[0_25px_50px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-2
                                ${isAiGenerated ? 'ring-2 ring-indigo-50' : ''} 
                                ${isAuthor ? 'ring-2 ring-yellow-400/50' : 'border border-gray-100'}
                             `}
                        >
                          
                          {/* Image Container (4:3 Aspect Ratio) */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
                                src={tour.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                alt={tour.titleEn} 
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80';
                                }}
                            />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-500"></div>

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                         <span className={`backdrop-blur-md text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md ${isAuthor ? 'bg-yellow-400 text-black' : 'bg-white/90 text-slate-900'}`}>
                             {isAuthor ? (language === Language.EN ? "Author's Tour" : "Авторский") : (tour.category || 'TOUR')}
                         </span>
                         {isAiGenerated && (
                             <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-md animate-pulse border border-white/20">
                                 ✨ AI
                             </span>
                         )}
                    </div>

                    <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center shadow-sm border border-white/10">
                        <span className="text-yellow-400 text-xs mr-1">★</span>
                        <span className="text-xs font-bold text-white">{tour.rating || 5.0}</span>
                    </div>

                    {/* Title Overlay on Image (Modern Style) */}
                    <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-md">
                            {language === Language.EN ? (tour.titleEn || 'Untitled') : (tour.titleRu || 'Без названия')}
                        </h3>
                        {/* If author exists, show author info */}
                        {author ? (
                             <div className="flex items-center gap-2 mb-1">
                                 <img src={author.photoUrl} alt={author.name} className="w-6 h-6 rounded-full border border-white" />
                                 <span className="text-xs font-bold text-white/90">by {author.name}</span>
                             </div>
                        ) : (
                            <p className="text-xs font-medium opacity-80 line-clamp-1">
                                {language === Language.EN ? (tour.descriptionEn || '') : (tour.descriptionRu || '')}
                            </p>
                        )}
                    </div>
                  </div>
                  
                  {/* Card Content (Lower Half) */}
                  <div className="flex-1 p-5 flex flex-col justify-between relative bg-white">
                    {/* Route Preview */}
                    <div className="flex items-center gap-2 mb-4 overflow-hidden">
                        <span className="text-blue-500 text-lg">📍</span>
                        <div className="flex-1 flex items-center text-xs font-bold text-gray-500">
                            {tour.routeStops && tour.routeStops.length > 0 ? (
                                <>
                                    <span className="truncate">{tour.routeStops[0]}</span>
                                    <span className="mx-2 text-gray-300">➝</span>
                                    <span className="truncate">{tour.routeStops[tour.routeStops.length - 1]}</span>
                                </>
                            ) : (
                                <span className="truncate">{language === Language.EN ? "Custom Route" : "Маршрут"}</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                              {language === Language.EN ? 'Start From' : 'Цена От'}
                          </p>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{prices.original}</span>
                      </div>
                      
                      <button className="bg-slate-900 text-white group-hover:bg-indigo-600 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-md group-hover:shadow-indigo-500/30 flex items-center transform active:scale-95">
                          {language === Language.EN ? 'View Details' : 'Подробнее'}
                          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )})
          }
          
          {currentTours.length === 0 && (
              <div className="col-span-full text-center py-24">
                  <div className="text-6xl mb-6 opacity-30 grayscale">🗺️</div>
                  <h3 className="text-2xl font-bold text-gray-900">
                      {language === Language.EN ? `No tours found starting from ${userLocation}` : `Туры из ${userLocation} не найдены`}
                  </h3>
                  <p className="text-gray-500 mt-2">
                      {language === Language.EN ? "Try selecting a different starting location." : "Попробуйте выбрать другой город отправления."}
                  </p>
              </div>
          )}
        </div>
        
        {visibleCount < filteredTours.length && (
            <div className="mt-20 text-center">
                <button 
                    onClick={handleLoadMore}
                    className="bg-white/90 backdrop-blur border-2 border-gray-200 text-slate-900 font-bold py-4 px-12 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-lg active:scale-95 uppercase tracking-wide text-xs"
                >
                    {language === Language.EN ? "Show More Tours" : "Показать еще"}
                </button>
            </div>
        )}

            </div>
        )}

        {/* --- VIATOR EMBEDDED WIDGET --- */}
        <div className="w-full mt-24 mb-8 bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative z-10">
            <h3 className="text-2xl font-black mb-6 text-slate-800 tracking-tight text-center">
                {language === Language.EN ? 'Explore More with Viator' : 'Больше туров от Viator'}
            </h3>
            <div 
                data-vi-partner-id="P00203138" 
                data-vi-widget-ref="W-9ed23d57-9014-4807-938c-1e220601c65b"
                style={{ minHeight: '600px', width: '100%' }}
            ></div>
        </div>
      </div>
    </div>
  );
};

export default TourList;
