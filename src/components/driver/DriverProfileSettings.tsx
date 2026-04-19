import React, { useEffect, useState } from 'react';
import { Driver } from '../../types';
import { calculateTripPrice } from '../../services/pricingEngine';

interface DriverProfileSettingsProps {
    currentProfile: Driver;
    editProfile: Partial<Driver>;
    setEditProfile: React.Dispatch<React.SetStateAction<Partial<Driver>>>;
    handleProfileUpdate: (e: React.FormEvent) => void;
    isSavingProfile: boolean;
}

const DriverProfileSettings: React.FC<DriverProfileSettingsProps> = ({
    currentProfile,
    editProfile,
    setEditProfile,
    handleProfileUpdate,
    isSavingProfile
}) => {
    // Simulator state moved here as it is local to this view
    const [simDistance, setSimDistance] = useState(100);
    const [simCalculatedPrice, setSimCalculatedPrice] = useState(0);

    // Update Simulator whenever inputs change
    useEffect(() => {
        // Simulation: Full Logistics Loop (Distance x2)
        // Using the centralized engine for 100% accuracy
        const price = calculateTripPrice(
            editProfile as Driver,
            simDistance, // inner
            simDistance, // approach
            0,           // return logic simplified for simulator
            false        // mountain
        );
        setSimCalculatedPrice(price);
    }, [simDistance, editProfile.expensePer100km, editProfile.dailySalary]);

    return (
        <div className="animate-fadeIn max-w-4xl mx-auto space-y-8">
            
            {/* 1. INFO BOX: HOW PRICING WORKS — PREMIUM REFINED */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[32px] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[var(--primary)]/10 transition-colors duration-500"></div>
                <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight italic uppercase italic">How is the price calculated?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 font-bold uppercase tracking-wide opacity-80">
                    The system automatically calculates the trip cost based on the logistic cycle principle:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Distance", desc: `To Client + Route + Return (${currentProfile.city})`, icon: "📍" },
                        { label: "Expense", desc: "Car fuel and wear per km", icon: "⛽" },
                        { label: "Profit", desc: "Your fixed daily salary", icon: "💎" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="text-xl mb-3">{item.icon}</div>
                            <p className="text-xs font-black text-slate-900 mb-1 uppercase tracking-tighter">{item.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-widest opacity-60">{item.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-xs font-black text-[var(--primary)] underline uppercase tracking-widest italic">Formula: (Total KM × Expense/KM) + Daily Salary</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] opacity-40">Commission: 0% (Clean Price)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 2. PRICING SETTINGS FORM — REFINED SLATE */}
                <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter uppercase italic leading-none">
                        Pricing Parameters
                    </h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Vehicle Expense (Per 100km in GEL)</label>
                            <div className="relative">
                               <input 
                                   type="number" 
                                   step="1" 
                                   min="10" 
                                   max="100"
                                   className="w-full border-2 border-slate-50 p-5 rounded-2xl bg-slate-50 font-black text-xl text-slate-900 focus:bg-white focus:border-[var(--primary)] focus:ring-0 outline-none transition-all duration-300" 
                                   value={editProfile.expensePer100km || 30} 
                                   onChange={e => setEditProfile({...editProfile, expensePer100km: parseFloat(e.target.value)})}
                               />
                               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">GEL</div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">Enter total fuel and wear expense per 100km</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Your Daily Salary (in GEL)</label>
                            <div className="relative">
                               <input 
                                   type="number" 
                                   min="10" 
                                   max="500"
                                   className="w-full border-2 border-slate-50 p-5 rounded-2xl bg-slate-50 font-black text-xl text-slate-900 focus:bg-white focus:border-[var(--primary)] focus:ring-0 outline-none transition-all duration-300" 
                                   value={editProfile.dailySalary || 50} 
                                   onChange={e => setEditProfile({...editProfile, dailySalary: parseFloat(e.target.value)})}
                               />
                               <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black">GEL</div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">The net profit you want to keep per day.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSavingProfile}
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-black py-5 rounded-2xl shadow-2xl shadow-[var(--primary)]/20 transition-all transform active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                        >
                            {isSavingProfile ? "Saving..." : "Save Settings"}
                        </button>
                    </form>
                </div>

                {/* 3. SIMULATOR — PREMIUM ANALYTICS STYLE */}
                <div className="bg-slate-950 text-white rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl -mr-20 -mt-20 opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight italic uppercase">Calculator</h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">Live Simulation</div>
                    </div>
                    
                    <div className="space-y-10 relative z-10">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Test Distance (One Way)</label>
                            <input 
                                type="range" 
                                min="10" 
                                max="500" 
                                step="10"
                                value={simDistance}
                                onChange={(e) => setSimDistance(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            />
                            <div className="flex justify-between mt-4 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                <span>{simDistance} KM</span>
                                <span>FULL CYCLE: {simDistance * 2} KM</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Estimated Online Price</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-white tracking-tighter uppercase italic">{simCalculatedPrice} GEL</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Your Profit:</span>
                                <span className="text-[var(--primary)] font-black text-base uppercase italic">{editProfile.dailySalary || 50} GEL</span>
                            </div>
                        </div>
                        
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-loose italic opacity-60">
                            * Price includes return logistics. Final price depends on client location.
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. READ ONLY DETAILS */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 opacity-75">
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Locked Details (Contact Admin to Change)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Name</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.name || ''} /></div>
                    <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Car Model</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.carModel || ''} /></div>
                    <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">City</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.city || ''} /></div>
                    <div><label className="block text-xs font-bold text-gray-300 uppercase mb-1">Phone</label><input type="text" disabled className="w-full border p-3 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" value={currentProfile.phoneNumber || ''} /></div>
                </div>
            </div>

        </div>
    );
};

export default DriverProfileSettings;