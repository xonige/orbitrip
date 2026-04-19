// Version History (File Level):
// v26.8.2 - Deployment Resilience & Metrica Fixes
// v26.8.0 - Senior Consolidation & Analytics Polish
// v26.4.0 - Google Ads Analytics Integration

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { analytics } from '../utils/analytics';

// Types & Services
import { Language, Booking, TripSearch, Driver, SystemSettings, Tour } from '../types';
import { db } from '../services/db';
import { smsService } from '../services/smsService';
import { telegramService } from '../services/telegramService';
import { generateLocalBusinessSchema, generateFAQSchema } from '../services/schema';

// Standard UI Components
import Header from './Header';
import Footer from './Footer';
import TripSearchBox from './TripSearchBox';
import Hero from './Hero';
import SEO from './SEO';
import ErrorBoundary from './ErrorBoundary';
import { tc } from '../translations';
import { Loader2 } from 'lucide-react';

// Lazy loading utility
const lazyWithRetry = (componentImport: () => Promise<any>) =>
    React.lazy(async () => {
        try {
            return await componentImport();
        } catch (error: any) {
            console.error("Lazy load failed", error);
            const isReloaded = sessionStorage.getItem('orbitrip_lazy_reloaded');
            if (!isReloaded) {
                sessionStorage.setItem('orbitrip_lazy_reloaded', 'true');
                window.location.reload();
                return new Promise(() => { });
            }
            sessionStorage.removeItem('orbitrip_lazy_reloaded');
            return {
                default: () => (
                    <div className="min-h-screen flex items-center justify-center bg-transparent flex-col p-4 text-center z-[200] relative">
                        <div className="bg-transparent p-8 rounded-2xl shadow-xl max-w-md w-full border border-[var(--primary)]/10">
                            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div>
                            <h2 className="text-xl font-black text-gray-900 mb-2">Update Available</h2>
                            <p className="text-gray-500 mb-6 text-sm">A new version of the app is available. Please update to continue.</p>
                            <button
                                onClick={() => {
                                    window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
                                }}
                                className="w-full bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[var(--primary-dark)] transition active:scale-95"
                            >
                                Update Now
                            </button>
                        </div>
                    </div>
                )
            };
        }
    });

// Lazy loaded pages
const Excursions = lazyWithRetry(() => import('./Excursions'));
const BlogList = lazyWithRetry(() => import('./BlogList'));
const VehicleResults = lazyWithRetry(() => import('./VehicleResults').then(m => ({ default: m.VehicleResults })));
const DriverProfile = lazyWithRetry(() => import('./DriverProfile'));
const BookingModal = lazyWithRetry(() => import('./BookingModal'));
const BookingSuccessModal = lazyWithRetry(() => import('./BookingSuccessModal'));
const SocialProofReviews = lazyWithRetry(() => import('./SocialProofReviews'));
const HomeLanding = lazyWithRetry(() => import('./HomeLanding_Optimized'));
const MyBookings = lazyWithRetry(() => import('./MyBookings'));
const AdminLogin = lazyWithRetry(() => import('./AdminLogin'));
const AdminDashboard = lazyWithRetry(() => import('./AdminDashboard'));
const DriverDashboard = lazyWithRetry(() => import('./DriverDashboard'));
const LegalView = lazyWithRetry(() => import('./LegalView'));
const SitemapView = lazyWithRetry(() => import('./SitemapView'));

const DEFAULT_STOPS = ['', ''];

