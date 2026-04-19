
import React, { useState, useEffect } from 'react';
import { Language, Booking } from '../types';
import { db } from '../services/db';

interface MyBookingsProps {
  language: Language;
  onBack: () => void;
  onCancelBooking: (booking: Booking) => Promise<void>;
}

const MyBookings: React.FC<MyBookingsProps> = ({ language, onBack, onCancelBooking }) => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);

  const isEn = language === Language.EN;

  useEffect(() => {
     const saved = localStorage.getItem('orbitrip_user_email');
     if (saved) {
         setEmail(saved);
         handleSearch(saved);
     }
  }, []);

  const handleSearch = async (targetEmail?: string) => {
    const searchVal = targetEmail || email;
    if (!searchVal) return;
    
    setLoading(true);
    try {
      const data = await db.bookings.getByContact(searchVal);
      // Sort by date (newest first)
      setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
      if (searchVal.includes('@')) localStorage.setItem('orbitrip_user_email', searchVal);
    } catch (error) {
      console.error("Search error", error);
    }
    setLoading(false);
    setSearchDone(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2">
                ← {isEn ? 'Back' : 'Назад'}
            </button>
            <h1 className="text-2xl font-black text-gray-900">{isEn ? 'My Trips' : 'Мои Поездки'}</h1>
            <div className="w-10"></div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">{isEn ? 'Find your bookings' : 'Найти бронирование'}</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder={isEn ? "Enter Email or Phone" : "Введите Email или Телефон"}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                    onClick={() => handleSearch()}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? '...' : (isEn ? 'Search' : 'Найти')}
                </button>
            </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
            {loading && <div className="text-center py-10 text-gray-400 animate-pulse">{isEn ? 'Loading...' : 'Загрузка...'}</div>}
            
            {searchDone && bookings.length === 0 && !loading && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <span className="text-4xl mb-4 block">🏜️</span>
                    <p className="text-gray-500 font-medium">{isEn ? 'No trips found for this contact.' : 'Поездок не найдено.'}</p>
                </div>
            )}

            {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition relative group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 
                                b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {b.status}
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-1">{b.tourTitle}</p>
                            <p className="text-xs text-gray-400 font-medium">{b.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-blue-600">{b.totalPrice}</p>
                            <p className="text-[10px] text-gray-400 font-bold">#{b.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600 border-t border-gray-50 pt-4">
                        <div className="flex items-center gap-1.5">
                            <span>🚗</span> {b.driverName || 'TBD'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>👥</span> {b.guests} {isEn ? 'Pers.' : 'чел.'}
                        </div>
                        {b.driverPhone && b.status !== 'CANCELLED' && (
                           <a href={`tel:${b.driverPhone}`} className="text-blue-500 hover:underline flex items-center gap-1">
                               <span>📞</span> {b.driverPhone}
                           </a>
                        )}
                    </div>

                    {b.status === 'PENDING' && (
                        <button 
                            onClick={() => onCancelBooking(b)}
                            className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-100"
                        >
                            {isEn ? 'CANCEL' : 'ОТМЕНИТЬ'}
                        </button>
                    )}
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
