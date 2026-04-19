import React, { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, Search, ChevronDown, Heart, TrendingUp, ArrowRight, ChevronLeft, ChevronRight, Filter, SlidersHorizontal, MapPin, Zap, ShieldCheck, Clock, Droplets, Star, Users, MessageCircle, X, Loader2 } from 'lucide-react';
import { Language, TripSearch, Driver, Tour, Booking } from '../types';
import { t, tc } from '../translations';
import { analytics } from '../utils/analytics';
// BookingGlobe removed — replaced with informative trust cards
import { GEORGIAN_LOCATIONS } from '../data/locations';
import DriverCard from './DriverCard';
import { db } from '../services/db'; 
import { calculateEnginePrice, getStartingPrice } from '../services/pricingEngine';
import { RouteSEOInfo } from './RouteSEOInfo';
import TripSearchBox from './TripSearchBox';

interface VehicleResultsProps {
    search: TripSearch;
    language: Language;
    onBook: (driver: Driver, numericPrice: string, guests: number, date: string) => void;
    onDirectBooking: (bookingData: any) => void;
    onSearchUpdate?: (search: TripSearch, isAuto?: boolean) => void;
    onProfileOpen: (driver: Driver, price: number) => void;
    drivers: Driver[];
    tour?: Tour | null;
    onBack: () => void;
    initialGuests?: number;
    bookings?: Booking[];
    tours?: Tour[]; 
    minPrice?: number;
    commissionRate?: number; 
    hideSearchHeader?: boolean;
    isLoading?: boolean;
    isBackgroundUpdating?: boolean;
}

const DRIVERS_PER_PAGE = 12;

const DriverSkeleton = () => (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-pulse h-full flex flex-col">
        <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl"></div>
            <div className="flex-1">
                <div className="h-5 bg-slate-50 rounded-full w-24 mb-3"></div>
                <div className="h-4 bg-slate-50 rounded-full w-16"></div>
            </div>
        </div>
        <div className="w-full aspect-[16/10] bg-slate-50 rounded-[28px] mb-6"></div>
        <div className="space-y-4 mt-auto">
            <div className="h-4 bg-slate-50 rounded-full w-full"></div>
            <div className="h-4 bg-slate-50 rounded-full w-2/3"></div>
            <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-6">
                <div className="h-8 bg-slate-50 rounded-full w-20"></div>
                <div className="h-12 bg-slate-50 rounded-2xl w-32"></div>
            </div>
        </div>
    </div>
);

