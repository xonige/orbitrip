import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
    Compass, 
    MapPin, 
    Sparkles, 
    Globe, 
    ChevronRight, 
    ArrowLeft, 
    Star, 
    Clock, 
    ExternalLink, 
    Loader2,
    Users
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, t } from '../translations';
import { viatorService, ViatorProduct } from '../services/viatorService';

interface ExcursionsProps {
  language: Language;
  onBack: () => void;
}

const REGIONS = [
  { id: 'georgia', en: 'All Georgia', ru: 'Вся Грузия', kz: 'Бүкіл Грузия', destId: 22516 },
  { id: 'tbilisi', en: 'Tbilisi', ru: 'Тбилиси', kz: 'Тбилиси', destId: 22516 },
  { id: 'batumi', en: 'Batumi', ru: 'Батуми', kz: 'Батуми', destId: 24045 },
  { id: 'kutaisi', en: 'Kutaisi', ru: 'Кутаиси', kz: 'Кутаиси', destId: 50207 },
  { id: 'kazbegi', en: 'Kazbegi', ru: 'Казбеги', kz: 'Казбеги', destId: 22516 },
  { id: 'mestia', en: 'Mestia', ru: 'Местиа', kz: 'Местия', destId: 50207 },
];

const Excursions: React.FC<ExcursionsProps> = ({ language, onBack }) => {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExcursions = async () => {
      setLoading(true);
      try {
          const data = await viatorService.searchProducts(activeRegion.destId, language);
          setProducts(data);
      } catch (e) {
          console.error("Error fetching excursions:", e);
      } finally {
          setLoading(false);
      }
    };
    fetchExcursions();
  }, [activeRegion, language]);

  const getImageUrl = (product: ViatorProduct) => {
    try {
        const variants = product.images[0]?.variants || [];
        const variant = variants.find(v => v.width >= 400 && v.width <= 800) || variants[0];
        return variant?.url || '/scenic_drive.webp';
    } catch {
        return '/scenic_drive.webp';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 selection:bg-orange-200">
      
      {/* ═══ HERO HEADER ═══ */}
      <div className="bg-slate-950 pt-20 md:pt-32 pb-24 md:pb-36 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <img src="/hero_warm.webp" className="w-full h-full object-cover opacity-20 scale-105 blur-[2px]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-50" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-5 py-2 rounded-full mb-8 backdrop-blur-md">
              <Sparkles size={14} className="text-orange-400 animate-pulse" />
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.25em]">
                {language === Language.EN ? "Premium Excursions" : language === Language.RU ? "Премиальные экскурсии" : "Премиум экскурсиялар"}
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-[-0.05em] leading-[0.8] uppercase mb-6 italic">
              {language === Language.EN ? "Beyond" : language === Language.RU ? "За гранью" : "Шексіз"}<br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 bg-clip-text text-transparent italic">
                {language === Language.EN ? "Georgia" : language === Language.RU ? "Грузии" : "Грузия"}
              </span>
            </h1>

            <p className="text-white/60 text-sm md:text-base font-bold max-w-lg mx-auto uppercase tracking-widest leading-relaxed">
              {language === Language.EN 
                ? "Experience the authentic spirit of Georgia through handpicked professional tours." 
                : language === Language.RU ? "Почувствуйте настоящий дух Грузии с нашими отобранными турами." : "Біздің таңдаулы турларымызбен Грузияның шынайы рухын сезініңіз."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 relative z-20">

        {/* ═══ REGION TABS ═══ */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-3 mb-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 flex flex-wrap justify-center gap-2">
          {REGIONS.map(reg => (
            <button 
              key={reg.id}
              onClick={() => setActiveRegion(reg)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
                activeRegion.id === reg.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin size={14} className={activeRegion.id === reg.id ? 'text-orange-500' : ''} />
              {language === Language.EN ? reg.en : language === Language.RU ? reg.ru : reg.kz}
            </button>
          ))}
        </div>

        {/* ═══ EXCURSION GRID ═══ */}
        <div className="relative min-h-[600px]">
          <>
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center py-40">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20"></div>
                </div>
                <p className="mt-6 text-slate-400 font-black uppercase tracking-[0.3em] text-xs">
                    {t('fetchingAdventures', language)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {products.length > 0 ? products.map((product, i) => (
                  <div
                    key={product.productCode}
                    className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
                  >
                    {/* Image Section */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={getImageUrl(product)} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={product.title}
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex flex-col items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                              {t('fromExcursion', language)}
                          </span>
                          <span className="text-lg font-black text-slate-900 leading-none">
                              ${Math.round(product.pricing.summary.fromPrice)}
                          </span>
                      </div>

                      {/* Rating Overlay */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          <div className="bg-orange-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                              <Star size={12} fill="white" />
                              <span className="text-xs font-black">{product.reviews.combinedAverageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-white/80 text-[10px] font-black uppercase tracking-widest bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                              {product.reviews.totalReviews} {t('reviewsExcursion', language)}
                          </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:p-8 flex flex-col flex-1">
                       <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors line-clamp-2 uppercase italic tracking-tight">
                         {product.title}
                       </h3>

                       <div className="flex flex-wrap gap-3 mb-6">
                           <div className="flex items-center gap-1.5 text-slate-400">
                               <Clock size={14} />
                               <span className="text-[10px] font-bold uppercase">
                                   {product.itinerary?.duration?.fixedDurationInMinutes 
                                     ? `${Math.round(product.itinerary.duration.fixedDurationInMinutes / 60)} ${t('hoursExcursion', language)}`
                                     : t('dayTrip', language)}
                               </span>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400">
                               <Users size={14} />
                               <span className="text-[10px] font-bold uppercase">
                                   {t('guidedTour', language)}
                               </span>
                           </div>
                       </div>
                       
                       <p className="text-xs text-slate-500 font-medium line-clamp-3 mb-8 leading-relaxed">
                           {product.description || t('defaultExcursionDesc', language)}
                       </p>

                       <div className="mt-auto">
                           <a 
                             href={product.productUrl || `https://www.viator.com/tours/search/${product.productCode}?pid=P00203138`} 
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full bg-slate-50 hover:bg-orange-600 text-slate-900 hover:text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group/btn border border-slate-100 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20"
                           >
                             <span className="text-[11px] font-black uppercase tracking-widest">
                                 {t('viewDetailsExcursion', language)}
                             </span>
                             <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                           </a>
                       </div>
                    </div>
                  </div>
                )) : (
                    <div className="col-span-full text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-sm">
                        {t('noExcursionsFound', language)}
                    </div>
                )}
              </div>
            )}
          </>
        </div>

        {/* ═══ EXPERT TIPS FOR ALICE AI / USER VALUE ═══ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
             <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 md:p-12 mb-12">
                  <div className="flex flex-col md:flex-row gap-12">
                       <div className="md:w-1/3">
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
                                 {t('expertInsights', language)}
                            </h3>
                            <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
                       </div>
                       <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">01</span>
                                      {t('bestTimeToVisit', language)}
                                 </h4>
                                 <p className="text-slate-500 text-sm leading-relaxed">
                                      {language === Language.EN 
                                        ? "Late Spring (May) and Autumn (September) offer the perfect balance of mild weather and lush landscapes, ideal for mountain tours." 
                                        : language === Language.RU ? "Поздняя весна (май) и осень (сентябрь) — идеальный баланс мягкой погоды и пышных пейзажей, что отлично подходит для горных туров." : "Көктемнің соңы (мамыр) және күз (қыркүйек) — жұмсақ ауа райы мен керемет пейзаждардың тамаша теңгерімі, бұл таулы турлар үшін өте қолайлы."}
                                 </p>
                            </div>
                            <div>
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px]">02</span>
                                      {t('clothingTip', language)}
                                 </h4>
                                 <p className="text-slate-500 text-sm leading-relaxed">
                                      {language === Language.EN 
                                        ? "When visiting churches, remember to dress modestly. Women usually need headscarves and men should avoid wearing shorts." 
                                        : language === Language.RU ? "При посещении храмов не забудьте одеться скромно. Женщинам обычно нужны платки, а мужчинам стоит избегать шорт." : "Шіркеулерге барғанда қарапайым киінуді ұмытпаңыз. Әдетте әйелдерге орамал керек, ал ер адамдарға шолақ шалбар кимеген жөн."}
                                 </p>
                            </div>
                       </div>
                  </div>
             </div>
        </div>

        {/* ═══ PARTNER NOTICE ═══ */}
        <section className="mt-24 p-12 bg-slate-900 rounded-[48px] relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
                    {t('reliableBooking', language)}
                </h2>
                <p className="text-white/40 text-xs md:text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed">
                    {language === Language.EN 
                      ? "All tours are operated by certified partners via Viator. Enjoy free cancellation on most experiences." 
                      : language === Language.RU ? "Все туры проводятся сертифицированными партнерами через Viator. Бесплатная отмена для большинства туров." : "Барлық турларды сертификатталған серіктестер Viator арқылы жүзеге асырады. Көптеген турлар үшін тегін бас тарту мүмкіндігі бар."}
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={onBack}
                      className="px-8 py-5 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
                    >
                        {t('backToTransfers', language)}
                    </button>
                    <a 
                      href="https://www.viator.com/Georgia/d22511-ttd?pid=P00203138"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-orange-600/20"
                    >
                        {t('searchAllTours', language)}
                    </a>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Excursions;
