import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
    Navigation, 
    Clock, 
    ShieldCheck, 
    Tag, 
    ArrowRight, 
    MapPin, 
    Mountain,
    Users,
    Briefcase,
    Heart,
    Star,
    Coffee,
    Camera,
    ChevronDown,
    Zap,
    Smile
} from 'lucide-react';
import { Language, TripSearch } from '../types';
import { t } from '../translations';
import TripSearchBox from './TripSearchBox';

interface HomeLandingProps {
  language: Language;
  onRouteSelect: (from: string, to: string, dist: number) => void;
  onExcursionsClick: () => void;
  onSearch: (search: TripSearch) => void;
}

const FAQ_ITEMS = [
    { q_en: "How do I book a transfer?", q_ru: "Как забронировать трансфер?", a_en: "Simply select your route and date in the search box above, choose your vehicle, and fill in the details. No prepayment required!", a_ru: "Просто выберите маршрут и дату в поиске выше, выберите автомобиль и заполните данные. Предоплата не требуется!" },
    { q_en: "Can I make stops along the way?", q_ru: "Можно ли делать остановки в пути?", a_en: "Yes! All transfers include unlimited free stops for photos, coffee, or sightseeing. Our drivers are happy to show you the best spots.", a_ru: "Да! Все трансферы включают неограниченное количество бесплатных остановок для фото, кофе или осмотра достопримечательностей." },
    { q_en: "What if my flight is delayed?", q_ru: "Что если мой рейс задержится?", a_en: "Don't worry. We monitor flight statuses and your driver will wait for you at the airport for as long as needed, free of charge.", a_ru: "Не волнуйтесь. Мы следим за статусом рейсов, и ваш водитель будет ждать вас в аэропорту столько, сколько потребуется, бесплатно." }
];

const ROUTE_IMAGES = {
    batumi: "/batumi_economy.png",
    kutaisi: "/kutaisi_economy.png",
    gudauri: "/gudauri_economy.png",
};