export const VehicleResults: React.FC<VehicleResultsProps> = ({
    search, language, onBook, onBack, onProfileOpen, initialGuests = 2,
    drivers: propDrivers, minPrice = 30, commissionRate = 15, hideSearchHeader = false, onSearchUpdate,
    bookings = [], tours = [], isLoading = false, isBackgroundUpdating = false
}) => {
    // V24.7 — AUDIT FIX: Improved city matching & failure resilience
    const isEn = language === Language.EN;
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [driverNameFilter, setDriverNameFilter] = useState('');
    const [minSeats, setMinSeats] = useState<number>(0);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const [sortBy, setSortBy] = useState<'price' | 'rating' | 'reviews'>('price');
    const [reviewModalDriver, setReviewModalDriver] = useState<Driver | null>(null);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const [showUpdateToast, setShowUpdateToast] = useState(false);
    const toastMountRef = useRef(0);
    const prevCountRef = useRef(0);

    // Watch for background updates finishing to show a brief toast
    useEffect(() => {
        if (!isBackgroundUpdating && !isLoading) {
            // Check if we already mounted to avoid firing on initial load
            if (toastMountRef.current > 0) {
                setShowUpdateToast(true);
                const ts = setTimeout(() => setShowUpdateToast(false), 2500);
                return () => clearTimeout(ts);
            }
            toastMountRef.current++;
        }
    }, [search, isBackgroundUpdating, isLoading]);
    

    const [uiSelectedDate, setUiSelectedDate] = useState<Date>(() => {
        if (search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)) {
            const [y, m, d] = search.date.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        const d = new Date(); d.setDate(d.getDate() + 1); return d;
    });

    useEffect(() => {
        if (search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)) {
            const [y, m, d] = search.date.split('-').map(Number);
            const newDate = new Date(y, m - 1, d);
            if (newDate.getTime() !== uiSelectedDate.getTime()) {
                setUiSelectedDate(newDate);
            }
        }
    }, [search.date]);

    const topRef = useRef<HTMLDivElement>(null);

    const toLocalISOString = (d: Date): string => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const calculateTotalCost = (driver: Driver): { price: number; approachTime: string } => {
        try {
            const stops = (search.stops || []).filter(Boolean);
            const driverCity = driver.city || 'tbilisi';
            if (stops.length < 2) return { price: minPrice || 30, approachTime: "20-40 min" };
        
        // GROUND TRUTH DISTANCE LOOKUP — overrides haversine when we have verified road data
        const KNOWN_DISTANCES: Record<string, number> = {
            // == FROM TBILISI (Central Hub) ==
            'tbilisi->batumi': 370, 'tbilisi->kutaisi': 230, 'tbilisi->gudauri': 120,
            'tbilisi->mestia': 470, 'tbilisi->borjomi': 160, 'tbilisi->kazbegi': 155,
            'tbilisi->signagi': 110, 'tbilisi->tbs-airport': 18, 'tbilisi->telavi': 95,
            'tbilisi->zugdidi': 330, 'tbilisi->bakuriani': 180, 'tbilisi->uriki': 320,
            'tbilisi->kobuleti': 340, 'tbilisi->poti': 310, 'tbilisi->stepantsminda': 155,

            // == FROM KUTAISI (Western Hub) ==
            'kutaisi->batumi': 150, 'kutaisi->mestia': 240, 'kutaisi->tbilisi': 230,
            'kutaisi->kut-airport': 25, 'kutaisi->borjomi': 135, 'kutaisi->kazbegi': 385,
            'kutaisi->stepantsminda': 385, 'kutaisi->signagi': 340, 'kutaisi->zugdidi': 105,
            'kutaisi->gudauri': 350, 'kutaisi->telavi': 325, 'kutaisi->bakuriani': 165,
            'kutaisi->uriki': 100, 'kutaisi->kobuleti': 120, 'kutaisi->poti': 105,

            // == FROM BATUMI ==
            'batumi->tbilisi': 370, 'batumi->kutaisi': 150, 'batumi->mestia': 270,
            'batumi->bus-airport': 10, 'batumi->kazbegi': 535, 'batumi->stepantsminda': 535,
            'batumi->gudauri': 500, 'batumi->signagi': 490, 'batumi->borjomi': 280,
            'batumi->telavi': 475, 'batumi->bakuriani': 305, 'batumi->poti': 75,
            'batumi->zugdidi': 135,

            // == CROSS-MOUNTAIN & REGIONAL (Crucial for correct pricing) ==
            // Kazbegi & Gudauri always route through Tbilisi to go anywhere else
            'kazbegi->mestia': 625, 'gudauri->mestia': 590,
            'stepantsminda->mestia': 625,
            'kazbegi->borjomi': 315, 'gudauri->borjomi': 280,
            'kazbegi->signagi': 265, 'gudauri->signagi': 230,
            'kazbegi->bakuriani': 345, 'gudauri->bakuriani': 310,
            'kazbegi->telavi': 250, 'gudauri->telavi': 215,

            // Mestia always routes through Zugdidi -> Kutaisi
            'mestia->borjomi': 370, 'mestia->bakuriani': 390,
            'mestia->signagi': 580, 'mestia->telavi': 560,
            'mestia->zugdidi': 130, 'mestia->poti': 230,
            
            // Other major links
            'borjomi->signagi': 270, 'bakuriani->signagi': 295,
            'zugdidi->poti': 60
        };

        // Normalize location names to match KNOWN_DISTANCES keys (exact match first!)
        const normKey = (s: string) => {
            if (!s) return 'unknown';
            const lower = s.toLowerCase().trim();
            const exact = GEORGIAN_LOCATIONS.find(l => l.id === lower || l.nameEn.toLowerCase() === lower || (l.nameRu && l.nameRu.toLowerCase() === lower));
            if (exact) return exact.id;
            const partial = GEORGIAN_LOCATIONS.find(l => 
                l.nameEn.toLowerCase().includes(lower) || lower.includes(l.nameEn.toLowerCase()) ||
                (l.nameRu && l.nameRu.toLowerCase().includes(lower)) || (l.nameRu && lower.includes(l.nameRu.toLowerCase()))
            );
            return partial?.id || lower;
        };
        const nOrigin = normKey(stops[0] || '');
        const nDest = normKey(stops[stops.length - 1] || '');
        const routeKey = `${nOrigin || 'unknown'}->${nDest || 'unknown'}`;
        const knownDist = (nOrigin && nDest) ? (KNOWN_DISTANCES[`${nOrigin}->${nDest}`] || KNOWN_DISTANCES[`${nDest}->${nOrigin}`]) : null;
        
        const rawKm = knownDist || search.totalDistance;
        const innerTripKm = (typeof rawKm === 'number' && !isNaN(rawKm) && rawKm > 0) ? rawKm : 150;
        
        // Check if any stop is mountainous or an airport
        let isMountainous = false;
        let isSemiMountainous = false;
        let hasAirport = false;
        let hasCrossBorder = false;
        
        stops.forEach(s => {
            const clean = s.toLowerCase().trim();
            const loc = GEORGIAN_LOCATIONS.find(l => 
                l.nameEn.toLowerCase().includes(clean) || 
                l.id === clean ||
                (l.nameRu && l.nameRu.toLowerCase().includes(clean)) ||
                (l.nameRu && clean.includes(l.nameRu.toLowerCase()))
            );
            if (loc?.isMountainous) isMountainous = true;
            if (loc?.isSemiMountainous) isSemiMountainous = true;
            if (loc?.type === 'AIRPORT' || clean.includes('airport') || clean.includes('аэропорт')) hasAirport = true;
            
            // Cross Border Detection
            if (['yerevan', 'vladikavkaz', 'baku', 'trabzon', 'armenia', 'russia', 'turkey', 'azerbaijan', 'ереван', 'владикавказ', 'баку', 'трабзон'].some(cb => clean.includes(cb))) {
                hasCrossBorder = true;
            }
        });

        // LINEAR PRICING: Distance × Driver.pricePerKm (×2 if mountain) + 30GEL if airport
        // 1. Geography-based Approach & Return Distance Logic
        const findC = (name: string) => {
            const lower = name.toLowerCase().trim();
            return GEORGIAN_LOCATIONS.find(l => 
                l.id === lower || 
                l.nameEn.toLowerCase().includes(lower) ||
                lower.includes(l.nameEn.toLowerCase()) ||
                (l.nameRu && l.nameRu.toLowerCase().includes(lower)) ||
                (l.nameRu && lower.includes(l.nameRu.toLowerCase()))
            );
        };
        
        const locHome = findC(driverCity);
        const locStart = findC(stops[0]);
        const locEnd = findC(stops[stops.length - 1]);
        
        const R = 6371;
        const getKm = (l1: any, l2: any) => {
            if (!l1 || !l2) return 0; 
            const dLat = (l2.lat - l1.lat) * Math.PI / 180;
            const dLon = (l2.lng - l1.lng) * Math.PI / 180;
            const a = Math.pow(Math.sin(dLat/2), 2) + Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) * Math.pow(Math.sin(dLon/2), 2);
            return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.25);
        };

        // APPROACH/RETURN: Used ONLY for driver arrival time display, NOT for pricing.
        // Georgian market standard (GoTrip, KiwiTaxi, Budget Georgia) uses
        // point-to-point pricing — client pays only for their trip distance.
        const approachKmForTime = getKm(locHome, locStart);
        
        // Price is calculated on TRIP DISTANCE ONLY (market standard)
        let finalPrice = calculateEnginePrice(
            driver, 
            innerTripKm,
            0, 0, // approach/return
            isMountainous,
            isSemiMountainous,
            stops.length > 2 ? stops.length - 2 : 0, // stops count
            hasAirport,
            hasCrossBorder ? 1 : 0,
            routeKey
        );

        // 2b. ROUND-TRIP BONUS: If start and end are the same city, add tour fee
        const normName = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
        if (stops.length > 2 && normName(stops[0]) === normName(stops[stops.length - 1])) {
            finalPrice += 35; // Round-trip / excursion bonus
        }

        // 3. Approach Time Logic (uses distance for ETA only, not pricing)
        const totalMinutes = Math.round(approachKmForTime * 1.2) + 20; 
        const roundedMinutes = Math.ceil(totalMinutes / 10) * 10;
        
        let approachTimeStr = "";
        if (roundedMinutes < 60) {
            approachTimeStr = `~${roundedMinutes} ${isEn ? 'min' : 'мин'}`;
        } else {
            const h = Math.floor(roundedMinutes / 60);
            const m = roundedMinutes % 60;
            approachTimeStr = `~${h}${isEn ? 'h' : 'ч'}${m > 0 ? ` ${m}${isEn ? 'm' : 'мин'}` : ''}`;
        }

        // V26.8.7 FIX: CRITICAL — Return the calculated values
        const safePrice = (!isNaN(finalPrice) && finalPrice > 0) ? finalPrice : (minPrice || 45);
        return { price: safePrice, approachTime: approachTimeStr || '~30 min' };

        } catch (err) {
            console.error("[OrbiTrip] Error calculating cost for driver:", driver.id, err);
            return { price: minPrice || 45, approachTime: "~30 min" };
        }
    };

    const handleSearchUpdate = (newDate: Date) => {
        setUiSelectedDate(newDate);
        if (onSearchUpdate) onSearchUpdate({ ...search, date: toLocalISOString(newDate) }, true);
    };

    const handleDirectionClick = (destination: string) => {
        setPendingRoute(destination);
        if (onSearchUpdate) onSearchUpdate({ stops: [search.stops[0] || 'Tbilisi', destination], date: toLocalISOString(uiSelectedDate), totalDistance: 120 }, false);
        window.scrollTo({ top: 0, behavior: 'instant' });
        setTimeout(() => setPendingRoute(null), 2000); // Safety fallback
    };

    const handleBookClick = (driver: Driver, price: string) => {
        analytics.trackEvent('driver_selected', { 
            driver_id: driver.id, 
            driver_name: driver.name, 
            price: price, 
            route: `${search.stops[0]} -> ${search.stops[search.stops.length-1]}` 
        });

        onBook(driver, price, 2, toLocalISOString(uiSelectedDate));
    };

    const relevantCity = useMemo(() => {
        const lower = (search.stops[0] || '').toLowerCase();
        if (['tbilisi', 'mtskheta', 'kazbegi', 'gudauri', 'sighnaghi', 'ananuri'].some(c => lower.includes(c))) return 'tbilisi';
        if (search.stops.some(s => ['kutaisi', 'okatse', 'martvili', 'prometheus'].some(c => (s || '').toLowerCase().includes(c)))) return 'kutaisi';
        if (search.stops.some(s => ['batumi', 'sarpi', 'gonio', 'kobuleti'].some(c => (s || '').toLowerCase().includes(c)))) return 'batumi';
        return null;
    }, [search.stops]);

    const filteredAndSortedDrivers = useMemo(() => {
        // V24.7 — Resilience: Ensure we don't show 0 results if we have active drivers
        let list = propDrivers.filter(d => d.status === 'ACTIVE');
        
        // 1. Basic Filters 
        const basicFiltered = list.filter(d => {
            const nameMatch = (!driverNameFilter || d.name.toLowerCase().includes(driverNameFilter.toLowerCase()));
            const seatsMatch = (minSeats === 0 || (d.maxPassengers || 4) >= minSeats);
            return nameMatch && seatsMatch;
        });

        // 2. City Matching - Prioritize but don't strictly exclude
        // If we have no matches for the specific hub, we show ALL active drivers for that vehicle category
        let finalSelection = basicFiltered;
        if (relevantCity) {
            const cityMatch = basicFiltered.filter(d => (d.city || '').toLowerCase() === relevantCity);
            if (cityMatch.length > 0) {
                finalSelection = cityMatch;
            }
        }

        return finalSelection
            .map(driver => ({ driver, ...calculateTotalCost(driver) }))
            .filter(item => selectedCategory === 'All' || item.driver.vehicleType === selectedCategory)
            .sort((a, b) => {
                const getScore = (item: any) => {
                    const ratingScore = (item.driver.rating || 5.0) * 100;
                    const reviewScore = Math.min((item.driver.reviewCount || 0) * 2, 200);
                    const priceScore = (1000 - item.price);
                    return ratingScore + reviewScore + (priceScore / 2);
                };

                if (sortBy === 'rating') return (b.driver.rating || 0) - (a.driver.rating || 0);
                if (sortBy === 'reviews') return (b.driver.reviewCount || 0) - (a.driver.reviewCount || 0);
                if (sortBy === 'price') return a.price - b.price;

                return getScore(b) - getScore(a);
            });
    }, [propDrivers, driverNameFilter, minSeats, selectedCategory, sortBy, relevantCity, search.stops]);

    const paginatedDrivers = filteredAndSortedDrivers.slice(0, currentPage * DRIVERS_PER_PAGE);

    const popularDestinations = useMemo(() => {
        const currentStart = (search.stops[0] || '').trim();
        if (!currentStart) return [];
        const norm = (s: string) => s.toLowerCase().replace('airport', '').replace(/[^a-z]/g, '');
        const sn = norm(currentStart);
        
        return ['Batumi', 'Tbilisi', 'Kazbegi', 'Borjomi', 'Signagi', 'Mestia']
            .filter(d => norm(d) !== sn).slice(0, 6)
            .map(dest => {
                const destinationLoc = GEORGIAN_LOCATIONS.find(l => l.nameEn === dest);
                const startLoc = GEORGIAN_LOCATIONS.find(l => l.nameEn === currentStart || l.id === currentStart.toLowerCase());
                
                // Direct distance heuristic for trending items
                const R = 6371;
                const getKm = (l1: any, l2: any) => {
                    if (!l1 || !l2 || !l1.lat || !l2.lat) return 150;
                    const dLat = (l2.lat - l1.lat) * Math.PI / 180;
                    const dLon = (l2.lng - l1.lng) * Math.PI / 180;
                    const a = Math.pow(Math.sin(dLat/2), 2) + Math.cos(l1.lat * Math.PI / 180) * Math.cos(l2.lat * Math.PI / 180) * Math.pow(Math.sin(dLon/2), 2);
                    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1.35);
                };
                
                // Precise known distances to avoid straight-line haversine artifacts
                const pair = `${currentStart.toLowerCase()}->${dest.toLowerCase()}`;
                const pairRev = `${dest.toLowerCase()}->${currentStart.toLowerCase()}`;
                const KNOWN_DISTS: Record<string, number> = {
                    'tbilisi->batumi': 370, 'tbilisi->kutaisi': 230, 'tbilisi->gudauri': 120,
                    'tbilisi->mestia': 470, 'tbilisi->borjomi': 160, 'tbilisi->kazbegi': 155,
                    'tbilisi->signagi': 110, 'tbilisi->tbs-airport': 18, 'tbilisi->telavi': 95,
                    'tbilisi->zugdidi': 330, 'tbilisi->bakuriani': 180, 'tbilisi->uriki': 320,
                    'tbilisi->kobuleti': 340, 'tbilisi->poti': 310, 'tbilisi->stepantsminda': 155,
                    'kutaisi->batumi': 150, 'kutaisi->mestia': 240, 'kutaisi->tbilisi': 230,
                    'kutaisi->kut-airport': 25, 'kutaisi->borjomi': 135, 'kutaisi->kazbegi': 385,
                    'kutaisi->stepantsminda': 385, 'kutaisi->signagi': 340, 'kutaisi->zugdidi': 105,
                    'kutaisi->gudauri': 350, 'kutaisi->telavi': 325, 'kutaisi->bakuriani': 165,
                    'batumi->tbilisi': 370, 'batumi->kutaisi': 150, 'batumi->mestia': 270,
                    'batumi->bus-airport': 10, 'batumi->kazbegi': 535, 'batumi->stepantsminda': 535,
                    'batumi->gudauri': 500, 'batumi->signagi': 490, 'batumi->borjomi': 280,
                    'kazbegi->mestia': 625, 'gudauri->mestia': 590, 'stepantsminda->mestia': 625,
                    'kazbegi->borjomi': 315, 'gudauri->borjomi': 280,
                    'kazbegi->signagi': 265, 'gudauri->signagi': 230,
                    'mestia->borjomi': 370, 'mestia->bakuriani': 390,
                    'mestia->signagi': 580, 'mestia->telavi': 560
                };
                
                const dist = KNOWN_DISTS[pair] || KNOWN_DISTS[pairRev] || getKm(startLoc, destinationLoc);
                const isMount = destinationLoc?.isMountainous || startLoc?.isMountainous || false;
                const isSemiMount = destinationLoc?.isSemiMountainous || startLoc?.isSemiMountainous || false;
                const teaserPrice = getStartingPrice(dist, isMount, 'Sedan', isSemiMount);
                
                // DYNAMIC PRICING: Use cheapest active driver's rate
                const cheapestDriver = propDrivers
                    .filter(d => d.status === 'ACTIVE' && d.pricePerKm)
                    .sort((a, b) => (a.pricePerKm || 999) - (b.pricePerKm || 999))[0];
                const cheapestRate = cheapestDriver?.pricePerKm || 0.60;
                
                // Consistency fix: The engine counts (Trip + Return). 
                // So "Starting From" must also count dist * 2 to match the cards.
                const totalKm = dist * 2;
                let dynamicPrice = Math.round(totalKm * cheapestRate);
                if (isMount) dynamicPrice = Math.round(dynamicPrice * 1.3);
                dynamicPrice = Math.max(dynamicPrice, 45);
                
                const usd = Math.round(dynamicPrice / 2.7);
                const gel = dynamicPrice;
                return { 
                    destination: dest, 
                    priceGEL: gel,
                    priceUSD: usd,
                    tag: dest === 'Batumi' ? 'Fastest' : dest === 'Kazbegi' ? 'Scenic' : dest === 'Gudauri' ? 'Ski Resort' : 'Nature'
                };
            });
    }, [search.stops, propDrivers]);

    return (
        <div className="bg-white font-sans text-[#333]">
            {!hideSearchHeader && (
                <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">
                                {language === Language.EN ? "Transfer from " : language === Language.RU ? "Трансфер из " : "Трансфер: "}<span className="text-[var(--primary-contrast)]">{tc(search.stops[0], language)}</span>
                                {language === Language.EN ? " to " : language === Language.RU ? " в " : " — "}<span className="text-[var(--primary-contrast)]">{tc(search.stops[search.stops.length-1], language)}</span>
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{search.totalDistance || 0} km
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    {search.totalDuration ? (search.totalDuration >= 60 ? `${Math.floor(search.totalDuration / 60)}h ${search.totalDuration % 60}m` : `${search.totalDuration} min`) : '...'}
                                </span>
                                <button 
                                    onClick={() => setIsSearchExpanded(!isSearchExpanded)} 
                                    aria-label={isEn ? "Modify search route" : "Изменить маршрут"}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary-contrast)] transition-all"
                                >
                                    <Search size={10} /> {isEn ? "Modify" : "Изменить"}
                                </button>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs font-black">
                            <DatePicker 
                                selected={uiSelectedDate} 
                                onChange={(d: Date | null) => d && handleSearchUpdate(d)} 
                                className="bg-transparent outline-none cursor-pointer caret-transparent" 
                                onFocus={(e) => e.target.blur()} 
                                dateFormat="d MMMM yyyy" 
                                minDate={new Date()} 
                                calendarClassName="booking-calendar-premium"
                                renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                                    <div className="flex items-center justify-between px-4 py-4 bg-white md:rounded-t-2xl">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); decreaseMonth(); }} 
                                            disabled={prevMonthButtonDisabled}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-slate-50 text-slate-700 disabled:opacity-30 transition-all border border-slate-100"
                                        >
                                            <ChevronLeft size={16} strokeWidth={2.5} />
                                        </button>

                                        <span className="text-base font-bold text-slate-900 capitalize">
                                            {date.toLocaleString(isEn ? 'en-US' : 'ru-RU', { month: 'short', year: 'numeric' }).replace('.', '')}
                                        </span>

                                        <button 
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); increaseMonth(); }} 
                                            disabled={nextMonthButtonDisabled}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-slate-50 text-slate-700 disabled:opacity-30 transition-all border border-slate-100"
                                        >
                                            <ChevronRight size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            />
                            <span className="ml-2 text-slate-400">📅</span>
                        </div>
                    </div>
                    
                    {/* Expandable Search Form Integration */}
                    {isSearchExpanded && (
                            <div className="w-full bg-slate-900 border-t border-slate-800 overflow-hidden relative">
                                <div className="absolute inset-0 z-0">
                                     <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent"></div>
                                </div>
                                <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                                    <div className="flex justify-between items-center mb-6 max-w-xl mx-auto">
                                        <h3 className="text-white text-lg font-black uppercase italic">{isEn ? 'Update Route' : 'Обновить маршрут'}</h3>
                                        <button onClick={() => setIsSearchExpanded(false)} className="text-slate-400 hover:text-white bg-white/10 w-8 h-8 rounded-full flex flex-col justify-center items-center">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="-mx-4 md:mx-0">
                                        <TripSearchBox 
                                            language={language} 
                                            onSearch={(s, auto) => { 
                                                if (!auto) {
                                                    setIsSearchExpanded(false); 
                                                    if (onSearchUpdate) onSearchUpdate(s, false);
                                                }
                                            }} 
                                            initialStops={search.stops} 
                                            initialDate={search.date}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            )}

            <div id="vehicle-results" className="w-full max-w-6xl mx-auto px-0 pb-12 mt-2 md:mt-12" ref={topRef}>
                <div className="sticky top-[56px] md:top-[90px] z-30 bg-white/95 backdrop-blur-3xl py-3 md:py-5 mb-6 border-b border-slate-100 flex flex-wrap items-center gap-2 px-2 md:px-6 rounded-none md:rounded-[32px] shadow-sm">
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {["All", "Sedan", "SUV", "Minivan"].map((cat) => (
                            <button key={cat} onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} className={`px-6 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all rounded-xl ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900'}`}>
                                {cat === "All" ? (language === Language.EN ? "All" : language === Language.RU ? "Все" : "Барлығы") : cat}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setSortBy(sortBy === 'price' ? 'rating' : 'price')} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-sm ${sortBy === 'price' ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20' : 'bg-white text-slate-600 border-slate-100'}`}>
                        <span>{language === Language.EN ? "Price" : language === Language.RU ? "Цена" : "Баға"}</span><SlidersHorizontal size={12} />
                    </button>
                    <select aria-label="Minimum Seats" value={minSeats} onChange={(e) => { setMinSeats(Number(e.target.value)); setCurrentPage(1); }} className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-[10px] font-black text-slate-600 outline-none shadow-sm">
                        <option value={0}>{language === Language.EN ? 'Seats' : language === Language.RU ? 'Места' : 'Орындар'}</option>
                        <option value={4}>4+</option><option value={6}>6+</option>
                    </select>
                </div>

                {/* Trust & Transparency Banner — Always bilingual for international tourists */}
                <div className="bg-amber-50/50 backdrop-blur-3xl border-y md:border border-amber-100 rounded-none md:rounded-[24px] p-3 md:p-6 mb-4 md:mb-8 group hover:border-amber-200 transition-all duration-500">
                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-400 text-white rounded-full w-fit text-[9px] font-black uppercase tracking-widest">
                            <Zap size={8} fill="white" /> {language === Language.EN ? "Why OrbiTrip?" : language === Language.RU ? "Преимущества OrbiTrip" : "Неге OrbiTrip?"}
                        </div>
                        <div className="hidden md:flex flex-col gap-0.5">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
                                {t('localDriversTitle', language)}
                            </h2>
                            <span className="text-sm font-bold text-slate-400">
                                {t('servedByLocal', language)} · {isEn ? 'No Prepayment' : language === Language.RU ? 'Без предоплаты' : 'Алдын ала төлемсіз'}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-2 bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-slate-100 shadow-sm text-center md:text-left">
                                <div className="p-1.5 bg-emerald-50 rounded-lg md:rounded-xl text-emerald-500 flex-shrink-0"><ShieldCheck size={14} className="md:w-4 md:h-4" /></div>
                                <div>
                                    <span className="font-black text-slate-900 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wide block leading-tight">{language === Language.EN ? "No Prepayment" : language === Language.RU ? "Без предоплаты" : "Алдын ала төлемсіз"}</span>
                                    <span className="block text-[8px] text-slate-500 leading-tight italic opacity-70">Pay to driver</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-2 bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-slate-100 shadow-sm text-center md:text-left">
                                <div className="p-1.5 bg-amber-50 rounded-lg md:rounded-xl text-amber-500 flex-shrink-0"><Clock size={14} className="md:w-4 md:h-4" /></div>
                                <div>
                                    <span className="font-black text-slate-900 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wide block leading-tight">{language === Language.EN ? "Free Waiting" : language === Language.RU ? "Бесплатное ожидание" : "Тегін күту"}</span>
                                    <span className="block text-[8px] text-slate-500 leading-tight italic opacity-70">Airport & Stops</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-2 bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-slate-100 shadow-sm text-center md:text-left">
                                <div className="p-1.5 bg-sky-50 rounded-lg md:rounded-xl text-sky-500 flex-shrink-0"><Star size={14} className="md:w-4 md:h-4" /></div>
                                <div>
                                    <span className="font-black text-slate-900 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wide block leading-tight">{language === Language.EN ? "Verified Drivers" : language === Language.RU ? "Проверено" : "Тексерілген"}</span>
                                    <span className="block text-[8px] text-slate-500 leading-tight italic opacity-70">Real Reviews</span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-1 md:gap-2 bg-white rounded-xl md:rounded-2xl p-2 md:p-3 border border-slate-100 shadow-sm text-center md:text-left">
                                <div className="p-1.5 bg-indigo-50 rounded-lg md:rounded-xl text-indigo-500 flex-shrink-0"><Users size={14} className="md:w-4 md:h-4" /></div>
                                <div>
                                    <span className="font-black text-slate-900 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wide block leading-tight">{language === Language.EN ? "24/7 Support" : language === Language.RU ? "Поддержка 24/7" : "Қолдау 24/7"}</span>
                                    <span className="block text-[8px] text-slate-500 leading-tight italic opacity-70">We are always here</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 px-3 font-black text-slate-900">
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">{filteredAndSortedDrivers.length} {language === Language.EN ? 'verified drivers' : language === Language.RU ? 'ПРЕДЛОЖЕНИЙ' : 'тексерілген жүргізушілер'}</span>
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border border-emerald-100">
                            <ShieldCheck size={10} /> {language === Language.EN ? 'Best Price' : language === Language.RU ? 'Лучшая цена' : 'Ең жақсы баға'}
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="flex flex-col items-center gap-4 mb-12 text-center px-4">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 animate-bounce">
                                <Search size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{isEn ? "Matching you with verified drivers..." : "Ищем проверенных водителей..."}</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{isEn ? `Checking availability for ${search.stops[0]} area` : `Проверяем свободные машины в районе ${search.stops[0]}`}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 w-full opacity-60">
                            {[...Array(6)].map((_, i) => <DriverSkeleton key={i} />)}
                        </div>
                    </div>
                ) : filteredAndSortedDrivers.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center px-6">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                            <Filter size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">
                            {isEn ? "No drivers available right now" : "Нет свободных водителей"}
                        </h2>
                        <p className="text-slate-500 font-bold max-w-md mx-auto mb-8">
                            {isEn 
                                ? "We couldn't find any verified drivers for this route at the moment. Try changing your search criteria or date." 
                                : "К сожалению, мы არ მოიძებნა თავისუფალი მძღოლები ამ მარშრუტისთვის. სცადეთ შეცვალოთ თარიღი ან პარამეტრები."}
                        </p>
                        <button 
                            onClick={() => setIsSearchExpanded(true)}
                            className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
                        >
                            {isEn ? "Modify Search" : "Изменить поиск"}
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        {showUpdateToast && (
                            <div className="absolute top-0 right-0 md:left-1/2 md:-translate-x-1/2 -mt-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 z-50 animate-fadeIn shadow-md">
                                <ShieldCheck size={12} /> {isEn ? "Results Updated" : "Данные Обновлены"}
                            </div>
                        )}
                        <div className={`transition-opacity duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 ${isBackgroundUpdating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            {paginatedDrivers.map((item) => (
                                <div key={item.driver.id} className="border-b last:border-b-0 md:border-b-0">
                                    <DriverCard 
                                        driver={item.driver} 
                                        price={item.price} 
                                        usdPrice={Math.ceil(item.price / 2.67)} 
                                        eurPrice={Math.ceil(item.price / 2.95)} 
                                        kztPrice={Math.round(item.price * (450/2.67))} 
                                        approachTime={item.approachTime} 
                                        isEn={isEn} 
                                        language={language}
                                        onProfileClick={onProfileOpen} 
                                        onBookClick={handleBookClick} 
                                        onReviewsClick={setReviewModalDriver} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {paginatedDrivers.length < filteredAndSortedDrivers.length && (
                    <div className="flex justify-center mt-20">
                        <button onClick={() => { prevCountRef.current = paginatedDrivers.length; setCurrentPage(currentPage + 1); }} className="px-12 py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--primary)] transition-all shadow-xl shadow-slate-900/10 active:scale-95">{isEn ? "Discover More" : "Показать еще"}</button>
                    </div>
                )}

                <div className="mt-24 pt-16 border-t border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">{isEn ? "Trending Destinations" : "Популярно"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { from: 'Kutaisi Airport', to: 'Tbilisi', price: 215, usd: 80, time: '~5h', tag: 'Most Booked' },
                            { from: 'Kutaisi Airport', to: 'Batumi', price: 110, usd: 41, time: '~3h', tag: 'Fastest' },
                            { from: 'Tbilisi', to: 'Batumi', price: 315, usd: 117, time: '~7h', tag: 'Classic' },
                            { from: 'Tbilisi', to: 'Kazbegi', price: 210, usd: 78, time: '~3h', tag: 'Scenic' },
                            { from: 'Tbilisi', to: 'Gudauri', price: 165, usd: 61, time: '~3h', tag: 'Ski Resort' },
                            { from: 'Tbilisi', to: 'Borjomi', price: 220, usd: 81, time: '~3h', tag: 'Nature' },
                            { from: 'Kutaisi', to: 'Mestia', price: 325, usd: 120, time: '~5h', tag: 'Adventure' },
                            { from: 'Batumi', to: 'Tbilisi', price: 315, usd: 117, time: '~7h', tag: 'Return' },
                        ].map((route, i) => (
                            <div key={i} onClick={() => handleDirectionClick(route.to)} className="p-5 bg-white border border-slate-100 rounded-2xl cursor-pointer hover:shadow-xl transition-all relative group">
                                <span className="absolute -top-2 left-4 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded transition-transform group-hover:scale-110">{route.tag}</span>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{route.from}</div>
                                <h3 className="text-sm font-black text-slate-900 uppercase italic mb-3">{route.to}</h3>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[10px] font-bold text-slate-400">{route.time}</span>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{t('from', language)}</div>
                                        <div className="text-lg font-black text-slate-900 leading-none">{route.price} <span className="text-[10px] text-slate-400 font-bold uppercase">GEL</span></div>
                                        <div className="text-xs font-bold text-slate-400 mt-1">$ {route.usd}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Dynamic SEO and FAQ Section for the selected route */}
            {search.stops.filter(Boolean).length >= 2 && (
                <RouteSEOInfo stops={search.stops.filter(Boolean)} lang={language} />
            )}
            
            {/* INLINE REVIEWS MODAL */}
            {reviewModalDriver && (
                    <div 
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                        onClick={() => setReviewModalDriver(null)}
                    >
                        <div 
                            className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                                <div>
                                    <h3 className="font-black text-xl text-slate-900 tracking-tight">
                                        {isEn ? `${reviewModalDriver.name}'s Reviews` : `Отзывы ${reviewModalDriver.name}`}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1 text-sm font-bold text-slate-500">
                                        <Star size={14} className="text-amber-400" fill="currentColor" />
                                        <span className="text-slate-900">{reviewModalDriver.rating.toFixed(1)}</span>
                                        <span>({reviewModalDriver.reviewCount})</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setReviewModalDriver(null)}
                                    className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
                                >
                                    <span className="text-slate-500 font-bold">X</span>
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto space-y-6">
                                {reviewModalDriver.reviews && reviewModalDriver.reviews.length > 0 ? reviewModalDriver.reviews.map((review: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-black flex-shrink-0">
                                            {review.author.charAt(0)}
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-black text-slate-900">{review.author}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</span>
                                            </div>
                                            <div className="flex text-amber-400 gap-0.5 mb-2">
                                                {[...Array(5)].map((_, s) => <Star key={s} size={10} fill={s < review.rating ? "currentColor" : "none"} className={s < review.rating ? "text-amber-400" : "text-slate-200"} />)}
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                {isEn ? review.textEn : review.textRu}
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 opacity-50">
                                        <MessageCircle size={32} className="mx-auto mb-3" />
                                        <p className="font-black text-xs uppercase tracking-widest">{isEn ? 'No reviews yet' : 'Пока нет отзывов'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            
        </div>
    );
};

export default VehicleResults;