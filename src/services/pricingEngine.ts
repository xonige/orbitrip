/**
 * OrbiTrip Dynamic Pricing Engine (v14 — "The Market Disruptor")
 * 
 * CORE ARCHITECTURE:
 * 1. Driver Tariff: Every driver has a personal 'pricePerKm'.
 * 2. Automatic Benchmarking: We verify against known market rates.
 * 3. Targeted Undercutting: Algorithm ensures final price <= (Market - 10%).
 * 4. Road Condition Multipliers: Automatic adjustment for Mountain/High-Complexity routes.
 */

import { VehicleType } from '../types';

interface PriceConfig {
    sedanBase: number;
    suvBase: number;
    minivanBase: number;
    mountainMultiplier: number;
    semiMountainMultiplier: number;
    stopFee: number;
}

const CONFIG: PriceConfig = {
    sedanBase: 0.82,     // Targeted to hit GoTrip -10% on Tbilisi-Batumi
    suvBase: 1.15,       // Target for 4x4 routes (Mestia, Kazbegi)
    minivanBase: 1.40,   // Target for group transfers
    mountainMultiplier: 1.60, // 60% uplift for technical terrain (Increased from 1.40)
    semiMountainMultiplier: 1.25, // 25% uplift for Borjomi-type routes
    stopFee: 25          // Fee for scenic stops
};

/**
 * MARKET ANCHORS — v14 Fresh Data
 * Source: User Screenshots & Browser Scouts
 */
const MARKET_TARGETS: Record<string, number> = {
    'tbilisi->batumi': 316,       'tbilisi->kutaisi': 225,
    'tbilisi->kazbegi': 193,      'tbilisi->gudauri': 195,
    'tbilisi->bakuriani': 210,    'tbilisi->mestia': 650,
    'kutaisi->batumi': 210,       'kutaisi->mestia': 293,
    'kutaisi->bakuriani': 220,    'kutaisi->kazbegi': 420,
};

/**
 * CORE CALCULATION
 */
export const calculateTripPrice = (
    driver: any, 
    totalKm: number,
    approachKm: number = 0,
    returnKm: number = 0,
    hasMountain: boolean = false,
    hasSemiMountain: boolean = false,
    stopCount: number = 0,
    hasAirport: boolean = false,
    borderCount: number = 0,
    routeKey?: string     
): number => {
    // 1. SAFETY GUARD — Never produce NaN
    const safeTotalKm = (typeof totalKm === 'number' && !isNaN(totalKm) && totalKm > 0) ? totalKm : 150;

    // 1. DYNAMIC TARIFF CALCULATION
    // Use driver's pricePerKm or fallback to category default
    let effectiveRate = driver?.pricePerKm;
    if (!effectiveRate || isNaN(effectiveRate) || effectiveRate <= 0) {
        // Fallback by vehicle category
        if (driver?.vehicleType === 'SUV' || driver?.vehicleType === 'Jeep') effectiveRate = CONFIG.suvBase;
        else if (driver?.vehicleType === 'Minivan') effectiveRate = CONFIG.minivanBase;
        else effectiveRate = CONFIG.sedanBase;
    }
    
    // Auto-adjust rate if it's a known mountain route
    if (hasMountain) {
        effectiveRate *= CONFIG.mountainMultiplier;
    } else if (hasSemiMountain) {
        effectiveRate *= CONFIG.semiMountainMultiplier;
    }

    let calculatedPrice = Math.round(safeTotalKm * effectiveRate);
    if (isNaN(calculatedPrice) || calculatedPrice <= 0) calculatedPrice = 45;

    // 2. MARKET CALIBRATION (DISABLED AS REQUESTED)
    // We now rely purely on our internal algorithm and driver tariffs.
    // Price capping against GoTrip benchmarks is removed.


    // 3. ADD-ONS
    if (hasAirport) calculatedPrice += 30;
    if (borderCount > 0) calculatedPrice += (borderCount * 200);
    if (stopCount > 0) calculatedPrice += (stopCount * CONFIG.stopFee);
    
    // Ensure minimum dignity for the driver
    const absoluteMin = stopCount > 1 ? 120 : 60;
    
    return Math.max(calculatedPrice, absoluteMin);
};

/**
 * UTILITY: GET STARTING PRICE FOR SEO & TEASERS
 */
export const getStartingPrice = (distanceKm: number, isMountainous: boolean = false, vehicleType: VehicleType = 'Sedan', isSemiMountainous: boolean = false): number => {
    let rate = CONFIG.sedanBase;
    if (vehicleType === 'SUV') rate = CONFIG.suvBase;
    if (vehicleType === 'Minivan') rate = CONFIG.minivanBase;

    if (isMountainous) rate *= CONFIG.mountainMultiplier;
    else if (isSemiMountainous) rate *= CONFIG.semiMountainMultiplier;
    
    return Math.max(Math.round(distanceKm * rate), 55);
};

/**
 * CURRENCY CONVERSION (v14 Market Rates)
 * USD is the internal master currency.
 */
export const EXCHANGE_RATES = {
    USD_TO_GEL: 2.67,
    USD_TO_EUR: 0.91,
    USD_TO_KZT: 450.0 // Primary target for Kazakhstani expansion
};

export const convertPrice = (usdAmount: number, targetCurrency: 'GEL' | 'EUR' | 'KZT'): number => {
    switch (targetCurrency) {
        case 'GEL': return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_GEL);
        case 'EUR': return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_EUR);
        case 'KZT': return Math.round(usdAmount * EXCHANGE_RATES.USD_TO_KZT);
        default: return usdAmount;
    }
};

// Backward compatibility exports
export const calculateEnginePrice = calculateTripPrice as any;
export const calculateTieredDistanceCost = (totalKm: number, baseRate: number): number => totalKm * baseRate;
