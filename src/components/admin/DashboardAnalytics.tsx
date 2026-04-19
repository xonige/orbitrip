import React, { useEffect, useState } from 'react';
import { SystemSettings } from '../../types';
import { db } from '../../services/db';
import { 
    Target, 
    TrendingUp, 
    DollarSign, 
    Users, 
    ArrowRight, 
    Activity, 
    Award, 
    Coins, 
    BarChart3, 
    CheckCircle2, 
    Clock, 
    XCircle,
    Calendar,
    Flame,
    Trophy,
    Zap,
    ChevronRight,
    Search,
    UserPlus
} from 'lucide-react';

interface DashboardAnalyticsProps {
    analytics: any;
    settings: SystemSettings;
    timeRange: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
    setTimeRange: (range: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL') => void;
    setActiveTab: (tab: string) => void;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'GEL', maximumFractionDigits: 0 }).format(amount);

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ analytics, settings, timeRange, setTimeRange, setActiveTab }) => {
    const [stats, setStats] = useState({ searches: 0, selections: 0 });

    useEffect(() => {
        const loadStats = async () => {
            const data = await db.analytics.getStats(timeRange);
            setStats(data);
        };
        loadStats();
    }, [timeRange]); // Reload when time range changes

    // Calculate Funnel Metrics
    const searchCount = stats.searches;
    const selectCount = stats.selections;
    const bookCount = analytics.confirmedCount + analytics.pendingCount; // Total attempted bookings

    // Conversion Rates
    const searchToSelectRate = searchCount > 0 ? Math.round((selectCount / searchCount) * 100) : 0;
    const selectToBookRate = selectCount > 0 ? Math.round((bookCount / selectCount) * 100) : 0;
    const totalConversionRate = searchCount > 0 ? Math.round((bookCount / searchCount) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Time Filter & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Platform <span className="text-[var(--primary)] not-italic">Intelligence</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time performance & health metrics</p>
                </div>
                <div className="bg-slate-900 p-1.5 rounded-2xl shadow-xl flex text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-800">
                    {['TODAY', 'WEEK', 'MONTH', 'ALL'].map(range => (
                        <button 
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${timeRange === range ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20' : 'hover:text-white'}`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONVERSION FUNNEL (GOOGLE ADS SYNC) */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Target size={120} />
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-8 flex items-center uppercase tracking-[0.3em] italic">
                    <Target className="mr-3 text-[var(--primary)]" size={18} /> Conversion Funnel
                </h3>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 relative">
                    
                    {/* Step 1: Searches */}
                    <div className="flex-1 w-full text-center relative z-10">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-inner group/step">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                <Search size={14} className="group-hover/step:text-[var(--primary)] transition-colors" />
                                Searches
                            </div>
                            <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{searchCount}</p>
                        </div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="flex flex-col items-center justify-center mx-4 relative z-0">
                        <div className="h-0.5 w-16 bg-gray-200 hidden md:block"></div>
                        <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full md:-mt-2.5 z-10 border border-gray-200">
                            {searchToSelectRate}%
                        </div>
                        <div className="h-8 w-0.5 bg-gray-200 md:hidden"></div>
                    </div>

                    {/* Step 2: Driver Selected (Begin Checkout) */}
                    <div className="flex-1 w-full text-center relative z-10">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-inner group/step">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                <Zap size={14} className="group-hover/step:text-[var(--primary)] transition-colors" />
                                Selection
                            </div>
                            <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{selectCount}</p>
                        </div>
                    </div>

                    {/* Arrow 2 */}
                    <div className="flex flex-col items-center justify-center mx-4 relative z-0">
                        <div className="h-0.5 w-16 bg-gray-200 hidden md:block"></div>
                        <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full md:-mt-2.5 z-10 border border-gray-200">
                            {selectToBookRate}%
                        </div>
                        <div className="h-8 w-0.5 bg-gray-200 md:hidden"></div>
                    </div>

                    {/* Step 3: Booked (Conversion) */}
                    <div className="flex-1 w-full text-center relative z-10">
                        <div className="bg-slate-950 border border-[var(--primary)]/20 rounded-3xl p-6 shadow-2xl group/step">
                            <div className="text-[10px] text-[var(--primary)] font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} />
                                Conversion
                            </div>
                            <p className="text-4xl font-black text-white italic tracking-tighter">{bookCount}</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Net Efficiency Score: <span className="text-[var(--primary)] italic">{totalConversionRate}%</span>
                </div>
            </div>

            {/* 1. FINANCIAL METRICS (HERO CARDS) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Gross Volume</p>
                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter leading-none">{formatCurrency(analytics.totalGross)}</h3>
                    <div className="mt-6 flex text-[9px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-xl border border-[var(--primary)]/10 w-fit">
                        Avg. {formatCurrency(analytics.aov)} Trip
                    </div>
                </div>
                
                <div className="bg-slate-950 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:rotate-12 transition-transform duration-500">
                        <Coins size={100} />
                    </div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Net Earnings ({Math.round(settings.commissionRate * 100)}%)</p>
                    <h3 className="text-4xl font-black text-[var(--primary)] italic tracking-tighter leading-none">{formatCurrency(analytics.totalCommission)}</h3>
                    <div className="mt-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest italic">Platform Profit</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative group overflow-hidden">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Health Score</p>
                    <div className="flex items-baseline gap-2 mb-6">
                        <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">{analytics.confirmedCount}</h3>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/ {analytics.totalBookings} Total</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${analytics.totalBookings ? (analytics.confirmedCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                        <div className="h-full bg-amber-400" style={{ width: `${analytics.totalBookings ? (analytics.pendingCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                        <div className="h-full bg-rose-500" style={{ width: `${analytics.totalBookings ? (analytics.cancelledCount / analytics.totalBookings) * 100 : 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 group relative overflow-hidden">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Fleet Capacity</p>
                    <div className="flex items-baseline gap-2 mb-6">
                        <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter">{analytics.activeDrivers}</h3>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Units</span>
                    </div>
                    {analytics.pendingDrivers > 0 && (
                        <div className="bg-rose-50/50 text-rose-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl flex items-center gap-3 border border-rose-100/50">
                            <Clock size={14} className="animate-pulse" /> {analytics.pendingDrivers} Verification
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. REVENUE TREND (Visual Representation) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h4 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wide flex items-center">
                        <span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded flex items-center justify-center mr-2">📊</span>
                        Revenue Trend (Recent)
                    </h4>
                    
                    {analytics.trendData.length > 0 ? (
                        <div className="flex items-end justify-between h-48 gap-2">
                            {analytics.trendData.map((d: any, i: number) => {
                                const maxVal = Math.max(...analytics.trendData.map((t: any) => t.amount));
                                const heightPerc = maxVal > 0 ? (d.amount / maxVal) * 100 : 0;
                                return (
                                    <div key={i} className="flex flex-col items-center flex-1 group">
                                        <div className="relative w-full flex justify-center">
                                            <div 
                                                className="w-full max-w-[20px] bg-indigo-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:bg-indigo-600"
                                                style={{ height: `${heightPerc}%`, minHeight: '4px' }}
                                            ></div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 pointer-events-none">
                                                {d.amount} GEL
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-2 font-mono rotate-0 sm:rotate-0 truncate w-full text-center">{d.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm italic bg-gray-50 rounded-xl border border-dashed">No revenue data for this period</div>
                    )}
                </div>

                {/* 3. POPULAR ROUTES LIST */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                        <span className="bg-orange-100 text-orange-600 w-6 h-6 rounded flex items-center justify-center mr-2">🔥</span>
                        Top Routes
                    </h4>
                    <div className="space-y-3">
                        {analytics.topRoutes.length > 0 ? analytics.topRoutes.map((r: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-gray-400 font-mono text-xs">0{i+1}</span>
                                    <span className="truncate text-gray-700 font-medium">{r.name}</span>
                                </div>
                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold text-xs">{r.count}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center py-4">No data yet.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 4. TOP DRIVERS LEADERBOARD */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide flex items-center">
                        <span className="bg-yellow-100 text-yellow-600 w-6 h-6 rounded flex items-center justify-center mr-2">🏆</span>
                        Driver Leaderboard
                    </h4>
                    <div className="space-y-4">
                        {analytics.topDrivers.length > 0 ? analytics.topDrivers.map((d: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-indigo-100 text-indigo-600'}`}>{i + 1}</div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{d.name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{d.trips} Trips Completed</p>
                                    </div>
                                </div>
                                <span className="font-black text-blue-600 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm text-sm">{formatCurrency(d.revenue)}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-sm text-center py-4">No performance data available.</p>
                        )}
                    </div>
                </div>

                {/* 5. RECENT ACTIVITY FEED */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center">
                            <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center mr-2">⚡</span>
                            Live Feed
                        </h4>
                        <button onClick={() => setActiveTab('BOOKINGS')} className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                     <p className="text-gray-400 text-sm text-center py-4 italic">Check "Bookings" tab for live activity.</p>
                </div>

            </div>
        </div>
    );
};

export default DashboardAnalytics;