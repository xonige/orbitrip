import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { enUS } from 'date-fns/locale';
import ru from 'date-fns/locale/ru';
import kk from 'date-fns/locale/kk';

registerLocale('en-US', enUS);
registerLocale('ru', ru);
registerLocale('kk', kk);

import { Language, TripSearch, LocationOption } from '../types';
import { GEORGIAN_LOCATIONS } from '../data/locations';
import { mapService } from '../services/mapService';
import { 
    MapPin, 
    Calendar, 
    Search, 
    Plus, 
    ArrowUpDown, 
    ChevronDown, 
    X, 
    Loader2, 
    GripVertical,
    Navigation,
    Flag,
    Zap,
    Clock,
    ArrowRight,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    MoreHorizontal
} from 'lucide-react';
import LocationSelectorModal from './LocationSelectorModal';

interface TripSearchBoxProps {
  language: Language;
  onSearch: (search: TripSearch, isAuto?: boolean) => void;
  initialStops?: string[]; 
  initialDate?: string;
  maintenanceMode?: boolean;
}

const TripSearchBox: React.FC<TripSearchBoxProps> = ({ language, onSearch, initialStops, initialDate, maintenanceMode = false }) => {
  const isEn = language === Language.EN;

  // --- DATE HELPERS ---
  const parseLocalYyyyMmDd = (dateStr?: string): Date | null => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d); 
      }
      return null;
  };

  const toLocalString = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
  };

  // --- STATE ---
  const [stops, setStops] = useState<{id: string, name: string}[]>(() => 
      initialStops?.length 
          ? initialStops.map((name, i) => ({ id: `stop-${i}`, name })) 
          : [{ id: 'stop-0', name: '' }, { id: 'stop-1', name: '' }]
  );
  const [startDate, setStartDate] = useState<Date | null>(() => parseLocalYyyyMmDd(initialDate));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<any>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedSearch = useRef<string>("");

  useEffect(() => {
    if (activeInputIndex !== null) {
        setTimeout(() => locationInputRef.current?.focus(), 50);
    }
  }, [activeInputIndex]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (initialStops?.length) {
        const currentNames = stops.map(s => s.name);
        if (JSON.stringify(currentNames) !== JSON.stringify(initialStops)) {
            setStops(initialStops.map((name, i) => ({ id: `stop-${i}`, name })));
        }
    }
    if (initialDate) {
        const d = parseLocalYyyyMmDd(initialDate);
        if (d && (!startDate || d.getTime() !== startDate.getTime())) {
            setStartDate(d);
        }
    }
  }, [initialStops, initialDate]);

  const POPULAR_IDS = ['tbilisi', 'tbs-airport', 'batumi', 'kutaisi', 'kut-airport', 'gudauri', 'kazbegi', 'mestia', 'borjomi', 'signagi', 'telavi', 'kobuleti'];

  const allLocations = useMemo(() => 
    [...GEORGIAN_LOCATIONS].sort((a, b) => {
        const getName = (loc: any) => (language === Language.EN ? loc.nameEn : language === Language.RU ? loc.nameRu : loc.nameKz) || loc.nameEn || '';
        const nameA = getName(a);
        const nameB = getName(b);
        return nameA.localeCompare(nameB);
    }), [language]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      // Show popular first, then the rest
      const popular = POPULAR_IDS.map(id => allLocations.find(l => l.id === id)).filter(Boolean) as typeof allLocations;
      const rest = allLocations.filter(l => !POPULAR_IDS.includes(l.id));
      return [...popular, ...rest];
    }
    return allLocations.filter(loc => 
        loc.nameEn.toLowerCase().includes(q) || 
        loc.nameRu.toLowerCase().includes(q) ||
        (loc.nameKz && loc.nameKz.toLowerCase().includes(q))
    );
  }, [allLocations, searchQuery]);

  const calculateRouteData = useCallback(async (currentStops: {id: string, name: string}[], date: Date | null): Promise<TripSearch | null> => {
      const cleanStops = currentStops.map(s => s.name).filter(s => s.trim() !== '');
      if (cleanStops.length < 2) { setRouteInfo(null); return null; }
      
      setIsCalculating(true);
      try {
          const result = await mapService.calculateFullRoute(cleanStops);
          setRouteInfo({ distance: result.totalDistance, duration: result.totalDuration });
          setIsCalculating(false);
          
          if (!date) return null; // If no date, we show distance/time but don't emit a full search
          
          return { stops: cleanStops, date: toLocalString(date), totalDistance: result.totalDistance, totalDuration: result.totalDuration };
      } catch (e) {
          console.error('[TripSearchBox] Route calculation error:', e);
          setIsCalculating(false);
          return null;
      }
  }, []);

  // PREVENT REDUNDANT FETCH FLOODS ON MOBILE
  useEffect(() => {
    const cleanStopsNames = stops.map(s => s.name).join('|');
    const memoKey = `${cleanStopsNames}-${startDate?.getTime() || 0}`;
    
    if (!hasInteracted && stops.every(s => s.name.length > 0)) {
       // Initial landing via URL
       if (memoKey === lastEmittedSearch.current) return;
       
       const timer = setTimeout(async () => {
         const data = await calculateRouteData(stops, startDate);
         if (data) {
           lastEmittedSearch.current = memoKey;
           onSearch(data, true);
         }
       }, 800); 
       return () => clearTimeout(timer);
    } else if (hasInteracted) {
       // Manual interaction
       const timer = setTimeout(async () => {
         const data = await calculateRouteData(stops, startDate);
         if (data) {
           const hash = JSON.stringify(data);
           if (hash !== lastEmittedSearch.current) {
             lastEmittedSearch.current = hash;
             onSearch(data, true);
           }
         }
       }, 1200); 
       return () => clearTimeout(timer);
    }
  }, [stops, startDate, calculateRouteData, onSearch, hasInteracted]);

  const handleManualSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (maintenanceMode) return;
    
    // Require user to select a date mechanically
    if (!startDate) {
        setErrorMsg(language === Language.EN ? "Please select a date" : language === Language.RU ? "Выберите дату поездки" : "Сапар күнін таңდაңыз");
        setCalendarOpen(true);
        if (datePickerRef.current) {
            datePickerRef.current.setFocus();
        }
        return;
    }

    let currentStops = [...stops];
    if (activeInputIndex !== null && searchQuery.trim() !== '') {
        const query = searchQuery.trim();
        const bestMatch = filteredLocations.length > 0 ? (language === Language.EN ? filteredLocations[0].nameEn : language === Language.RU ? filteredLocations[0].nameRu : filteredLocations[0].nameKz) : query;
        currentStops[activeInputIndex] = { ...currentStops[activeInputIndex], name: bestMatch || query };
        setStops(currentStops);
        setActiveInputIndex(null);
        setSearchQuery('');
    }

    const cleanStops = currentStops.map(s => s.name).filter(s => s.trim() !== '');
    if (cleanStops.length < 2) { 
        setErrorMsg(language === Language.EN ? "Route required" : language === Language.RU ? "Маршрут обязателен" : "Маршрут қажет"); 
        return; 
    }
    
    const data = await calculateRouteData(currentStops, startDate);
    if (data) {
        onSearch(data, false);
    }
    else setErrorMsg(language === Language.EN ? "Location not found. Check spelling." : language === Language.RU ? "Локация не найдена. Проверьте написание." : "Орын табылмады. Жазылуын тексеріңіз.");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setActiveInputIndex(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLocation = (idx: number, loc: LocationOption) => {
      const newStops = [...stops];
      const locName = language === Language.EN ? loc.nameEn : language === Language.RU ? loc.nameRu : loc.nameKz;
      newStops[idx] = { ...newStops[idx], name: locName };
      setStops(newStops);
      setActiveInputIndex(null);
      setSearchQuery('');
      setErrorMsg(null);
      setHasInteracted(true);
      
      // Force keyboard close on mobile
      if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
      }
  };

  const swapLocations = (i1: number, i2: number) => {
      setStops(prev => {
          const fresh = [...prev];
          const tmp = fresh[i1].name;
          fresh[i1].name = fresh[i2].name;
          fresh[i2].name = tmp;
          return fresh;
      });
      setHasInteracted(true);
  };

  const addStop = () => {
    const newStops = [...stops];
    const newId = `stop-${Date.now()}-${newStops.length}`; 
    newStops.push({ id: newId, name: '' });
    setStops(newStops);
    setHasInteracted(true);
  };

  const removeStop = (idx: number) => {
      if (stops.length > 2) {
          setStops(stops.filter((_, i) => i !== idx));
          setHasInteracted(true);
      }
  };

  return (
    <div ref={wrapperRef} className="w-full max-w-xl mx-auto relative z-40 px-4">
      <div className={`bg-slate-900/65 backdrop-blur-md rounded-[20px] p-5 md:p-6 shadow-2xl border border-white/10 ${maintenanceMode ? 'grayscale pointer-events-none opacity-50' : ''}`}>
        
        <form onSubmit={handleManualSearch} className="flex flex-col w-full relative">
            <div className="flex flex-col gap-4 pl-10 md:pl-12">
                <div className="relative flex flex-col gap-3">
                    {/* Dotted vertical line connecting the map icons */}
                    <div className="absolute left-[-32px] md:left-[-36px] top-6 bottom-6 w-[2px] border-l-[3px] border-dotted border-white/30 z-0"></div>

                    {stops.map((stop, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === stops.length - 1;
                        const isActive = activeInputIndex === idx;
                        return (
                            <div key={stop.id} className={`w-full relative ${isActive ? 'z-[100]' : 'z-10'}`}>
                                {/* Left icon floating out of the box */}
                                <div className="absolute left-[-42px] md:left-[-48px] top-1/2 -translate-y-1/2 flex items-center justify-between w-[34px] md:w-[38px] z-10 pointer-events-none">
                                    <GripVertical size={16} className="text-white/40" />
                                    {isFirst ? (
                                        <MapPin size={22} className="text-[var(--primary)]" strokeWidth={2.5} fill="var(--primary)" fillOpacity={0.2} />
                                    ) : isLast ? (
                                        <Flag size={20} className="text-white" fill="white" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-[var(--primary)] border-2 border-white mx-0.5" />
                                    )}
                                </div>

                                {/* White Input */}
                                <div 
                                    onClick={() => { 
                                        if (isMobile) {
                                            setActiveInputIndex(idx);
                                            setModalTitle(isFirst ? (isEn ? "Pick-up Location" : "Откуда?") : isLast ? (isEn ? "Destination" : "Куда?") : (isEn ? "Stopover" : "Остановка"));
                                            setIsLocationModalOpen(true);
                                        } else {
                                            setActiveInputIndex(idx); 
                                            setSearchQuery(''); 
                                        }
                                    }}
                                    className={`flex items-center h-12 md:h-14 bg-white rounded-xl md:rounded-2xl px-4 shadow-sm border transition-all cursor-pointer ${isActive ? 'border-amber-500 ring-4 ring-amber-500/10' : 'border-transparent'}`}
                                >
                                    <input 
                                        ref={isActive ? locationInputRef : null}
                                        type="text"
                                        value={isActive ? searchQuery : (stop.name || '')}
                                        onChange={(e) => { if (isActive) setSearchQuery(e.target.value); }}
                                        placeholder={stop.name ? stop.name : (
                                            isFirst ? (
                                                language === Language.EN ? "Where from? Choose airport or city" : language === Language.RU ? "Откуда? Выберите аэропорт или город" : "Қайдан? Әуежайды немесе қаланы таңдаңыз"
                                            ) : isLast ? (
                                                language === Language.EN ? "Where to? Choose airport or city" : language === Language.RU ? "Куда? Выберите аэропорт или город" : "Қайда? Әуежайды немесе қаланы таңдаңыз"
                                            ) : (
                                                language === Language.EN ? "Add stop..." : language === Language.RU ? "Остановка..." : "Аялдама..."
                                            )
                                        )}
                                        className={`w-full bg-transparent text-[14px] md:text-[15px] font-medium outline-none truncate ${isActive ? 'text-slate-900 pointer-events-auto' : 'text-slate-700 pointer-events-none placeholder:text-slate-400'}`}
                                        readOnly={!isActive}
                                    />
                                    <div className="flex-shrink-0 ml-2 flex items-center">
                                        {isFirst && !isActive && stops.length === 2 && (
                                            <button 
                                              type="button" 
                                              onClick={(e) => { e.stopPropagation(); swapLocations(0, 1); }} 
                                              aria-label={language === Language.EN ? "Swap pickup and destination" : language === Language.RU ? "Поменять местами" : "Орындарды ауыстыру"}
                                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                                            >
                                                <ArrowUpDown size={18} strokeWidth={2.5} />
                                            </button>
                                        )}
                                        {!isFirst && !isLast && !isActive && (
                                            <button 
                                              type="button" 
                                              onClick={(e) => { e.stopPropagation(); removeStop(idx); }} 
                                              aria-label={language === Language.EN ? "Remove stop" : language === Language.RU ? "Удалить остановку" : "Аялдамани жою"}
                                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <X size={18} strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {isActive && !isMobile && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100] max-h-[220px] md:max-h-[300px] overflow-y-auto">
                                        {filteredLocations.length > 0 ? (
                                            <div className="py-2">
                                                {filteredLocations.map((loc, lIdx) => (
                                                    <div 
                                                        key={lIdx}
                                                        onClick={(e) => { e.stopPropagation(); selectLocation(idx, loc); }}
                                                        className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                            {loc.type === 'AIRPORT' ? <Navigation size={14} /> : <MapPin size={14} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[13px] md:text-sm font-bold text-slate-900 truncate">
                                                              {language === Language.EN ? loc.nameEn : language === Language.RU ? loc.nameRu : loc.nameKz}
                                                            </div>
                                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{loc.type}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                                {language === Language.EN ? "No results" : language === Language.RU ? "Ничего не найдено" : "Нәтиже жоқ"}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Add stop button */}
                <button type="button" onClick={addStop} className="w-full h-12 md:h-14 border border-white/30 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-white/10 active:bg-white/20 transition-all">
                    <Plus size={20} strokeWidth={2.5} />
                    <span className="text-[14px] md:text-[15px]">{language === Language.EN ? "Add stop" : language === Language.RU ? "Добавить остановку" : "Аялдама қосу"}</span>
                </button>

                {/* Date Picker row — V26.8.8 FIX: overflow-hidden removed, natural open state */}
                <div className="w-full relative group">
                    <div 
                        className="flex items-center h-12 md:h-14 bg-white rounded-xl px-4 shadow-sm cursor-pointer border border-transparent hover:border-amber-400 transition-all relative"
                    >
                        <Calendar className="text-amber-500 shrink-0 absolute left-4 z-10 pointer-events-none" size={20} strokeWidth={2.5} />
                        
                        <div className="flex-1 flex justify-center items-center relative z-20 cursor-pointer">
                            <DatePicker 
                                ref={datePickerRef}
                                selected={startDate}
                                onInputClick={() => setCalendarOpen(true)}
                                onClickOutside={() => setCalendarOpen(false)}
                                onChange={(d: Date) => { 
                                    setStartDate(d); 
                                    setErrorMsg(null); 
                                    setHasInteracted(true); 
                                    setCalendarOpen(false); 
                                    if (document.activeElement instanceof HTMLElement) {
                                        document.activeElement.blur();
                                    }
                                }} 
                                onCalendarOpen={() => setCalendarOpen(true)}
                                onCalendarClose={() => setCalendarOpen(false)}
                                dateFormat="d MMMM yyyy" 
                                minDate={new Date()} 
                                locale={language === Language.EN ? 'en-US' : language === Language.RU ? 'ru' : 'kk'}
                                placeholderText={language === Language.EN ? "Select Date" : language === Language.RU ? "Select Date" : "Сапар күні"}
                                wrapperClassName="w-full"
                                calendarClassName="booking-calendar-premium"
                                className="w-full bg-transparent text-center font-bold text-base md:text-lg text-slate-800 outline-none cursor-pointer placeholder:text-slate-400 caret-transparent"
                                withPortal={isMobile}
                                popperPlacement="top-start"
                                popperModifiers={[{ name: 'offset', options: { offset: [0, 8] } }] as any}
                            />
                        </div>

                        <MoreHorizontal className="text-amber-400 shrink-0 absolute right-4 z-10 pointer-events-none" size={20} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Submit button */}
                <button 
                    type="submit" 
                    disabled={isCalculating} 
                    className="w-full h-14 md:h-16 mt-2 bg-[var(--primary-contrast)] hover:bg-orange-800 active:scale-[0.98] transition-all rounded-xl md:rounded-2xl shadow-lg border border-orange-800/50 flex items-center justify-center"
                >
                    {isCalculating ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                            <span className="text-white font-bold text-[17px] md:text-[19px] uppercase tracking-widest">{language === Language.EN ? 'Calculating...' : language === Language.RU ? 'Расчет...' : 'Есептеу...'}</span>
                        </div>
                    ) : (
                        <span className="text-white font-bold text-[17px] md:text-[19px]">{language === Language.EN ? 'Find car' : language === Language.RU ? 'Найти автомобиль' : 'Көлік табу'}</span>
                    )}
                </button>
            </div>
            
            {errorMsg && (
                <div className="absolute -bottom-10 left-0 right-0 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest text-center py-2 rounded-xl">
                    {errorMsg}
                </div>
            )}
        </form>
      </div>

      <div className="w-full flex justify-center mt-3">
         {!errorMsg && routeInfo && routeInfo.distance > 0 && (
             <div className="bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-full flex gap-6 text-white border border-white/10 shadow-lg">
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] uppercase font-bold text-white/50 tracking-white">{language === Language.EN ? 'Distance:' : language === Language.RU ? 'Дист:' : 'Қашықтық:'}</span>
                     <span className="text-[13px] font-black">{routeInfo.distance} km</span>
                 </div>
                 <div className="w-px bg-white/20"></div>
                 <div className="flex items-center gap-2">
                     <span className="text-[10px] uppercase font-bold text-white/50 tracking-white">{language === Language.EN ? 'Time:' : language === Language.RU ? 'Время:' : 'Уақыт:'}</span>
                     <span className="text-[13px] font-black">{Math.floor(routeInfo.duration/60)}h {Math.round(routeInfo.duration%60)}m</span>
                 </div>
             </div>
         )}
      </div>

      <LocationSelectorModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSelect={(loc) => {
              if (activeInputIndex !== null) {
                  selectLocation(activeInputIndex, loc);
              }
              setIsLocationModalOpen(false);
          }}
          locations={allLocations}
          language={language}
          title={modalTitle}
      />
    </div>
  );
};

export default TripSearchBox;