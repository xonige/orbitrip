import React, { useState } from 'react';
import { Language, LocationOption } from '../types';
import { X, Search, MapPin, Navigation, Flag, ArrowLeft, MoreHorizontal, Heart } from 'lucide-react';
import { mapService } from '../services/mapService';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (loc: LocationOption) => void;
  locations: LocationOption[];
  language: Language;
  title: string;
  previousLocationName?: string;
}

const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  locations, 
  language, 
  title,
  previousLocationName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isEn = language === Language.EN;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Increased timeout slightly for reliable mobile focus
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const filteredLocations = locations.filter(loc => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return loc.nameEn.toLowerCase().includes(q) || 
           loc.nameRu.toLowerCase().includes(q) ||
           (loc.nameKz && loc.nameKz.toLowerCase().includes(q));
  }).sort((a, b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return 0;
    const aExact = a.nameEn.toLowerCase() === q || a.nameRu.toLowerCase() === q || (a.nameKz && a.nameKz.toLowerCase() === q);
    const bExact = b.nameEn.toLowerCase() === q || b.nameRu.toLowerCase() === q || (b.nameKz && b.nameKz.toLowerCase() === q);
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex flex-col h-full bg-white">
            {/* Header in Warm Amber */}
            <div className="bg-amber-500 text-white px-2 py-4 flex items-center shadow-lg safe-top shrink-0 z-50">
              <button onClick={onClose} className="p-3 hover:bg-black/10 rounded-full transition-colors hidden md:block">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 flex items-center justify-center gap-2 pl-4 md:pl-0 md:pr-12">
                <Heart className="w-5 h-5 fill-white/20" />
                <h2 className="text-xl font-bold tracking-tight uppercase italic">{title}</h2>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-black/10 rounded-full transition-colors md:hidden">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Box */}
            <div className="px-4 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  placeholder={isEn ? "Where would you like to go?" : "Куда отправимся?"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white h-14 px-6 pr-14 rounded-2xl border-2 border-transparent focus:border-amber-500 outline-none text-slate-900 font-bold transition-all shadow-sm text-base"
                />
                {searchQuery && (
                    <button 
                      onClick={() => {
                          setSearchQuery('');
                          inputRef.current?.focus();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
              </div>
              <button 
                onClick={onClose}
                className="px-4 h-14 rounded-2xl bg-white border border-amber-200 text-amber-600 font-black uppercase text-[10px] tracking-widest hover:bg-amber-50 transition-all md:hidden"
              >
                {isEn ? "Cancel" : "Отмена"}
              </button>
            </div>

            {/* Location List */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {(searchQuery ? filteredLocations : locations).length > 0 ? (
                <div className="py-2 pb-32">
                  {(searchQuery ? filteredLocations : locations).map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelect(loc)}
                      className="w-full px-8 py-5 flex items-center gap-5 hover:bg-amber-50 active:bg-amber-100 transition-colors border-b border-slate-50 last:border-0 text-left"
                    >
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                        {loc.type === 'AIRPORT' ? <Navigation className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-800">
                          {language === Language.EN ? loc.nameEn : language === Language.RU ? loc.nameRu : (loc.nameKz || loc.nameRu || loc.nameEn)}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                          {loc.type === 'AIRPORT' ? (isEn ? 'Airport Gateway' : 'Аэропорт') : 
                           loc.type === 'CITY' ? (isEn ? 'Beautiful City' : 'Город') : 
                           (isEn ? 'Scenic Location' : 'Место')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-center gap-4">
                  <Search className="w-12 h-12 opacity-10" />
                  <p className="text-sm font-bold">{isEn ? 'No results found' : 'Ничего не найдено'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationSelectorModal;
