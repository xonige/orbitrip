import React from 'react';
import { Driver, Language } from '../types';
import DriverCard from './DriverCard';

interface DriversTeaserProps {
    drivers: Driver[];
    language: Language;
}

const DriversTeaser: React.FC<DriversTeaserProps> = ({ drivers, language }) => {
    const isEn = language === Language.EN;
    
    // Use first 6 drivers for the background effect
    const teaserDrivers = drivers.slice(0, 6);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden px-4 md:px-0 bg-slate-950">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 opacity-80 blur-[1px] pointer-events-none transform scale-[1.02] origin-top mt-20 md:mt-32">
                {teaserDrivers.map((d, i) => (
                    <div key={d.id}>
                        <DriverCard 
                            driver={d} 
                            price={100 + i * 15} 
                            usdPrice={Math.ceil((100+i*15)/2.67)} 
                            eurPrice={Math.ceil((100+i*15)/2.95)} 
                            kztPrice={Math.round((100+i*15) * (450/2.67))}
                            approachTime="~20 min" 
                            isEn={isEn} 
                            language={language}
                            onProfileClick={() => {}} 
                            onBookClick={() => {}} 
                        />
                    </div>
                ))}
            </div>
            
            {/* Elegant dark overlay to maintain contrast with the form */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
        </div>
    );
};

export default DriversTeaser;
