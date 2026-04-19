import { Language } from '../types';

export enum Currency {
    GEL = 'GEL',
    USD = 'USD',
    EUR = 'EUR',
    KZT = 'KZT'
}

export const CURRENCY_RATES = {
    [Currency.GEL]: 1,
    [Currency.USD]: 1 / 2.7,
    [Currency.EUR]: 1 / 2.95,
    [Currency.KZT]: 170 / 1, // 1 GEL ≈ 170 KZT
};

export const CURRENCY_SYMBOLS = {
    [Currency.GEL]: 'GEL',
    [Currency.USD]: '$',
    [Currency.EUR]: '€',
    [Currency.KZT]: '₸',
};

export function formatPrice(gelPrice: number, currency: Currency): string {
    const converted = gelPrice * CURRENCY_RATES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];
    
    if (currency === Currency.KZT) {
        return `${Math.round(converted).toLocaleString()} ${symbol}`;
    }
    
    return `${symbol} ${Math.round(converted)}`;
}

export function getAllCurrencies(gelPrice: number) {
    return {
        gel: gelPrice,
        usd: Math.round(gelPrice * CURRENCY_RATES[Currency.USD]),
        eur: Math.round(gelPrice * CURRENCY_RATES[Currency.EUR]),
        kzt: Math.round(gelPrice * CURRENCY_RATES[Currency.KZT])
    };
}
