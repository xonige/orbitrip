import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { 
    Star, 
    CheckCircle2, 
    Languages, 
    Users, 
    Briefcase, 
    Fuel, 
    Wifi, 
    Wind, 
    MapPin, 
    ArrowLeft,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Car,
    Banknote
} from 'lucide-react';
import { Driver, Language } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface DriverProfileProps {
  driver: Driver;
  language: Language;
  onBack: () => void;
  onBook: (date: string) => void;
  price: string;
  date?: string; 
  search?: import('../types').TripSearch | null;
}

const translateFeature = (feature: string, lang: Language) => {
    if (lang === Language.EN) return feature;
    const map: Record<string, { [key in Language.RU | Language.KZ]: string }> = {
        'AC': { [Language.RU]: 'Кондиционер', [Language.KZ]: 'Кондиционер' },
        'WiFi': { [Language.RU]: 'Wi-Fi', [Language.KZ]: 'Wi-Fi' },
        'Water': { [Language.RU]: 'Вода', [Language.KZ]: 'Су' },
        'Child Seat': { [Language.RU]: 'Детское кресло', [Language.KZ]: 'Балалар креслосы' },
        'Roof Box': { [Language.RU]: 'Багажник', [Language.KZ]: 'Жүк салғыш' },
        'Non-Smoking': { [Language.RU]: 'Не курить', [Language.KZ]: 'Шылым шекпейтін' },
        'Ski Rack': { [Language.RU]: 'Лыжный багажник', [Language.KZ]: 'Шаңғы тірегі' },
        'English': { [Language.RU]: 'Английский', [Language.KZ]: 'Ағылшын' },
        'Russian': { [Language.RU]: 'Русский', [Language.KZ]: 'Орыс' },
        'Georgian': { [Language.RU]: 'Грузинский', [Language.KZ]: 'Грузин' }
    };
    return map[feature]?.[lang as Language.RU | Language.KZ] || feature;
};

const getFeatureIcon = (feature: string) => {
    switch (feature) {
        case 'AC': return <Wind size={18} />;
        case 'WiFi': return <Wifi size={18} />;
        default: return <CheckCircle2 size={18} />;
    }
};