const HomeLanding: React.FC<HomeLandingProps> = ({ language, onRouteSelect, onExcursionsClick, onSearch }) => {
  const isEn = language === Language.EN;
  const isRu = language === Language.RU;
  const [minRate, setMinRate] = useState<number>(0.6);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchMinRate = async () => {
        try {
            const res = await fetch(`/api/min-rate`);
            const data = await res.json();
            if (data && data.minRate) {
                setMinRate(parseFloat(data.minRate));
            }
        } catch (e) {
            console.error("Error fetching min rate:", e);
        }
    };
    fetchMinRate();
  }, []);

  const CORE_BENEFITS = [
    { title: isEn ? "Best Prices" : "Лучшие цены", desc: isEn ? "Reliable & Affordable" : "Надежно и доступно", icon: <Tag className="w-5 h-5" /> },
    { title: isEn ? "No Prepayment" : "Без предоплаты", desc: isEn ? "Pay to the driver" : "Оплата водителю", icon: <ShieldCheck className="w-5 h-5" /> },
    { title: isEn ? "Free Waiting" : "Бесплатное ожидание", desc: isEn ? "We track your flight" : "Мы следим за рейсом", icon: <Clock className="w-5 h-5" /> },
    { title: isEn ? "Local Friends" : "Местные друзья", desc: isEn ? "Friendly drivers" : "Дружелюбные водители", icon: <Smile className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-[#FFFDF9] font-sans selection:bg-amber-100 overflow-x-hidden">
      
      {/* ═══ I. HOSPITALITY HERO ═══ */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-56 overflow-hidden">
        {/* Warm Background Mesh */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <div 
                  className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full mb-8"
                >
                    <Heart size={14} className="text-amber-600 fill-amber-600/20" />
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">
                        {isEn ? "Hospitable Transfers" : isRu ? "Гостеприимные трансферы" : "Қонақжай трансферлер"}
                    </span>
                </div>

                <h1 
                  className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8"
                >
                    {isEn ? "Reliable" : isRu ? "Надежные" : "Сенімді"}<br />
                    <span className="text-amber-600 italic">{isEn ? "Economy Transfers" : isRu ? "эконом трансферы" : "эконом трансферлер"}</span>
                </h1>

                <p 
                  className="text-slate-600 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-12"
                >
                    {isEn 
                      ? "The most affordable way to travel across Georgia. Clean cars, friendly local drivers, and zero prepayment stress." 
                      : isRu ? "Самый доступный способ путешествовать по Грузии. Чистые машины, дружелюбные водители и никакого стресса." : "Грузиядағы ең қолжетімді саяхат тәсілі."}
                </p>
            </div>

            {/* ═══ II. TRIP SEARCH BOX (Economy Styled) ═══ */}
            <div className="relative z-30">
                <div className="absolute inset-0 bg-amber-500/10 blur-[100px] -z-10 rounded-full" />
                <TripSearchBox language={language} onSearch={onSearch} />
            </div>
        </div>
      </section>

      {/* ═══ III. SEAMLESS BENEFITS ═══ */}
      <section className="bg-white py-20 border-y border-slate-50">
          <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {CORE_BENEFITS.map((benefit, i) => (
                      <div key={i} className="flex flex-col items-center text-center group">
                          <div className="w-14 h-14 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-sm">
                              {benefit.icon}
                          </div>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{benefit.title}</h3>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">{benefit.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══ IV. POPULAR ROUTES (Standard Choice) ═══ */}
      <section className="py-24 md:py-32 bg-amber-50/30">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">
                      {isEn ? "Easy Routes" : isRu ? "Простые маршруты" : "Танымал бағыттар"}
                  </h2>
                  <div className="w-20 h-1.5 bg-amber-500 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { from: "Tbilisi", to: "Batumi", img: ROUTE_IMAGES.batumi, price: 80, tag: "Coastal" },
                      { from: "Kutaisi", to: "Tbilisi", img: ROUTE_IMAGES.kutaisi, price: 55, tag: "Classic" },
                      { from: "Tbilisi", to: "Gudauri", img: ROUTE_IMAGES.gudauri, price: 45, tag: "Mountain" },
                  ].map((route, i) => (
                      <div 
                        key={i} 
                        onClick={() => onRouteSelect(route.from, route.to, 380)}
                        className="group bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 cursor-pointer"
                      >
                          <div className="relative h-64 overflow-hidden">
                              <img src={route.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`${route.from} to ${route.to} economy transfer`} loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{route.tag}</div>
                              <div className="absolute bottom-6 left-6 text-white">
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{route.from}</span>
                                      <ArrowRight size={12} className="opacity-50" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">{route.to}</span>
                                  </div>
                                  <div className="text-2xl font-black italic uppercase italic-premium">
                                      {route.to}
                                  </div>
                              </div>
                              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl">
                                  <span className="text-xs font-black text-amber-600">Standard ${route.price}</span>
                              </div>
                          </div>
                          <div className="p-8 flex justify-between items-center bg-white group-hover:bg-amber-50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                      <Users size={16} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Economy Sedan</span>
                              </div>
                              <ArrowRight className="text-slate-200 group-hover:text-amber-500 group-hover:translate-x-2 transition-all" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══ V. FAQ (Friendly Support) ═══ */}
      <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">
                      {isEn ? "Helping You Travel" : isRu ? "Помогаем с поездкой" : "Көмек"}
                  </h2>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{isEn ? "Simple answers to common questions" : "Простые ответы на частые вопросы"}</p>
              </div>

              <div className="space-y-4">
                  {FAQ_ITEMS.map((item, i) => (
                      <div key={i} className="bg-amber-50/50 rounded-3xl overflow-hidden border border-amber-100/50">
                          <button 
                            onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                            className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors hover:bg-amber-50"
                          >
                              <span className="font-black text-slate-800 uppercase tracking-tight text-sm md:text-base">
                                  {isEn ? item.q_en : item.q_ru}
                              </span>
                              <ChevronDown className={`text-amber-500 transition-transform duration-300 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                          </button>
                          <>
                              {expandedFaq === i && (
                                  <div className="px-8 pb-8 overflow-hidden">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                      <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                          {isEn ? item.a_en : item.a_ru}
                                      </p>
                                      </div>
                                  </div>
                              )}
                          </>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* ═══ VI. COMMUNTY ═══ */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <div className="max-w-xl mx-auto px-6 text-center relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-[32px] shadow-2xl mb-8">
                  <Heart className="text-white fill-white/20" size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase tracking-tighter italic">
                  {isEn ? "Travel With Friends" : isRu ? "Путешествуйте с друзьями" : "Достармен саяхаттаңыз"}
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-10 leading-relaxed">
                  {isEn 
                    ? "Join our community on Instagram for travel tips and stories." 
                    : isRu ? "Присоединяйтесь к нам в Instagram для советов и историй." : "Біздің Instagram қауымдастығымызға қосылыңыз."}
              </p>
              <a 
                href="https://instagram.com/orbitrip.ge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-amber-50 transition-all active:scale-95"
              >
                  @orbitrip.ge
                  <ArrowRight size={16} />
              </a>
          </div>
      </section>

    </div>
  );
};

export default HomeLanding;
