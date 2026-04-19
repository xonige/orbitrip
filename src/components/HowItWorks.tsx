
import React from 'react';
import { Search, Info, UserCheck, CalendarCheck, PhoneCall, Heart } from 'lucide-react';

const steps = [
  { id: 1, title: 'Маршрут', desc: 'Укажите точки.', Icon: Search },
  { id: 2, title: 'Детали', desc: 'Км и Время.', Icon: Info },
  { id: 3, title: 'Водитель', desc: 'Фото и отзывы.', Icon: UserCheck },
  { id: 4, title: 'Бронь', desc: 'Без предоплаты.', Icon: CalendarCheck },
  { id: 5, title: 'Связь', desc: 'Водитель звонит.', Icon: PhoneCall },
  { id: 6, title: 'Поездка', desc: 'Наслаждайтесь!', Icon: Heart }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">Как это работает</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Простой и прозрачный процесс бронирования вашего идеального путешествия.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="relative group text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[28px] flex items-center justify-center text-[var(--primary)] shadow-sm border border-slate-100 group-hover:bg-[var(--primary)] group-hover:text-white group-hover:shadow-2xl group-hover:shadow-[var(--primary)]/20 transition-all duration-300 transform group-hover:-translate-y-2">
                {React.createElement(step.Icon, { size: 32 } as any)}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white border-2 border-slate-50 rounded-2xl flex items-center justify-center text-slate-900 font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                  {step.id}
                </div>
              </div>
              <div className="pt-2">
                <h4 className="font-black text-slate-900 text-base uppercase tracking-tighter leading-none mb-1.5">{step.title}</h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none opacity-60">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