const getInitialParamsFromURL = () => {
    try {
        let from = '';
        let to = '';
        const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
        if (path.startsWith('/transfer/')) {
             const routeSegment = path.replace('/transfer/', '').replace(/\/$/, '').split('-to-');
             if (routeSegment.length >= 2 && routeSegment[0] && routeSegment[1]) {
                 from = routeSegment[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                 to = routeSegment[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
             }
        }
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        from = from || params.get('from') || '';
        to = to || params.get('to') || '';
        const dateStr = params.get('date') || '';
        const step = params.get('step') || '';
        
        const hasParams = !!(from || to || step === 'results');
        return { 
            stops: (from || to) ? [from, to] : DEFAULT_STOPS, 
            date: dateStr, 
            isResults: hasParams || path.startsWith('/transfer/') 
        };
    } catch (e) {}
    return { stops: DEFAULT_STOPS, date: '', isResults: false };
};

const URL_STATE = getInitialParamsFromURL();

const safeHistoryPush = (state: any, title: string, url: string) => {
    try { if (typeof window !== 'undefined' && window.history) window.history.pushState(state, title, url); } catch (e) {}
};

const safeHistoryReplace = (state: any, title: string, url: string) => {
    try { if (typeof window !== 'undefined' && window.history) window.history.replaceState(state, title, url); } catch (e) {}
};

const LoadingSkeleton = () => <div className="min-h-screen bg-[#0f172a]" />;

const App = () => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const storage = typeof window !== 'undefined' ? window.localStorage : null;
            if (!storage) return Language.EN;
            const saved = storage.getItem('orbitrip_lang');
            if (saved) return saved as Language;
            const browserLang = (navigator.language || '').toLowerCase();
            if (browserLang.startsWith('kk')) {
                return Language.KZ;
            }
            if (browserLang.startsWith('ru')) {
                return Language.RU;
            }
            return Language.EN;
        } catch (e) { return Language.EN; }
    });

    const [currentView, setCurrentView] = useState(() => {
        try {
            const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';
            
            if (path.includes('/terms')) return 'LEGAL_TERMS';
            if (path.includes('/privacy')) return 'LEGAL_PRIVACY';
            if (path.includes('/excursions')) return 'EXCURSIONS';
            if (path.includes('/blog')) return 'BLOG';
            if (path.includes('/my-bookings')) return 'MY_BOOKINGS';
            if (path.includes('/admin/dashboard') || path.includes('/admin')) {
                const role = localStorage.getItem('orbitrip_driver_role');
                return role === 'ADMIN' ? 'ADMIN_DASHBOARD' : 'ADMIN_LOGIN';
            }
            if (path.includes('/driver/dashboard') || path.includes('/driver')) return 'DRIVER_DASHBOARD';
            
            if (URL_STATE.isResults) {
                return 'SEARCH_RESULTS';
            }
            
            return 'HOME';
        } catch (e) { return 'HOME'; }
    });

    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
    const [searchBoxKey, setSearchBoxKey] = useState(0);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [tours, setTours] = useState<Tour[]>([]);

    const [searchParams, setSearchParams] = useState<TripSearch | null>(() => {
        try {
            // V24.8.1 — Logic: Only restore draft if we are in results/booking flow or have URL params.
            // If the user lands on the Home page fresh, give them a clean form.
            const isHome = typeof window !== 'undefined' && window.location.pathname === '/';
            const hasUrlIntent = URL_STATE.stops && URL_STATE.stops[0];
            
            if (isHome && !hasUrlIntent) {
                return null;
            }

            const saved = typeof window !== 'undefined' ? sessionStorage.getItem('orbitrip_search_params') : null;
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}
        if (URL_STATE.stops && URL_STATE.stops[0]) {
            return { stops: URL_STATE.stops, date: URL_STATE.date, totalDistance: 0 };
        }
        return null;
    });

    const [searchGuests, setSearchGuests] = useState<number>(2);
    const [isSearching, setIsSearching] = useState(false);
    const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
    const [selectedDriverProfile, setSelectedDriverProfile] = useState<{ driver: Driver, price: number } | null>(null);
    const [bookingNumericPrice, setBookingNumericPrice] = useState<number>(0);
    const [bookingFinalDate, setBookingFinalDate] = useState<string>('');
    const [selectedDriverForBooking, setSelectedDriverForBooking] = useState<Driver | null>(null);
    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [loggedInDriverId, setLoggedInDriverId] = useState<string | null>(() => {
        try { return localStorage.getItem('orbitrip_driver_session'); } catch (e) { return null; }
    });

    const resultsRef = useRef<HTMLDivElement>(null);
    
    // V26.8.2 — SMART REFRESH (Deployment Asset Resilience)
    useEffect(() => {
        const handleError = (e: ErrorEvent) => {
            if (e.message?.toLowerCase().includes('chunkloaderror') || e.message?.toLowerCase().includes('loading chunk')) {
                console.warn("[OrbiTrip] ChunkLoadError detected. New deployment likely active. Reloading...");
                const isReloaded = sessionStorage.getItem('orbitrip_chunk_reload');
                if (!isReloaded) {
                    sessionStorage.setItem('orbitrip_chunk_reload', 'true');
                    window.location.reload();
                } else {
                    sessionStorage.removeItem('orbitrip_chunk_reload');
                }
            }
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    // V26.8.2 — GADS INTENT DETECTION
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const gclid = params.get('gclid');
        const gadSource = params.get('gad_source');
        if (gclid || gadSource) {
            console.log("🎯 Google Ads User Detected:", gclid || gadSource);
            sessionStorage.setItem('orbitrip_gclid_session', 'active');
            // If user lands via ad, track a high-intent page view
            analytics.trackEvent('gads_arrival', { source: gadSource || 'google', gclid: gclid });
        }
    }, []);

    useEffect(() => {
        // v29.0.1 — VAX-FORCE: Clean build for Vercel + Supabase
        window.dispatchEvent(new CustomEvent('orbitrip-ready'));
        setIsDataLoaded(true); 

        const initData = async () => {
            try {
                const settings = await db.settings.get();
                setSystemSettings(settings);
                const [allDrivers, allBookings, allTours] = await Promise.all([
                    db.drivers.getAll(),
                    db.bookings.getAll(),
                    db.tours.getAll()
                ]);
                setDrivers(allDrivers);
                setBookings(allBookings);
                setTours(allTours || []);
            } catch (err) {
                console.error("Init error (Background):", err);
            }
        };
        initData();
    }, []);

    const navigateTo = (view: string, path: string) => {
        setCurrentView(view);
        safeHistoryPush({ view }, '', path);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const handleSearch = useCallback(async (params: TripSearch, isAuto: boolean = false, guests: number = 2) => {
        setSearchGuests(guests);
        if (isAuto) setIsBackgroundUpdating(true);
        else setIsSearching(true);
        
        try {
        analytics.trackSearch(params.stops[0], params.stops[params.stops.length-1], params.totalDistance);
        } catch (e) {}

        try { sessionStorage.setItem('orbitrip_search_params', JSON.stringify(params)); } catch (e) {}

        if (isAuto) {
            await new Promise(resolve => setTimeout(resolve, 600));
            setSearchParams(params);
            setIsBackgroundUpdating(false);
        } else {
            setSearchParams(params);
            setCurrentView('SEARCH_RESULTS');
            safeHistoryPush({ view: 'SEARCH_RESULTS' }, '', '?step=results');
            setTimeout(() => {
                setIsSearching(false);
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 800);
        }
    }, []);

    const handleBackToResults = () => {
        setCurrentView('SEARCH_RESULTS');
        safeHistoryReplace({ view: 'SEARCH_RESULTS' }, '', '?step=results');
    };

    const handleInitiateBooking = (driver: Driver, price: number, date: string) => {
        setSelectedDriverForBooking(driver);
        setBookingNumericPrice(price);
        setBookingFinalDate(date);
        setCurrentView('BOOKING_PAGE');
        safeHistoryPush({ view: 'BOOKING_PAGE' }, '', '/booking');
    };

    const handleBookingSubmit = async (bookingData: any) => {
        try {
            const uniqueId = `bk-${Date.now()}`;
            analytics.identify({ name: bookingData.userName, phone: bookingData.phone });
            analytics.trackEvent('booking_initiated', { price: bookingData.price, driver: bookingData.driverName });
            const newBooking: Booking = { id: uniqueId, ...bookingData, status: 'PENDING', createdAt: Date.now() };
            // Ensure driverName is passed or default to "Unassigned"
            newBooking.driverName = selectedDriverForBooking?.name || 'Unassigned';
            await db.bookings.create(newBooking);
            setLastBooking(newBooking);
            setIsSuccessModalOpen(true);
            telegramService.sendBookingNotification(newBooking).catch(() => { });
            
            // 📈 GOOGLE ADS CONVERSION: Booking_Success_2026 (Updated for Account 856-310-3984)
            try {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'conversion', {
                        'send_to': 'AW-17851891329/pOqFCOi84uobEIH9uMBC',
                        'value': bookingData.numericPrice || 0,
                        'currency': 'GEL',
                        'transaction_id': uniqueId
                    });
                    console.log("✅ GAds Conversion Sent (New Account): ", uniqueId);
                }
            } catch (e) {
                console.error("GAds Conversion Error", e);
            }
        } catch (error) {
            alert(language === Language.EN ? "Error" : "Ошибка");
        }
    };

    const handleReset = () => {
        setSearchParams(null);
        setIsSuccessModalOpen(false);
        setSearchBoxKey(k => k + 1);
        setCurrentView('HOME');
        safeHistoryPush({ view: 'HOME' }, '', '/');
    };

    // v19.1 — Fixed param order: AdminLogin sends (role, driverId?)
    const handleLogin = (role: string, driverId?: string) => {
        const id = driverId || 'admin';
        localStorage.setItem('orbitrip_driver_session', id);
        localStorage.setItem('orbitrip_driver_role', role);

        
        setLoggedInDriverId(id);
        if (role === 'ADMIN') navigateTo('ADMIN_DASHBOARD', '/admin/dashboard');
        else navigateTo('DRIVER_DASHBOARD', '/driver/dashboard');
    };

    const handleLogout = () => {
        setLoggedInDriverId(null);
        localStorage.removeItem('orbitrip_driver_session');
        localStorage.removeItem('orbitrip_driver_role');
        navigateTo('HOME', '/');
    };

    const getDynamicSEO = () => {
        const isRu = language === Language.RU;
        const isKz = language === Language.KZ;
        
        if (searchParams?.stops?.[0] && searchParams?.stops?.[1]) {
            const from = tc(searchParams.stops[0], language);
            const to = tc(searchParams.stops[1], language);
            return {
                title: isKz ? `${from} — ${to} трансфері | OrbiTrip` : isRu ? `Трансфер ${from} — ${to} | OrbiTrip` : `Transfer ${from} to ${to} | OrbiTrip`,
                description: isKz ? `${from} мекенжайынан ${to} қаласына жеке трансферді брондаңыз.` : isRu ? `Забронируйте частный трансфер из ${from} в ${to}.` : `Book a private transfer from ${from} to ${to}.`
            };
        }

        switch(currentView) {
            case 'BLOG': return {
                title: isKz ? "Саяхат блогы | OrbiTrip" : isRu ? "Блог о путешествиях | OrbiTrip" : "Travel Blog | OrbiTrip",
                description: "Travel tips and routes."
            };
            case 'EXCURSIONS': return {
                title: isKz ? "Экскурсиялар | OrbiTrip" : isRu ? "Экскурсии | OrbiTrip" : "Excursions | OrbiTrip",
                description: "Private tours in Georgia."
            };
            default: return {
                title: isKz ? "OrbiTrip — Трансферлер мен экскурсиялар" : isRu ? "OrbiTrip — Трансферы и экскурсии" : "OrbiTrip — Private Transfers & Tours",
                description: "Reliable transfers in Georgia."
            };
        }
    };

    const dynamicSEO = getDynamicSEO();
    const ErrorBoundaryAny = ErrorBoundary as any;

    return (
        <ErrorBoundaryAny language={language}>
            <SEO title={dynamicSEO.title} description={dynamicSEO.description} />
            <Header language={language} setLanguage={setLanguage} onToolSelect={(tool) => tool === 'HOME' ? handleReset() : navigateTo(tool, `/${tool.toLowerCase()}`)} isLoggedIn={!!loggedInDriverId} currentLocation="" onLocationChange={() => {}} />

            <Suspense fallback={<LoadingSkeleton />}>
                <div key={currentView} className="w-full">
                        {(() => {
                            switch (currentView) {
                                case 'ADMIN_LOGIN': return <div className="pt-0 bg-white min-h-screen relative z-[100]"><AdminLogin onLogin={handleLogin} drivers={drivers} language={language} /></div>;
                                case 'ADMIN_DASHBOARD': return <div className="pt-0 bg-slate-50 min-h-screen relative z-[100]"><AdminDashboard bookings={bookings} drivers={drivers} onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)} onUpdateBooking={b => db.bookings.update(b)} onAddDriver={d => db.drivers.create(d)} onUpdateDriver={d => db.drivers.update(d)} onDeleteDriver={id => db.drivers.delete(id)} onLogout={handleLogout} /></div>;
                                case 'DRIVER_DASHBOARD': return <div className="pt-0 bg-slate-50 min-h-screen relative z-[100]"><DriverDashboard bookings={bookings} drivers={drivers} tours={tours} driverId={loggedInDriverId || ''} language={language} onAddDriver={d => db.drivers.create(d)} onUpdateDriver={d => db.drivers.update(d)} onDeleteDriver={id => db.drivers.delete(id)} onLogout={handleLogout} onAddTour={t => db.tours.create(t)} onUpdateTour={t => db.tours.update(t)} onDeleteTour={id => db.tours.delete(id)} onUpdateBookingStatus={(id, status) => db.bookings.updateStatus(id, status)} /></div>;
                                case 'LEGAL_TERMS': return <div className="pt-16"><LegalView type="TERMS" language={language} onBack={handleReset} /></div>;
                                case 'LEGAL_PRIVACY': return <div className="pt-16"><LegalView type="PRIVACY" language={language} onBack={handleReset} /></div>;
                                case 'DRIVER_PROFILE': return selectedDriverProfile ? <div className="pt-24"><DriverProfile driver={selectedDriverProfile.driver} price={selectedDriverProfile.price.toString()} language={language} onBack={handleBackToResults} date={searchParams?.date} search={searchParams} onBook={(dt) => handleInitiateBooking(selectedDriverProfile.driver, selectedDriverProfile.price, dt)} /></div> : null;
                                case 'BOOKING_PAGE': return <div className="pt-16"><BookingModal onBack={handleBackToResults} search={searchParams} language={language} onSubmit={handleBookingSubmit} initialGuests={searchGuests} numericPrice={bookingNumericPrice} selectedDriver={selectedDriverForBooking} initialDate={bookingFinalDate} /></div>;
                                case 'BLOG': return <div className="pt-24"><BlogList language={language} onBookRoute={(f, t) => handleSearch({ stops: [f, t], date: '', totalDistance: 0 }, false)} /></div>;
                                case 'EXCURSIONS': return <Excursions language={language} onBack={handleReset} />;
                                case 'MY_BOOKINGS': return <MyBookings language={language} onBack={handleReset} onCancelBooking={() => {}} />;
                                case 'SEARCH_RESULTS': return (
                                    <div className="bg-slate-900 min-h-screen flex flex-col relative">
                                        <div className="bg-slate-950 pt-20 pb-10 border-b border-white/5 relative overflow-hidden">
                                            <div className="absolute inset-0 z-0">
                                                <img src="/hero_warm.webp" alt="" className="w-full h-full object-cover opacity-30" />
                                                <div className="absolute inset-0 bg-black/60"></div>
                                            </div>
                                            <div className="relative pt-24 pb-16 overflow-hidden">
                                                <div className="max-w-4xl mx-auto">
                                                    <TripSearchBox 
                                                        key={`tsb-results-${searchBoxKey}`} 
                                                        language={language} 
                                                        onSearch={handleSearch} 
                                                        initialStops={searchParams?.stops || URL_STATE.stops} 
                                                        initialDate={searchParams?.date || URL_STATE.date} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {searchParams && (
                                            <div ref={resultsRef} className="p-6 bg-slate-50 overflow-hidden">
                                                <Suspense fallback={<div className="w-full h-96 flex justify-center items-center"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                                                    <VehicleResults 
                                                        search={searchParams} language={language} 
                                                        onBook={(d, p, g, dt) => handleInitiateBooking(d, parseFloat(p), dt)} 
                                                        onProfileOpen={(d, p) => { setSelectedDriverProfile({ driver: d, price: p }); navigateTo('DRIVER_PROFILE', `?driver=${d.id}`); }} 
                                                        onDirectBooking={handleBookingSubmit} onSearchUpdate={handleSearch} 
                                                        isLoading={isSearching || !isDataLoaded} isBackgroundUpdating={isBackgroundUpdating} 
                                                        drivers={drivers} bookings={bookings} onBack={handleReset} initialGuests={searchGuests} hideSearchHeader={true} 
                                                    />
                                                </Suspense>
                                            </div>
                                        )}
                                    </div>
                                );
                                default: return (
                                    <div className="flex-1 bg-white flex flex-col min-h-screen">
                                        {!searchParams && (
                                            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>}>
                                                <div className="flex-1 overflow-y-auto">
                                                    <HomeLanding 
                                                        language={language} 
                                                        onRouteSelect={(from, to, d) => handleSearch({ stops: [from, to], date: '', totalDistance: d }, false)} 
                                                        onExcursionsClick={() => navigateTo('EXCURSIONS', '/excursions')} 
                                                        onSearch={handleSearch}
                                                    />
                                                </div>
                                            </Suspense>
                                        )}
                                    </div>
                                );
                            }
                        })()}
                </div>
            </Suspense>
            <Footer language={language} settings={systemSettings} onNavigate={navigateTo} />
            <BookingSuccessModal isOpen={isSuccessModalOpen} onClose={handleReset} booking={lastBooking} language={language} />
        </ErrorBoundaryAny>
    );
};

export default App;