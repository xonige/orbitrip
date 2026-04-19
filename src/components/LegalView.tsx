
import React from 'react';
import { Language } from '../types';

interface LegalViewProps {
  type: 'TERMS' | 'PRIVACY';
  language: Language;
  onBack: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, language, onBack }) => {
  const isEn = language === Language.EN;

  const renderTerms = () => (
    <div className="prose prose-indigo max-w-none text-gray-700 font-sans leading-relaxed">
      
      {/* --- CRITICAL DISCLAIMER --- */}
      <div className="bg-amber-50 border-2 border-amber-300 p-6 mb-10 rounded-3xl shadow-sm">
          <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                  <span className="text-3xl">⚖️</span>
              </div>
              <div className="ml-4">
                  <h3 className="text-lg font-black text-amber-900 uppercase tracking-wider mb-2">
                      {isEn ? "Strict Non-Commercial & Liability Disclaimer" : "Строгий отказ от ответственности и некоммерческий статус"}
                  </h3>
                  <div className="text-sm text-amber-800 space-y-3 font-bold">
                      <p>
                          {isEn 
                           ? "This platform is a volunteer-led project designed strictly for demonstration purposes. It is NOT a commercial entity, NOT a business, and NOT a service provider. We act solely as a free information board where volunteers (drivers) may list their information for testing of the system. No financial transactions, commercial bookings, or service agreements are made through this website."
                           : "Эта платформа является волонтерским проектом, созданным исключительно в демонстрационных целях. Она НЕ является коммерческой организацией, НЕ является бизнесом и НЕ является поставщиком услуг. Мы действуем исключительно как бесплатная информационная доска, где волонтеры (водители) могут размещать свою информацию для тестирования системы. Никакие финансовые операции, коммерческие бронирования или соглашения об оказании услуг через этот сайт не заключаются."}
                      </p>
                      <p className="border-t border-amber-200 pt-3">
                          {isEn 
                           ? "THE PLATFORM OWNER AND DEVELOPERS EXCLUDE ALL LIABILITY, LEGAL AND FINANCIAL, FOR ANY ACTIONS OR SERVICES RESULTING FROM INFORMATION FOUND ON THIS SITE. ALL INTERACTION BETWEEN USERS IS VOLUNTARY, PRIVATE, AND INDEPENDENT."
                           : "ВЛАДЕЛЕЦ ПЛАТФОРМЫ И РАЗРАБОТЧИКИ ПОЛНОСТЬЮ ИСКЛЮЧАЮТ ЛЮБУЮ ЮРИДИЧЕСКУЮ И ФИНАНСОВУЮ ОТВЕТСТВЕННОСТЬ ЗА ЛЮБЫЕ ДЕЙСТВИЯ ИЛИ УСЛУГИ, СТАВШИЕ РЕЗУЛЬТАТОМ ИНФОРМАЦИИ, НАЙДЕННОЙ НА ЭТОМ САЙТЕ."}
                      </p>
                  </div>
              </div>
          </div>
      </div>

      <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">
          {isEn ? "Terms & Conditions" : "Правила и Условия"}
      </h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-black text-gray-900">{isEn ? "1. PLATFORM STATUS" : "1. СТАТУС ПЛАТФОРМЫ"}</h3>
          <p>{isEn 
            ? "1.1. OrbiTrip is a privately-owned volunteer directory. We are not a travel agency, not a carrier, and not a financial intermediary. We do not provide transport services." 
            : "1.1. OrbiTrip — это частный волонтерский справочник. Мы не являемся туристическим агентством, перевозчиком или финансовым посредником. Мы не предоставляем транспортные услуги."}</p>
          <p>{isEn 
            ? "1.2. The site owner is a physical person (volunteer) acting without commercial intent. This platform is not a professional business undertaking ('предпринимательская деятельность')." 
            : "1.2. Владелец сайта — физическое лицо (волонтер), действующее без коммерческого умысла. Данная платформа не является предпринимательской деятельностью."}</p>
        </section>

        <section>
          <h3 className="text-xl font-black text-gray-900">{isEn ? "2. ZERO FINANCIAL POLICY" : "2. ОТСУТСТВИЕ ФИНАНСОВЫХ ОПЕРАЦИЙ"}</h3>
          <p>{isEn 
            ? "2.1. No payments are processed on the platform. We do not collect money, deposits, or commissions. No funds ever touch the platform's accounts." 
            : "2.1. На платформе не обрабатываются платежи. Мы не собираем деньги, депозиты или комиссии. Никакие средства никогда не касаются счетов платформы."}</p>
          <p>{isEn 
            ? "2.2. Any financial interaction between users and drivers is strictly private and occurred outside the electronic system of this site." 
            : "2.2. Любое финансовое взаимодействие между пользователями и водителями является строго частным и происходит вне электронной системы этого сайта."}</p>
        </section>

        <section className="p-6 bg-red-50 rounded-2xl border border-red-100 italic">
          <h3 className="text-xl font-black text-red-900 mb-2">{isEn ? "3. EXCLUSION OF LIABILITY" : "3. ИСКЛЮЧЕНИЕ ОТВЕТСТВЕННОСТИ"}</h3>
          <p className="text-red-900">{isEn 
            ? "To the maximum extent permitted by law, the platform owner is not liable for accidents, injuries, losses, or delays caused by individuals listed on this board. Users interact at their own risk." 
            : "В максимальной степени, разрешенной законом, владелец платформы не несет ответственности за несчастные случаи, травмы, убытки или задержки, вызванные лицами, указанными на этой доске. Пользователи взаимодействуют на свой страх и риск."}</p>
        </section>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="prose prose-indigo max-w-none text-gray-700 font-sans">
      <h2 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">{isEn ? "Privacy & Data Policy" : "Приватность и Данные"}</h2>
      
      <div className="space-y-6">
        <p>
          {isEn 
            ? "This policy explains how we handle the minimal data used for system testing." 
            : "Данная политика объясняет, как мы обрабатываем минимальные данные, используемые для тестирования системы."}
        </p>

        <section>
          <h3 className="text-xl font-black text-gray-900">{isEn ? "Data Collection" : "Сбор данных"}</h3>
          <p>{isEn 
            ? "We do not store permanent personal databases. Temporary information (Name/Phone) entered during booking testing is used solely to demonstrate the connectivity system between volunteers and users." 
            : "Мы не храним постоянные базы персональных данных. Временная информация (Имя/Телефон), вводимая во время тестирования бронирования, используется исключительно для демонстрации системы связи между волонтерами и пользователями."}</p>
        </section>

        <section>
          <h3 className="text-xl font-black text-gray-900">{isEn ? "Third Parties" : "Третьи стороны"}</h3>
          <p>{isEn ? "We do not sell, rent, or trade your data. There is no commercial exploitation of user interaction." : "Мы не продаем, не арендуем и не обмениваем ваши данные. Коммерческая эксплуатация взаимодействия с пользователем отсутствует."}</p>
        </section>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-screen">
      <button 
        onClick={onBack}
        className="mb-10 flex items-center bg-gray-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all duration-300"
      >
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {isEn ? "BACK TO MAIN PAGE" : "ВЕРНУТЬСЯ НА ГЛАВНУЮ"}
      </button>

      <div className="bg-white/95 backdrop-blur-xl p-10 md:p-16 rounded-[40px] shadow-2xl border border-white/50">
        {type === 'TERMS' ? renderTerms() : renderPrivacy()}
      </div>
      
      <div className="mt-12 text-center text-xs text-gray-500 font-bold uppercase tracking-widest opacity-60">
        © 2026 OrbiTrip Volunteer Project. All Rights Reserved (Non-Commercial).
      </div>
    </div>
  );
};

export default LegalView;
