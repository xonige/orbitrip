import React, { useState, useMemo, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ReCAPTCHA from "react-google-recaptcha";
import { 
    Banknote, 
    ShieldCheck, 
    Lock, 
    ArrowLeft, 
    ArrowRight,
    Loader2, 
    MapPin, 
    CheckCircle2,
    Info,
    CreditCard,
    ChevronDown,
    Calendar,
    Car,
    ChevronLeft
} from 'lucide-react';
import { Language, Driver, TripSearch } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { analytics } from '../utils/analytics';

interface BookingPageProps {
  onBack: () => void; 
  search?: TripSearch | null;
  language: Language;
  onSubmit: (data: any) => void;
  initialDate?: string;
  initialGuests?: number;
  numericPrice: number; 
  selectedDriver?: Driver | null;
  isAutoTest?: boolean; 
}

const BookingModal: React.FC<BookingPageProps> = ({ onBack, search, language, onSubmit, initialDate, initialGuests = 1, numericPrice, selectedDriver, isAutoTest = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); 
  const [flightNumber, setFlightNumber] = useState(''); 
  const [notes, setNotes] = useState(''); 
  const [promoCodeInput, setPromoCodeInput] = useState(''); 
  
  const [bookingDate, setBookingDate] = useState<Date | null>(() => {
      const initial = initialDate || search?.date;
      if (initial && /^\d{4}-\d{2}-\d{2}$/.test(initial)) {
          const [y, m, d] = initial.split('-').map(Number);
          return new Date(y, m - 1, d);
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
  });
  
  const paymentMethod = 'CASH'; 

  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const isEn = language === Language.EN;

  useEffect(() => {
    if (captchaToken && isSubmitting) {
        onSubmitBookingDirectly();
    }
  }, [captchaToken]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const detectCountryCode = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.country_calling_code && phone === '') {
            }
        } catch (error) {
            console.warn('Could not detect country code via IP');
        }
    };
    detectCountryCode();
  }, []);

  const fillTestData = () => {
      setName("Test Traveler");
      setEmail("test@orbitrip.ge");
      setPhone("+995 577 123 456");
      setNotes("Testing booking flow (Auto-filled).");
  };

  useEffect(() => {
      if (isAutoTest) {
          fillTestData();
          const timer = setTimeout(() => {
              const submitBtn = document.getElementById('booking-submit-btn-mobile') || document.getElementById('booking-submit-btn-desktop') || document.getElementById('booking-submit-btn');
              if (submitBtn) submitBtn.click();
          }, 1500); 
          return () => clearTimeout(timer);
      }
  }, [isAutoTest]);

  const displayDateFormatted = useMemo(() => {
      if (!bookingDate) return (language === Language.EN ? 'Date not selected' : language === Language.RU ? 'Дата не выбрана' : 'Күнді таңдаңыз');
      
      const d = bookingDate.getDate();
      const m = bookingDate.getMonth();
      const y = bookingDate.getFullYear();
      
      const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthsRu = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
      const monthsKz = ["Қаң", "Ақп", "Нау", "Сәу", "Мам", "Мау", "Шіл", "Тამ", "Қыр", "Қаз", "Қარ", "Жელ"];
      
      const mName = language === Language.EN ? monthsEn[m] : language === Language.RU ? monthsRu[m] : monthsKz[m]; 
      return `${d} ${mName} ${y}`;
  }, [bookingDate, language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    if (honeypot) return;

    const errors: string[] = [];
    if (!bookingDate) errors.push(language === Language.EN ? "Travel Date is required" : language === Language.RU ? "Выберите дату поездки" : "Сапар күнін таңдаңыз");
    if (!name.trim()) errors.push(language === Language.EN ? "Full Name is required" : language === Language.RU ? "Введите Имя и Фамилию" : "Аты-жөніңізді енгіზიңىز");
    if (!phone.trim()) errors.push(language === Language.EN ? "Phone/WhatsApp is required" : language === Language.RU ? "Введите номер телефона" : "Телефон нөмірін енგიზიңىز");
    if (!hour || !minute) errors.push(language === Language.EN ? "Pickup time is required" : language === Language.RU ? "Укажите время встречи" : "Кездесу уақытын көрсетіңიზ");
    
    if (errors.length > 0) {
        setFormErrors(errors);
        const errorView = document.getElementById('booking-error-header');
        errorView?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    setIsSubmitting(true);

    if (!captchaToken && !isAutoTest) {
        try {
            if (recaptchaRef.current) {
                recaptchaRef.current.execute();
            } else {
                onSubmitBookingDirectly();
            }
        } catch (err) {
            onSubmitBookingDirectly();
        }
        return;
    }
    onSubmitBookingDirectly();
  };

  const onSubmitBookingDirectly = async () => {
    const payload = {
        tourId: 'transfer',
        tourTitle: (search ? search.stops.filter(Boolean).join(' ➝ ') : 'Private Transfer'),
        customerName: name,
        contactInfo: `${phone} / ${email}${notes ? ` (Notes: ${notes})` : ''}`,
        date: `${bookingDate ? bookingDate.toISOString().split('T')[0] : 'Unknown'} at ${hour}:${minute}`,
        guests: selectedDriver?.maxPassengers || initialGuests,
        vehicle: selectedDriver?.vehicleType || 'Sedan',
        driverName: selectedDriver?.name || 'Any Driver',
        driverId: selectedDriver?.id,
        driverPhone: selectedDriver?.phoneNumber,
        numericPrice: numericPrice,
        totalPrice: `${numericPrice} GEL`, 
        flightNumber: flightNumber,
        paymentMethod: paymentMethod,
        promoCode: promoCodeInput,
        captchaToken: captchaToken
    };
    
    analytics.identify({ name: name, phone: phone });
    analytics.trackEvent('booking_completed', { 
        driver: selectedDriver?.name || 'Any',
        price: numericPrice,
        payment: paymentMethod
    });
    
    try {
        await onSubmit(payload);
    } catch (err) {
        setFormErrors([language === Language.EN ? "Submission failed" : language === Language.RU ? "Ошибка отправки" : "Жіберу қатесі"]);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans md:py-12 pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 text-[11px] md:text-sm text-slate-500 mb-8 font-medium">
          <span className="cursor-pointer hover:text-slate-800" onClick={onBack}>{language === Language.EN ? "Home" : language === Language.RU ? "Главная" : "Басты бет"}</span>
          <span className="text-slate-300">/</span>
          <span className="cursor-pointer hover:text-slate-800" onClick={onBack}>{language === Language.EN ? "Transfer" : language === Language.RU ? "Трансфер" : "Трансфер"}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">{language === Language.EN ? "Booking" : language === Language.RU ? "Бронирование" : "Бრონდაუ"}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8">
              <h2 className="text-[24px] md:text-[28px] font-black text-slate-900 mb-8 tracking-tight">
                {language === Language.EN ? "Booking Information" : language === Language.RU ? "Информация для бронирования" : "Брондаუ აқპარატი"}
              </h2>

              <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                <input type="text" name="user_verification_confirm" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                
                {formErrors.length > 0 && (
                  <div id="booking-error-header" className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                    {formErrors.map((err, i) => (
                      <div key={i} className="text-red-600 text-[13px] font-bold flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{err}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Full Name" : language === Language.RU ? "Ваше Имя, Фамилия" : "Аты-ჟენინგყזდი"}</label>
                    <input type="text" autoComplete="name" className={`w-full bg-slate-50 border rounded-[16px] px-4 py-4 text-[15px] font-bold text-slate-900 focus:border-[var(--primary)] focus:bg-white outline-none transition-all ${formErrors.length > 0 && !name.trim() ? "border-red-500" : "border-slate-100"}`} placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Phone / WhatsApp" : language === Language.RU ? "Телефон / WhatsApp" : "Телефон / WhatsApp"}</label>
                    <input type="tel" inputMode="tel" autoComplete="tel" className={`w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-4 text-[15px] font-bold text-slate-900 focus:border-[var(--primary)] focus:bg-white outline-none transition-all`} placeholder="+..." value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Email (Optional)" : language === Language.RU ? "Эл.почта" : "Эл.пошта"}</label>
                  <input type="email" autoComplete="email" className="w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-4 text-[15px] font-bold text-slate-900 focus:border-[var(--primary)] focus:bg-white outline-none transition-all" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Pickup Address" : language === Language.RU ? "Адрес подачи" : "Мეკენჯაი"}</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-4 text-[15px] font-bold text-slate-900 focus:border-[var(--primary)] focus:bg-white outline-none transition-all" placeholder={language === Language.EN ? "Hotel name, street..." : language === Language.RU ? "Название отеля" : "Қонақ үй атауы"} value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <div className="bg-slate-950 p-6 rounded-[24px] shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]"></div>
                  <label className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3 ml-1 block relative z-10">{language === Language.EN ? "Travel Date" : language === Language.RU ? "Дата поездки" : "Сапар күні"}</label>
                  <div className="relative z-10">
                    <DatePicker 
                      selected={bookingDate} 
                      onChange={(d: Date | null) => setBookingDate(d)} 
                      minDate={new Date()}
                      className="w-full bg-white/10 border border-white/20 rounded-[16px] px-4 py-4 text-[18px] font-black text-white outline-none focus:border-[var(--primary)] focus:bg-white/20 transition-all cursor-pointer"
                      dateFormat="MMMM d, yyyy"
                      placeholderText={language === Language.EN ? "Select Date" : "Выберите дату"}
                      portalId="calendar-portal"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                      <Calendar size={20} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Pickup Hour" : language === Language.RU ? "Час подачи" : "Сағატ"}</label>
                    <div className={`border rounded-[16px] px-4 py-4 flex items-center justify-between bg-slate-50 relative transition-all ${formErrors.length > 0 && !hour ? "border-red-500" : "border-slate-100"}`}>
                      <select required value={hour} onChange={e => setHour(e.target.value)} className={`w-full bg-transparent text-[15px] font-bold ${!hour ? 'text-slate-400' : 'text-slate-900'} outline-none appearance-none cursor-pointer z-10`}>
                        <option value="" disabled>{language === Language.EN ? "Hour" : language === Language.RU ? "Час" : "Сағат"}</option>
                        {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">{language === Language.EN ? "Pickup Minute" : language === Language.RU ? "Минуты" : "Мин"}</label>
                    <div className={`border rounded-[16px] px-4 py-4 flex items-center justify-between bg-slate-50 relative transition-all ${formErrors.length > 0 && !minute ? "border-red-500" : "border-slate-100"}`}>
                      <select required value={minute} onChange={e => setMinute(e.target.value)} className={`w-full bg-transparent text-[15px] font-bold ${!minute ? 'text-slate-400' : 'text-slate-900'} outline-none appearance-none cursor-pointer z-10`}>
                        <option value="" disabled>{language === Language.EN ? "Min" : language === Language.RU ? "Мин" : "Мин"}</option>
                        {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">
                    {language === Language.EN ? "Additional Note (Optional)" : language === Language.RU ? "Дополнительно" : "Қოსыმша"}
                  </label>
                  <textarea className="w-full bg-slate-50 border border-slate-100 rounded-[16px] px-4 py-4 text-[15px] font-bold text-slate-900 focus:border-[var(--primary)] focus:bg-white outline-none transition-all min-h-[120px] resize-none" placeholder={language === Language.EN ? "Flight number or requests..." : language === Language.RU ? "Номер рейса..." : "Рეის ნემერი..."} value={flightNumber} onChange={e => setFlightNumber(e.target.value)} />
                </div>

                <ReCAPTCHA ref={recaptchaRef} sitekey="6Le1N6wsAAAAALTfhjMgi5v-Hvqtr_hW3i5Nmb_7" size="invisible" onChange={(token) => setCaptchaToken(token)} />
              </form>
            </div>
          </div>

          <div className="w-full lg:w-[380px] space-y-4">
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-8 sticky top-24">
              <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                {language === Language.EN ? "Your Order" : language === Language.RU ? "Ваш заказ" : "Сіზдің тапსყრყსიңყზ"}
              </h3>

              <div className="mb-8">
                {selectedDriver && (
                  <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden relative shadow-sm group">
                    <div className="aspect-[16/9] w-full bg-slate-200 relative overflow-hidden">
                      <img 
                          src={getOptimizedImageUrl(selectedDriver.carPhotoUrl) || '/cars/default-car.jpg'} 
                          alt={selectedDriver.carModel} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/cars/default-car.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                          <div className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
                            {selectedDriver.vehicleType}
                          </div>
                          <div className="text-white text-lg font-black leading-tight flex items-center gap-2">
                             <Car size={16} /> {selectedDriver.carModel}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                          <img 
                            src={getOptimizedImageUrl(selectedDriver.photoUrl)} 
                            className="w-6 h-6 rounded-full border border-white/50 object-cover" 
                            alt={selectedDriver.name}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="text-white text-sm font-bold">{selectedDriver.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <h4 className="text-[18px] font-black text-slate-900 mb-4">{search?.stops.filter(Boolean).join(' - ')}</h4>
                <div className="flex items-center gap-3 text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Calendar size={18} className="text-indigo-500" />
                  <span className="text-[14px] font-bold">{displayDateFormatted}</span>
                </div>

                <div className="space-y-4 relative ml-2">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px border-l-2 border-dashed border-slate-200"></div>
                  {search?.stops.filter(Boolean).map((stop, sIdx) => {
                    const isFirst = sIdx === 0; 
                    const isLast = sIdx === (search.stops.filter(Boolean).length - 1);
                    return (
                      <div key={sIdx} className="flex items-start gap-4 relative">
                        <div className={`w-3.5 h-3.5 rounded-full z-10 ring-4 ring-white shrink-0 mt-1 ${isFirst || isLast ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                        <span className="text-[15px] font-bold text-slate-800 leading-tight">{stop}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[20px] p-6 text-white mb-6 shadow-xl shadow-slate-900/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-black text-white/50 uppercase tracking-widest">{language === Language.EN ? "Final Price" : language === Language.RU ? "Итого" : "Жალპყ ბაღასყ"}</span>
                  <div className="bg-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Banknote size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{language === Language.EN ? "Cash" : language === Language.RU ? "Наличные" : "Қოლამა-Қოლ"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{numericPrice} GEL</span>
                    <span className="text-sm font-bold text-white/40">(${Math.round(numericPrice / 2.7)} | €{Math.round(numericPrice / 2.95)})</span>
                  </div>
                  <span className="text-xs font-black text-white/30">{Math.round(numericPrice * 170).toLocaleString()} ₸</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3 border border-emerald-100">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-bold text-emerald-800 leading-snug">
                    {language === Language.EN ? "Pay cash after the trip." : "Оплата наличными."}
                  </p>
                </div>
                <button 
                  type="submit" 
                  form="booking-form" 
                  disabled={isSubmitting} 
                  className={`w-full h-16 rounded-[20px] text-lg font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 ${isSubmitting ? 'bg-slate-100 text-slate-400' : 'bg-[#f27c38] hover:bg-[#e06b2a] text-white'}`}
                >
                  {isSubmitting ? "..." : (language === Language.EN ? "Confirm" : "Подтвердить")}
                  <ArrowRight size={20} className={isSubmitting ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
