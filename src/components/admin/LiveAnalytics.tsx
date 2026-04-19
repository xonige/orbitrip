// src/components/admin/LiveAnalytics.tsx
// v1.0 — Real-time Analytics Dashboard powered by Yandex Metrica API
import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity, Globe, Monitor, Smartphone, Tablet, 
    TrendingUp, Eye, Users, Clock, BarChart3,
    RefreshCw, Wifi, WifiOff, MapPin, ArrowUp,
    MousePointer, ChevronRight, Zap, Signal
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://orbitrip.ge';
const REFRESH_INTERVAL = 60_000; // 60 seconds

interface LiveAnalyticsProps {}

const LiveAnalytics: React.FC<LiveAnalyticsProps> = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setIsRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/api/analytics/live`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData(json);
            setLastUpdate(new Date());
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(() => fetchAnalytics(true), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchAnalytics]);

    const deviceIcon = (device: string) => {
        if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('smartphone')) return <Smartphone size={14} />;
        if (device.toLowerCase().includes('tablet')) return <Tablet size={14} />;
        return <Monitor size={14} />;
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--primary)] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Connecting to Analytics...</p>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                <WifiOff className="mx-auto text-red-400 mb-4" size={32} />
                <p className="text-sm font-bold text-red-600 mb-2">Failed to connect to Analytics API</p>
                <p className="text-xs text-red-400 mb-4">{error}</p>
                <button onClick={() => fetchAnalytics()} className="bg-red-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors">Retry</button>
            </div>
        );
    }

    const y = data?.yandex;
    const today = y?.today || { visits: 0, users: 0, pageviews: 0, bounceRate: 0 };
    const daily = y?.daily || [];
    const sources = y?.sources || [];
    const geography = y?.geography || [];
    const devices = y?.devices || [];
    const topPages = y?.topPages || [];

    // Calculate totals from 7 day period
    const totalVisits7d = daily.reduce((s: number, d: any) => s + d.visits, 0);
    const totalUsers7d = daily.reduce((s: number, d: any) => s + d.users, 0);
    const totalPageviews7d = daily.reduce((s: number, d: any) => s + d.pageviews, 0);
    const avgBounce7d = daily.length > 0 ? Math.round(daily.reduce((s: number, d: any) => s + d.bounceRate, 0) / daily.length) : 0;
    const avgDuration7d = daily.length > 0 ? Math.round(daily.reduce((s: number, d: any) => s + d.avgDuration, 0) / daily.length) : 0;
    const maxVisits = Math.max(...daily.map((d: any) => d.visits), 1);
    const totalDeviceVisits = devices.reduce((s: number, d: any) => s + d.visits, 0);

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Live <span className="text-[var(--primary)] not-italic">Analytics</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1"><Wifi size={10} className="text-emerald-500" /> Yandex Metrica</span>
                        <span className="text-slate-300">|</span>
                        Powered by live API data
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdate && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Updated: {lastUpdate.toLocaleTimeString()}
                            {data?.cached && <span className="text-amber-500 ml-1">(cached)</span>}
                        </span>
                    )}
                    <button 
                        onClick={() => fetchAnalytics(true)} 
                        disabled={isRefreshing}
                        className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* TODAY'S LIVE METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-6 rounded-[28px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-3 right-3"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div></div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Today Visits</p>
                    <h3 className="text-4xl font-black text-white italic tracking-tighter">{today.visits}</h3>
                    <p className="text-[9px] text-slate-600 font-bold mt-3 uppercase tracking-widest">{today.pageviews} pageviews</p>
                </div>
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Today Users</p>
                    <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{today.users}</h3>
                    <p className="text-[9px] text-emerald-600 font-bold mt-3 uppercase tracking-widest flex items-center gap-1"><Activity size={10} /> Active</p>
                </div>
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><MousePointer size={80} /></div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Bounce Rate</p>
                    <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{today.bounceRate}<span className="text-lg">%</span></h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest">{today.bounceRate <= 50 ? '✓ Healthy' : '⚠ High'}</p>
                </div>
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Eye size={80} /></div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">7-Day Total</p>
                    <h3 className="text-4xl font-black text-[var(--primary)] italic tracking-tighter">{totalVisits7d}</h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-3 uppercase tracking-widest">{totalUsers7d} unique users</p>
                </div>
            </div>

            {/* TRAFFIC CHART + SOURCES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Traffic Bar Chart */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 lg:col-span-2">
                    <h4 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <BarChart3 size={16} className="text-[var(--primary)]" /> Daily Traffic (7 Days)
                    </h4>
                    <div className="flex items-end justify-between h-48 gap-2 px-2">
                        {daily.map((d: any, i: number) => {
                            const heightPerc = maxVisits > 0 ? (d.visits / maxVisits) * 100 : 0;
                            return (
                                <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                                    <div className="relative w-full flex justify-center">
                                        <div 
                                            className="w-full max-w-[32px] bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/60 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[var(--primary)]/20"
                                            style={{ height: `${Math.max(heightPerc, 4)}%` }}
                                        ></div>
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-xl whitespace-nowrap transition-opacity z-10 pointer-events-none shadow-xl font-bold">
                                            {d.visits} visits · {d.users} users
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                                        {d.date?.split('-').slice(1).join('/')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Duration: <span className="text-slate-900">{formatDuration(avgDuration7d)}</span></span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Bounce: <span className={avgBounce7d <= 50 ? 'text-emerald-600' : 'text-amber-600'}>{avgBounce7d}%</span></span>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-5 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Signal size={16} className="text-[var(--primary)]" /> Sources
                    </h4>
                    <div className="space-y-3">
                        {sources.length > 0 ? sources.map((s: any, i: number) => {
                            const pct = totalVisits7d > 0 ? Math.round((s.visits / totalVisits7d) * 100) : 0;
                            const colors = ['bg-[var(--primary)]', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];
                            return (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{s.source}</span>
                                        <span className="text-[10px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg">{s.visits}</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                        <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700 group-hover:opacity-80`} style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-xs text-slate-400 text-center italic py-4">No traffic source data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* GEO + DEVICES + TOP PAGES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Geography */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-5 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Globe size={16} className="text-[var(--primary)]" /> Geography
                    </h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                        {geography.length > 0 ? geography.map((g: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-[var(--primary)] flex-shrink-0" />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block leading-tight">{g.city}</span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{g.country}</span>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">{g.visits}</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-400 text-center italic py-4">No geo data</p>
                        )}
                    </div>
                </div>

                {/* Devices */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-5 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Monitor size={16} className="text-[var(--primary)]" /> Devices
                    </h4>
                    <div className="space-y-4">
                        {devices.length > 0 ? devices.map((d: any, i: number) => {
                            const pct = totalDeviceVisits > 0 ? Math.round((d.visits / totalDeviceVisits) * 100) : 0;
                            return (
                                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            {deviceIcon(d.device)}
                                            <span className="text-xs font-bold text-slate-800 capitalize">{d.device}</span>
                                        </div>
                                        <span className="text-lg font-black text-slate-900 italic">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/50 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{d.visits} sessions</p>
                                </div>
                            );
                        }) : (
                            <p className="text-xs text-slate-400 text-center italic py-4">No device data</p>
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100">
                    <h4 className="text-sm font-black text-slate-900 mb-5 uppercase tracking-[0.2em] italic flex items-center gap-2">
                        <Eye size={16} className="text-[var(--primary)]" /> Top Pages
                    </h4>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                        {topPages.length > 0 ? topPages.map((pg: any, i: number) => {
                            // Clean URL for display
                            let displayUrl = pg.url;
                            try { displayUrl = new URL(pg.url).pathname || '/'; } catch(e) {}
                            if (displayUrl.length > 35) displayUrl = displayUrl.substring(0, 35) + '...';
                            
                            return (
                                <div key={i} className="flex items-center justify-between py-2 px-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-[9px] font-black text-slate-300 w-5">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="text-xs font-bold text-slate-700 truncate" title={pg.url}>{displayUrl}</span>
                                    </div>
                                    <span className="text-xs font-black text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-0.5 rounded-lg flex-shrink-0">{pg.views}</span>
                                </div>
                            );
                        }) : (
                            <p className="text-xs text-slate-400 text-center italic py-4">No page data</p>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER STATUS BAR */}
            <div className="bg-slate-950 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Auto-refresh every 60s</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Yandex Counter: <span className="text-[var(--primary)]">108558502</span>
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Google Ads: <span className="text-[var(--primary)]">AW-17909352078</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LiveAnalytics;