const DriverProfile: React.FC<DriverProfileProps> = ({ driver, language, onBack, onBook, price, date, search }) => {
  const isEn = language === Language.EN;
  const isRu = language === Language.RU;
  const isKz = language === Language.KZ;
  
  // Gallery State
  const [activeImage, setActiveImage] = useState(driver.carPhotoUrl);
  const [imgError, setImgError] = useState(false);
  
  // Date State - Initialize with passed date or tomorrow
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [y, m, d] = date.split('-').map(Number);
          return new Date(y, m - 1, d);
      }
      const d = new Date(); 
      d.setDate(d.getDate() + 1); 
      return d;
  });

  // Sync if prop changes
  useEffect(() => {
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const [y, m, d] = date.split('-').map(Number);
          setSelectedDate(new Date(y, m - 1, d));
      }
  }, [date]);

  useEffect(() => {
      const resetScroll = () => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
      };
      resetScroll();
      const t1 = setTimeout(resetScroll, 50);
      const t2 = setTimeout(resetScroll, 300);
      const t3 = setTimeout(resetScroll, 600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [driver.id]);
  
  // Combine all photos
  const allPhotos = [driver.carPhotoUrl, ...(driver.carPhotos || [])].filter(Boolean);

  // Parse numeric price
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  const usdPrice = Math.round(numericPrice / 2.7);

  const handleBookClick = () => {
      // Convert Date object back to YYYY-MM-DD string
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;
      
      onBook(dateString);
  };

  const nextImage = () => {
    const idx = allPhotos.indexOf(activeImage);
    const next = (idx + 1) % allPhotos.length;
    setActiveImage(allPhotos[next]);
  };

  const prevImage = () => {
    const idx = allPhotos.indexOf(activeImage);
    const prev = idx === 0 ? allPhotos.length - 1 : idx - 1;
    setActiveImage(allPhotos[prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 lg:pb-10 animate-fadeIn">
        {/* Navigation / Header */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100 flex items-center justify-between px-4 h-14 md:h-20">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-2 group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline font-bold text-sm">{language === Language.EN ? "Back" : language === Language.RU ? "Назад" : "Артқа"}</span>
            </button>
            <div className="flex-1 text-center">
                <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{language === Language.EN ? "Driver Profile" : language === Language.RU ? "Профиль водителя" : "Жүргізуші профилі"}</span>
            </div>
            <div className="w-20 hidden md:block"></div>
        </div>

        <div className="max-w-6xl mx-auto md:px-6 md:py-8 mt-4 md:mt-0 px-4">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                {/* Left Column: Gallery & Info */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Gallery Section */}
                    <div className="relative aspect-[4/3] md:aspect-[16/9] bg-slate-200 overflow-hidden md:rounded-[24px] shadow-sm">
                        <img 
                            src={getOptimizedImageUrl(activeImage)} 
                            className="w-full h-full object-cover" 
                            alt={driver.carModel} 
                        />
                        {allPhotos.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                                <button onClick={prevImage} className="pointer-events-auto w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"><ChevronLeft size={24}/></button>
                                <button onClick={nextImage} className="pointer-events-auto w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"><ChevronRight size={24}/></button>
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {allPhotos.indexOf(activeImage) + 1} / {allPhotos.length}
                        </div>
                    </div>

                    {/* Driver & Car Info */}
                    <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[4px] border-white shadow-lg bg-slate-100 flex items-center justify-center text-slate-400 text-3xl font-black">
                                        {!imgError && driver.photoUrl && !driver.photoUrl.includes('default') ? (
                                            <img src={getOptimizedImageUrl(driver.photoUrl)} className="w-full h-full object-cover" onError={()=>setImgError(true)} alt={driver.name}/>
                                        ) : (
                                            <span>{driver.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                        <div className="bg-emerald-500 rounded-full text-white p-0.5">
                                            <CheckCircle2 size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{driver.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-black tracking-widest uppercase bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                                            <Languages size={14} className="text-indigo-500" />
                                            {driver.languages.includes('Russian') ? (isEn ? "Russian" : isRu ? "Русский" : "Орыс") : (isEn ? "English" : isRu ? "Английский" : "Ағылшын")}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-black tracking-widest uppercase bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                                            <Car size={14} className="text-indigo-500" />
                                            {driver.carModel}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-black text-xl text-slate-900 leading-none">{driver.rating.toFixed(1)}</span>
                                    <Star size={18} fill="currentColor" className="text-amber-400" />
                                </div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                    {driver.reviewCount} {language === Language.EN ? "Reviews" : language === Language.RU ? "Отзывов" : "Пікірлер"}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full mb-8"></div>

                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{language === Language.EN ? "Vehicle Features" : language === Language.RU ? "Особенности автомобиля" : "Көлік сипаттамалары"}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                <Users size={20} className="text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{isEn ? "Max" : isRu ? "Макс" : "Макс"}</p>
                                    <p className="text-sm font-black text-slate-800">{driver.maxPassengers} {isEn ? "Pax" : isRu ? "Пасс." : "Орын"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                <Briefcase size={20} className="text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{isEn ? "Bag" : isRu ? "Багаж" : "Жүк"}</p>
                                    <p className="text-sm font-black text-slate-800">4 {isEn ? "Large" : isRu ? "Шτ" : "Д"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                <Fuel size={20} className="text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{isEn ? "Fuel" : isRu ? "Тип" : "Тип"}</p>
                                    <p className="text-sm font-black text-slate-800">{driver.vehicleType || (isEn ? "Hybrid" : "Гибрид")}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                <ShieldCheck size={20} className="text-indigo-600" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{isEn ? "Safety" : isRu ? "Защита" : "Қауіпсіздік"}</p>
                                    <p className="text-sm font-black text-slate-800">Grade A</p>
                                </div>
                            </div>
                        </div>

                        {/* Description / Additional features if any */}
                        {driver.features && driver.features.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                {driver.features.map(f => (
                                    <div key={f} className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 text-indigo-700 rounded-xl text-xs font-black border border-indigo-100/50">
                                        {getFeatureIcon(f)}
                                        {translateFeature(f, language)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Sidebar — on mobile appears right after driver info, BEFORE reviews */}
                <div className="w-full lg:w-[400px]">
                    <div className="lg:sticky lg:top-24 space-y-4">
                        <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-indigo-500/5 border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{language === Language.EN ? "Trip Price" : language === Language.RU ? "Цена поездки" : "Сапар бағасы"}</span>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{price} GEL</p>
                                    <p className="text-xs font-black text-slate-400 tracking-wide">{usdPrice} USD | {Math.round(parseFloat(price.replace(/[^0-9.]/g, '')) * 170).toLocaleString()} ₸</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                        <Calendar size={14} className="text-indigo-500" />
                                        {language === Language.EN ? "Transfer Date" : language === Language.RU ? "Дата поездки" : "Сапар күні"}
                                    </label>
                                    <div className="bg-slate-50 border-2 border-slate-50 focus-within:border-indigo-500 focus-within:bg-white rounded-[20px] px-5 py-4 transition-all shadow-sm">
                                        <DatePicker 
                                            selected={selectedDate}
                                            onChange={(d: Date | null) => d && setSelectedDate(d)}
                                            className="w-full bg-transparent text-sm font-black text-slate-900 outline-none cursor-pointer"
                                            dateFormat="dd MMMM yyyy"
                                            minDate={new Date()}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleBookClick}
                                className="w-full bg-[#f27c38] hover:bg-[#e06b2a] text-white h-16 rounded-[22px] text-[16px] font-black uppercase tracking-widest transition-all transform active:scale-[0.98] shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 group"
                            >
                                {language === Language.EN ? "Book This Ride" : language === Language.RU ? "Забронировать" : "Брондау"}
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="grid grid-cols-2 gap-3 mt-8">
                                <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-emerald-100">
                                    <Banknote size={20} className="text-emerald-600" />
                                    <span className="text-[9px] font-black text-emerald-800 uppercase leading-tight tracking-widest">{language === Language.EN ? "Cash Payment after trip" : language === Language.RU ? "Оплата наличными после поездки" : "Сапардан кейін қолма-қөл төлем"}</span>
                                </div>
                                <div className="bg-indigo-50 rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-indigo-100">
                                    <ShieldCheck size={20} className="text-indigo-600" />
                                    <span className="text-[9px] font-black text-indigo-800 uppercase leading-tight tracking-widest">{language === Language.EN ? "Free Cancel" : language === Language.RU ? "Отмена 24ч" : "Тегін бас тарту"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust info */}
                        <div className="bg-slate-900 rounded-[24px] p-6 text-white flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest">{language === Language.EN ? "Instant Confirmation" : language === Language.RU ? "Моментально" : "Жедел растау"}</p>
                                <p className="text-[10px] text-white/50 font-medium leading-tight">{language === Language.EN ? "No prepayment required." : language === Language.RU ? "Без предоплаты." : "Алдын ала төлемсіз."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews — full width below, after the 2-column layout */}
            {driver.reviews && driver.reviews.length > 0 && (
                <div className="mt-6">
                    <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-sm border border-slate-100">
                         <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
                            {isEn ? "Reviews" : isRu ? "Отзывы" : "Пікірлер"}
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs">{driver.reviewCount}</span>
                         </h3>
                         <div className="space-y-8">
                            {driver.reviews.map((review, i) => (
                                <div key={i} className="flex gap-4 sm:gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black shrink-0 border border-slate-100 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-black text-slate-900 tracking-tight">{review.author}</span>
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{review.date}</span>
                                        </div>
                                        <div className="flex text-amber-400 gap-0.5 mb-3">
                                            {[...Array(5)].map((_, s) => <Star key={s} size={12} fill={s < Math.floor(review.rating) ? "currentColor" : "none"} />)}
                                        </div>
                                        <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                                            {isEn ? review.textEn : isRu ? review.textRu : (review.textKz || review.textEn)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* MOBILE STICKY BOTTOM BOOK BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 safe-bottom">
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{language === Language.EN ? "Total Price" : language === Language.RU ? "Итого" : "Барлығы"}</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-slate-900">{price} GEL</span>
                        <span className="text-xs font-bold text-slate-400">({usdPrice} USD)</span>
                    </div>
                </div>
                <button 
                    onClick={handleBookClick}
                    className="bg-[#f27c38] hover:bg-[#e06b2a] text-white px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all transform active:scale-[0.97] shadow-lg shadow-orange-500/20 flex items-center gap-2"
                >
                    {isEn ? "Book Now" : isRu ? "Забронировать" : "Брондау"}
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default DriverProfile;
