
import React from 'react';
import { Language, Booking } from '../types';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  language: Language;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({ isOpen, onClose, booking, language }) => {
  if (!isOpen || !booking) return null;

  const isEn = language === Language.EN;
  const isRu = language === Language.RU;
  const isKz = language === Language.KZ;

  // ... (getField logic)

  // ... (handleSaveInfo labels in text file)
  const saveLabel = isEn ? "Save Booking Details" : isRu ? "Сохранить детали" : "Мәліметтерді сақтау";
  const homeLabel = isEn ? 'Return to Home' : isRu ? 'На Главную' : 'Басты бетке';

  // Modal Content
  const title = isEn ? 'Booking Confirmed!' : isRu ? 'Заказ Принят!' : 'Тапсырыс қабылданды!';
  const subtitle = isEn 
                     ? "Your request has been successfully sent to the driver."
                     : isRu ? "Ваш запрос успешно отправлен водителю." : "Сіздің сұранысыңыз жүргізушіге сәтті жіберілді.";
  
  const notifyText = isEn 
                            ? "✅ The driver has been notified and will contact you at the phone number you provided to confirm the trip."
                            : isRu ? "✅ Водитель уже уведомлен и свяжется с вами по указанному номеру телефона для подтверждения поездки." : "✅ Жүргізуші хабардар етілді және сапарды растау үшін сіз көрсеткен телефон нөмірі бойынша хабарласады.";

  const whatsappText = isEn 
                            ? "📱 You can also reach the driver directly via WhatsApp shown below."
                            : isRu ? "📱 Вы также можете связаться с водителем через WhatsApp, указанный ниже." : "📱 Сіз сондай-ақ төменде көрсетілген WhatsApp арқылы жүргізушіге тікелей хабарласа аласыз.";

  const routeLabel = isEn ? 'Route' : isRu ? 'Маршрут' : 'Бағыт';
  const dateLabel = isEn ? 'Date' : isRu ? 'Дата' : 'Күні';
  const totalLabel = isEn ? 'Total' : isRu ? 'Итого' : 'Барлығы';
  const driverWhatsAppLabel = isEn ? "Driver's WhatsApp" : isRu ? "WhatsApp Водителя" : "Жүргізушінің WhatsApp";


  // --- UNIVERSAL DATA ACCESSOR ---
  const getField = (keyCamel: keyof Booking, keySnake: string, fallback: string = 'N/A') => {
      // @ts-ignore - allowing dynamic access for safety against raw objects
      const val = booking[keyCamel] !== undefined ? booking[keyCamel] : booking[keySnake];
      if (val === undefined || val === null || val === '') return fallback;
      return String(val);
  };

  const id = getField('id', 'id', 'NEW');
  const displayId = id.length > 8 ? id.slice(-6).toUpperCase() : id;
  
  const tourTitle = getField('tourTitle', 'tour_title', isEn ? 'Custom Trip' : 'Поездка');
  const date = getField('date', 'date', 'N/A');
  const customerName = getField('customerName', 'customer_name', isEn ? 'Guest' : 'Гость');
  const totalPrice = getField('totalPrice', 'total_price', '0 GEL');
  const driverPhone = getField('driverPhone', 'driver_phone', '');

  const handleSaveInfo = () => {
    const content = `
OrbiTrip Booking Information
----------------------------
Booking ID: #${displayId}
Customer: ${customerName}
Route: ${tourTitle}
Date: ${date}
Total Price: ${totalPrice}
Driver: ${getField('driverName', 'driver_name', 'Any')}
Driver Contact: ${driverPhone || 'Will contact you'}
Status: PENDING

Thank you for choosing OrbiTrip!
`.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OrbiTrip_Booking_${displayId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-slate-900/90 transition-opacity" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full relative">
          
          {/* Decorative Header */}
          <div className="bg-slate-950 h-32 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 to-transparent opacity-50"></div>
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-md shadow-2xl border border-white/20">
                <svg className="h-12 w-12 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
          </div>

          <div className="px-6 pt-8 pb-6">
            <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    {subtitle}
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left mb-6 space-y-2">
                    <p className="text-[11px] font-black text-emerald-700 leading-relaxed">
                        {notifyText}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-600 leading-relaxed">
                        {whatsappText}
                    </p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left relative shadow-sm mb-6">
                    <div className="absolute -top-3 right-4 bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md tracking-wider">
                        #{displayId}
                    </div>

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-start border-b border-gray-200 pb-3 border-dashed">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide mt-1">{routeLabel}</span>
                            <span className="font-bold text-gray-800 text-right max-w-[60%] leading-tight">{tourTitle}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-3 border-dashed">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{dateLabel}</span>
                            <span className="font-bold text-gray-800">{date}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-400 font-medium text-xs uppercase tracking-wide">{totalLabel}</span>
                            <span className="font-black text-[var(--primary)] text-2xl tracking-tighter italic">{totalPrice}</span>
                        </div>
                    </div>
                </div>

                {/* Driver Contact Section */}
                {driverPhone && (
                  <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-green-700 uppercase">{driverWhatsAppLabel}</p>
                      <p className="text-sm font-black text-green-900">{driverPhone}</p>
                    </div>
                    <a 
                      href={`https://wa.me/${driverPhone.replace(/\D/g, '')}?text=Hello, I booked a trip on OrbiTrip. ID: #${displayId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition shadow-md active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.7 27.2 106.2 27.2h.1c122.3 0 222-99.6 222-222 0-59.3-23-115.1-65.1-157.1zM223.9 445.5c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 365.5l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18s-8.8-2.8-12.5 2.8-14.3 18-17.6 21.8-6.5 4.2-12 1.4c-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4s-.3-8.6 2.5-11.4c2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.5-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                      </svg>
                    </a>
                  </div>
                )}

                <button 
                  onClick={handleSaveInfo}
                  className="mb-8 flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-dark)] font-black text-[10px] mx-auto transition active:scale-95 uppercase tracking-[0.2em]"
                >
                  {saveLabel}
                </button>

            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-gray-900 text-sm font-bold text-white hover:bg-black focus:outline-none transition transform active:scale-95"
              onClick={handleClose}
            >
              {homeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
