import React, { useState } from 'react';
import { Driver, Language } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { 
    Star, 
    MessageCircle,
    CarFront,
    Users, 
    Briefcase,
    Fuel,
    Wifi, 
    Wind, 
    PawPrint,
    HelpCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CigaretteOff,
    ShieldCheck
} from 'lucide-react';

interface DriverCardProps {
    driver: Driver;
    price: number;
    usdPrice: number;
    eurPrice: number;
    kztPrice: number;
    approachTime: string;
    isEn: boolean;
    language: Language;
    onProfileClick: (d: Driver, p: number) => void;
    onBookClick: (d: Driver, p: string) => void;
    onReviewsClick?: (d: Driver) => void;
}

const DriverCard: React.FC<DriverCardProps> = ({ driver, price, usdPrice, eurPrice, kztPrice, approachTime, isEn, language, onProfileClick, onBookClick, onReviewsClick }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imgError, setImgError] = useState(false);
    const touchStartX = React.useRef<number | null>(null);

    // V24.8.2 - SENIOR FIX: If driver has absolutely no photos, inject a premium default.
    // An empty src="" never triggers onError in some mobile browsers, resulting in bounce-inducing blank squares.
    const rawImages = [driver.carPhotoUrl, ...(driver.carPhotos || [])].filter(Boolean);
    const images = rawImages.length > 0 ? rawImages : ['/cars/default-car.jpg'];
    const hasMultipleImages = images.length > 1;

    const avatarColors = [
        'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 
        'bg-teal-500', 'bg-cyan-500', 'bg-sky-500',
        'bg-violet-500', 'bg-fuchsia-500', 'bg-rose-500'
    ];
    const colorIndex = driver.name.length % avatarColors.length;
    const initialBg = avatarColors[colorIndex];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                setCurrentImgIndex((prev) => (prev + 1) % images.length);
            } else {
                setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
            }
        }
        touchStartX.current = null;
    };

    return (
        <div className="bg-white rounded-none md:rounded-lg shadow-none md:shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col font-sans border-b border-slate-100 last:border-b-0 md:border-b-0">
            <div 
                className="w-full aspect-[4/3] md:aspect-[16/10] relative bg-slate-100 cursor-pointer overflow-hidden"
                onClick={() => onProfileClick(driver, price)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img 
                    key={currentImgIndex}
                    src={getOptimizedImageUrl(images[currentImgIndex])} 
                    onError={(e) => { (e.target as HTMLImageElement).src = '/cars/default-car.jpg'; }}
                    loading="lazy"
                    className="w-full h-full object-cover touch-pan-y" 
                    alt="Car" 
                />
                
                {hasMultipleImages && (
                    <>
                        <button 
                            onClick={prevImage} 
                            aria-label={isEn ? "Previous car image" : "Предыдущее фото"}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/70 rounded-full text-slate-700 hover:bg-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={nextImage} 
                            aria-label={isEn ? "Next car image" : "Следующее фото"}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/70 rounded-full text-slate-700 hover:bg-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
                {hasMultipleImages && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-1 cursor-pointer" onClick={() => onProfileClick(driver, price)}>
                <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 flex-shrink-0 flex items-center justify-center text-white text-lg font-black ${initialBg}`}>
                            {!imgError && driver.photoUrl && !driver.photoUrl.includes('default') ? (
                                <img 
                                    src={getOptimizedImageUrl(driver.photoUrl)} 
                                    loading="lazy"
                                    className="w-full h-full object-cover" 
                                    alt={driver.name} 
                                    onError={() => setImgError(true)} 
                                />
                            ) : (
                                <span>{driver.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-lg hover:text-[var(--primary-contrast)] transition-colors">{driver.name}</span>
                                <CheckCircle2 size={16} className="text-[#00c853]" fill="currentColor" stroke="white" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 text-[10px] text-nowrap font-bold">
                                <MessageCircle size={12} className="text-[var(--primary-contrast)]" fill="currentColor" />
                                <span>{isEn ? 'English / Russian' : 'Русский / English'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-slate-900 font-bold text-lg">
                            <span>{driver.rating.toFixed(1)}</span>
                            <div className="flex gap-0.5 ml-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        fill={i < Math.floor(driver.rating) ? "var(--primary)" : "none"}
                                        className={i < Math.floor(driver.rating) ? "text-[var(--primary-contrast)]" : "text-slate-300"} 
                                    />
                                ))}
                            </div>
                        </div>
                        <div 
                            className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-[var(--primary-contrast)] uppercase tracking-tight mt-0.5 hover:opacity-80 transition-opacity cursor-pointer border-b border-dotted border-[var(--primary-contrast)]/50 pb-[1px]"
                            onClick={(e) => { e.stopPropagation(); if (onReviewsClick) onReviewsClick(driver); }}
                        >
                            <MessageCircle size={12} fill="currentColor" />
                            <span>{driver.reviewCount} {isEn ? 'Reviews' : 'Отзывов'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <CarFront size={14} className="text-[var(--primary-contrast)]" />
                    <span className="font-bold text-slate-900 text-sm hover:text-[var(--primary-contrast)] transition-colors">{driver.carModel}</span>
                    <span className="ml-1 border border-slate-100 rounded-full px-2 py-0.5 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                        {driver.vehicleType}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-4 pb-2">
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-800">
                        <div className="flex items-end gap-1.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 21V16M19 21V16M3 16V10.5C3 9.67157 3.67157 9 4.5 9H19.5C20.3284 9 21 9.67157 21 10.5V16M3 16H21M5 9V4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V9" stroke="var(--primary-contrast)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{driver.maxPassengers}</span>
                        </div>
                        <div className="flex items-end gap-1.5">
                            <Briefcase size={18} className="text-[var(--primary-contrast)]" />
                            <span>3</span>
                        </div>
                        <div className="flex items-end gap-1.5">
                            <Fuel size={18} className="text-[var(--primary-contrast)]" />
                            <span>{isEn ? 'Petrol' : 'Бензин'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <Wind size={14} />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <Wifi size={14} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                            {isEn ? 'Final cost!' : 'Стоимость окончательная!'}
                            <HelpCircle size={12} className="text-slate-400" />
                         </div>
                         <span className="text-[10px] font-black text-slate-600 uppercase">{isEn ? 'Per car' : 'Цена за авто'}</span>
                    </div>
                    <div className="flex items-baseline gap-2.5 text-[var(--primary-contrast)] flex-wrap">
                        <span className="text-[26px] font-black leading-none">$ {usdPrice}</span>
                        <span className="text-[15px] font-black text-slate-600">€ {eurPrice}</span>
                        <span className="text-[13px] font-bold text-slate-600">{price} GEL</span>
                        <span className="text-[12px] font-bold text-slate-600">{kztPrice.toLocaleString()} ₸</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1 mb-3 py-3 px-2 rounded-xl border border-emerald-200 bg-emerald-50 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-tight">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>{isEn ? "No Prepayment — Pay Cash to Driver" : language === Language.RU ? "Без предоплаты — Оплата водителю" : "Алдын ала төлемсіз — Жүргізушіге төлеу"}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600/80">
                        {isEn ? "Secure your ride with zero upfront cost." : language === Language.RU ? "Без предоплаты · Оплата водителю наличными" : "Алдын ала төлемсіз · Сапардан кейін қолма-қол төлеу"}
                    </span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onBookClick(driver, price.toString()); }}
                    className="w-full bg-[var(--primary)] hover:opacity-90 active:scale-[0.98] text-white py-2.5 rounded-lg font-black text-sm mb-1 transition-all shadow-lg shadow-[var(--primary)]/10 uppercase tracking-widest"
                >
                    {isEn ? "Book" : "Забронировать"}
                </button>

                <span className="text-center text-red-500 text-[10px] font-black text-balance px-2 opacity-80 mt-2 uppercase tracking-tight">
                    {isEn ? `Driver arrival: ${approachTime}` : `Прибытие: ${approachTime}`}
                </span>
            </div>
        </div>
    );
};

export default DriverCard;
