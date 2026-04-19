import React, { useState, useRef, useEffect } from 'react';
import { Currency } from '../types';

interface CurrencySwitcherProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const currencies = [
  { code: Currency.GEL, symbol: '₾', label: 'GEL' },
  { code: Currency.USD, symbol: '$', label: 'USD' },
  { code: Currency.EUR, symbol: '€', label: 'EUR' },
];

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ currentCurrency, onCurrencyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = currencies.find(c => c.code === currentCurrency) || currencies[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 group"
      >
        <span className="text-sm font-bold text-white">{selected.symbol}</span>
        <span className="text-xs font-medium text-white/80 group-hover:text-white uppercase">{selected.label}</span>
        <svg
          className="w-3 h-3 text-white/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <>
        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-32 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-[100]"
          >
            <div className="py-1">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    onCurrencyChange(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    currentCurrency === c.code
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-bold">{c.symbol}</span>
                  <span className="font-medium">{c.label}</span>
                  {currentCurrency === c.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default CurrencySwitcher;
