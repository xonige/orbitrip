
import React, { useState, useEffect, useMemo } from 'react';
import { Booking, Tour, Driver, SystemSettings, SmsLog, PromoCode } from '../types';
import { db } from '../services/db';
import DashboardAnalytics from './admin/DashboardAnalytics';
import BookingsTable from './admin/BookingsTable';
import DriversList from './admin/DriversList';
import ToursManagement from './admin/ToursManagement';
import SystemSettingsView from './admin/SystemSettings';
import LiveAnalytics from './admin/LiveAnalytics';
import { 
    LayoutDashboard, 
    Calendar, 
    Car, 
    ShieldCheck, 
    Map, 
    Ticket, 
    MessageSquare, 
    Settings,
    LogOut,
    Menu,
    X,
    Activity
} from 'lucide-react';

interface AdminDashboardProps {
  bookings: Booking[];
  tours: Tour[];
  drivers: Driver[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: any) => void;
  onUpdateBooking: (booking: Booking) => Promise<Booking>;
  onAddDriver: (driver: Driver) => Promise<Driver | void>;
  onUpdateDriver: (driver: Driver) => Promise<Driver | void>;
  onDeleteDriver: (id: string) => void;
  onLogout: () => void;
}

const TABS = [
    { id: 'DASHBOARD', label: 'Analytics', icon: <LayoutDashboard size={18} /> },
    { id: 'TRAFFIC', label: 'Live Traffic', icon: <Activity size={18} /> },
    { id: 'BOOKINGS', label: 'Bookings', icon: <Calendar size={18} /> },
    { id: 'DRIVERS', label: 'Drivers', icon: <Car size={18} /> },
    { id: 'PENDING', label: 'Verification', icon: <ShieldCheck size={18} /> },
    { id: 'TOURS', label: 'Tours', icon: <Map size={18} /> },
    { id: 'PROMOS', label: 'Promo Codes', icon: <Ticket size={18} /> },
    { id: 'SMS', label: 'SMS Logs', icon: <MessageSquare size={18} /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings size={18} /> },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    bookings, tours, drivers, 
    onAddTour, onUpdateTour, onDeleteTour, 
    onUpdateBookingStatus, onUpdateBooking,
    onAddDriver, onUpdateDriver, onDeleteDriver,
    onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({ 
      id: 'default', smsApiKey: '', adminPhoneNumber: '', commissionRate: 0.13, 
      smsEnabled: true, emailServiceId: '', emailTemplateId: '', emailPublicKey: '', 
      backgroundImageUrl: '', minTripPrice: 30, socialFacebook: '', socialInstagram: '',
      siteTitle: '', siteDescription: '', maintenanceMode: false, driverGuidelines: '',
      aiSystemPrompt: '', globalAlertMessage: '', bookingWindowDays: 60, instantBookingEnabled: false,
      taxRate: 0, currencySymbol: 'GEL', autoApproveDrivers: false, requireDocuments: true, aiModelTemperature: 0.7
  });

  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]); 
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [clarityStats, setClarityStats] = useState<any>(null);
  
  
  // PROMO EDIT STATE (Kept minimal in parent or move to own component if strict)
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState(15);
  const [newPromoLimit, setNewPromoLimit] = useState(1000);
  
  // ANALYTICS TIME RANGE STATE
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');

  // Helper to load data
  const refreshData = async () => {
      try {
          if (activeTab === 'TRAFFIC') {
              const logs = await db.analytics.getAllEvents();
              setActivityLogs(logs);
              
              // Only fetch Clarity once per mount or manually, but logic here is simple
              db.analytics.getClarityStats().then(data => {
                  if (data && data.metrics) setClarityStats(data);
              });
          }
          if (activeTab === 'SMS') {
              const logs = await db.smsLogs.getAll();
              setSmsLogs(logs);
          }
          if (activeTab === 'PROMOS') {
              const promos = await db.promoCodes.getAll();
              setPromoCodes(promos);
          }
          if (activeTab === 'SETTINGS' || activeTab === 'DASHBOARD') {
              const s = await db.settings.get();
              setSettings(prev => ({ ...prev, ...s }));
          }
      } catch (error) {
          console.error("Failed to refresh data:", error);
      }
  };

  useEffect(() => {
      refreshData();
  }, [activeTab]);

  // --- ANALYTICS ENGINE ---
  const analytics = useMemo(() => {
      const now = new Date();
      const filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.createdAt);
          if (timeRange === 'ALL') return true;
          if (timeRange === 'TODAY') return bookingDate.getDate() === now.getDate() && bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
          if (timeRange === 'WEEK') return bookingDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (timeRange === 'MONTH') return bookingDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return true;
      });

      const confirmed = filteredBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
      const pending = filteredBookings.filter(b => b.status === 'PENDING');
      const cancelled = filteredBookings.filter(b => b.status === 'CANCELLED');
      
      const totalGross = confirmed.reduce((sum, b) => sum + (Number(b.numericPrice) || 0), 0);
      const commission = settings?.commissionRate !== undefined ? settings.commissionRate : 0.13;
      const totalCommission = Math.round(totalGross * commission);
      const netRevenue = totalGross - totalCommission; 
      const aov = confirmed.length > 0 ? Math.round(totalGross / confirmed.length) : 0;

      const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
      const pendingDrivers = drivers.filter(d => d.status === 'PENDING').length;

      // Simple Trend
      const trendData = confirmed.slice(0, 10).map(b => ({
          date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          amount: b.numericPrice
      })).reverse();
      
      // Top Routes Calculation
      const routePopularity: Record<string, number> = {};
      filteredBookings.forEach(b => { const t = b.tourTitle || 'Custom'; routePopularity[t] = (routePopularity[t] || 0) + 1; });
      const topRoutes = Object.entries(routePopularity).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      // Top Drivers Calculation
      const driverPerformance: Record<string, { name: string, trips: number, revenue: number }> = {};
      confirmed.forEach(b => {
          if (b.driverId && b.driverName) {
              if (!driverPerformance[b.driverId]) driverPerformance[b.driverId] = { name: b.driverName, trips: 0, revenue: 0 };
              driverPerformance[b.driverId].trips += 1;
              driverPerformance[b.driverId].revenue += Number(b.numericPrice) || 0;
          }
      });
      const topDrivers = Object.values(driverPerformance).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      return { 
          totalBookings: filteredBookings.length, confirmedCount: confirmed.length, pendingCount: pending.length, cancelledCount: cancelled.length,
          totalGross, totalCommission, netRevenue, aov, trendData, topRoutes, topDrivers, activeDrivers, pendingDrivers
      };
  }, [bookings, drivers, settings, timeRange]);


  const handleCreatePromo = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newPromoCode) return;
      const promo: PromoCode = {
          id: `promo-${Date.now()}`, code: newPromoCode.toUpperCase().trim(),
          discountPercent: newPromoPercent, usageLimit: newPromoLimit,
          usageCount: 0, status: 'ACTIVE', createdAt: new Date().toISOString()
      };
      await db.promoCodes.create(promo);
      const updated = await db.promoCodes.getAll();
      setPromoCodes(updated);
      setNewPromoCode('');
  };

  const handleDeletePromo = async (id: string) => {
      if(confirm('Delete promo code?')) {
          await db.promoCodes.delete(id);
          const updated = await db.promoCodes.getAll();
          setPromoCodes(updated);
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans overflow-hidden">
        {/* SIDEBAR - High Z-Index to prevent overlap */}
        <aside className={`fixed inset-y-0 left-0 z-[200] bg-slate-950 text-white w-72 transform transition-all duration-500 ease-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
            <div className="p-8 border-b border-slate-900 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tight leading-none text-white uppercase italic">
                        ORBI<span className="text-[var(--primary)] not-italic">TRIP</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] leading-none mt-1.5 text-slate-600">
                        Admin HUB
                    </span>
                </div>
                <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest border border-[var(--primary)]/20">
                    v15.0
                </div>
            </div>
            <nav className="p-6 space-y-2">
                {TABS.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} 
                        className={`w-full flex items-center px-5 py-4 text-xs font-black uppercase tracking-[0.1em] rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 translate-x-2' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}
                    >
                        <span className="mr-4">{tab.icon}</span> 
                        {tab.label}
                        {tab.id === 'PENDING' && analytics.pendingDrivers > 0 && (
                            <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-lg flex items-center justify-center min-w-[20px] h-5 shadow-lg shadow-amber-500/20">
                                {analytics.pendingDrivers}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="p-6 mt-auto border-t border-slate-900">
                <button onClick={onLogout} className="w-full bg-slate-900 text-red-400 font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-3 border border-red-500/10">
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </aside>

        {/* MAIN CONTENT - Restored padding p-4 md:p-8 */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative z-0 p-4 md:p-8">
            
            {/* MOBILE MENU TOGGLE - WRAPPED IN DIV TO PREVENT OVERLAP */}
            <div className="md:hidden flex justify-between items-center mb-8 relative z-20">
                <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight leading-none text-slate-900 uppercase italic">
                        ORBI<span className="text-[var(--primary)] not-italic">TRIP</span>
                    </span>
                </div>
                <button className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl active:scale-90 transition-transform" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
            
            <div className="max-w-7xl mx-auto min-h-screen">
                
                {/* DASHBOARD TAB */}
                {activeTab === 'DASHBOARD' && (
                    <div className="">
                        <DashboardAnalytics 
                            analytics={analytics} 
                            settings={settings}
                            timeRange={timeRange}
                            setTimeRange={setTimeRange}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                )}

                {/* LIVE TRAFFIC TAB — v1.0 Real-time Yandex Metrica + Google Analytics */}
                {activeTab === 'TRAFFIC' && (
                    <div className="space-y-8">
                        {/* NEW: Live Analytics Dashboard from Yandex Metrica API */}
                        <LiveAnalytics />

                        {/* EXISTING: Platform Activity Logs (local IndexedDB events) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase italic leading-none">Platform Activity Log</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Local user actions & Google Ads click tracking</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={async () => {
                                            if (confirm('Delete all logs except Google Ads? / Удалить все логи, кроме рекламы Google?')) {
                                                await db.analytics.clearNonAdEvents();
                                                refreshData();
                                            }
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2"
                                    >
                                        <X size={14} />
                                        Clear Logs (Keep Ads)
                                    </button>
                                    <button onClick={() => refreshData()} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:scale-105 transition-all">
                                        Refresh Feed
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {activityLogs.length === 0 ? (
                                    <p className="text-sm text-slate-500 font-bold italic p-4 text-center uppercase tracking-widest opacity-40">No recent activity detected.</p>
                                ) : (
                                    activityLogs.map(log => {
                                        let details: any = {};
                                        try { if (log.details) details = JSON.parse(log.details) || {}; } catch(e){}
                                        const isAd = details && !!details.gclid;
                                        
                                        return (
                                            <div key={log.id} className={`p-4 rounded-2xl border ${isAd ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-white'} shadow-sm flex flex-col md:flex-row gap-4 items-start transition-all hover:shadow-md`}>
                                                <div className="min-w-[200px]">
                                                    <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-0.5 leading-none bg-slate-100 p-1.5 rounded inline-block">
                                                        {new Date(Number(log.created_at)).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </div>
                                                    <div className="font-black text-xs uppercase tracking-widest text-[var(--primary)] mt-2 flex items-center gap-1.5 leading-none">
                                                        <span className={`w-2 h-2 rounded-full ${isAd ? 'bg-amber-400' : 'bg-indigo-400'}`}></span>
                                                        {log.event_name.replace('_', ' ')}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    {log.event_name === 'search' && details.stops ? (
                                                        <div className="text-sm font-bold text-slate-800">Searched Route: <span className="text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-0.5 rounded-lg">{details.stops.join(' ➝ ')}</span> <span className="text-slate-400 text-xs ml-2">({details.distance}km)</span></div>
                                                    ) : log.event_name === 'driver_selected' ? (
                                                        <div className="text-sm font-bold text-slate-800">Selected for Booking: <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{details.driverName}</span> <span className="text-slate-400 text-xs ml-2">({details.price} GEL)</span></div>
                                                    ) : log.event_name === 'driver_profile_view' ? (
                                                        <div className="text-sm font-bold text-slate-800">Viewed Profile: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{details.driverName}</span> <span className="text-slate-400 text-xs ml-2">({details.price} GEL)</span></div>
                                                    ) : log.event_name === 'page_view' ? (
                                                        <div className="text-sm font-bold text-slate-800">Viewed Page: <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg uppercase tracking-widest text-[10px]">{details.view || details.path}</span></div>
                                                    ) : log.event_name === 'scroll_depth' ? (
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scrolled to {details.depth} of <span className="text-slate-600">{details.view}</span></div>
                                                    ) : log.event_name === 'booking_completed' ? (
                                                        <div className="text-sm font-black text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100 animate-pulse">✓ BOOKING COMPLETED! {details.totalPrice} GEL</div>
                                                    ) : (
                                                        <div className="text-[10px] text-slate-500 font-mono break-all opacity-60">{log.details}</div>
                                                    )}
                                                    
                                                    {isAd && (
                                                        <div className="mt-3 flex gap-2 flex-wrap items-center">
                                                            <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">Google Ads Click</span>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[200px]" title={details.gclid}>GCLID: <span className="text-slate-900 font-mono lower-case tracking-normal">{details.gclid}</span></span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKINGS TAB */}
                {activeTab === 'BOOKINGS' && (
                     <div className="">
                        <BookingsTable 
                            bookings={bookings} 
                            drivers={drivers} 
                            onUpdateBookingStatus={onUpdateBookingStatus} 
                        />
                    </div>
                )}

                {/* DRIVERS & PENDING TABS - DriversList handles its own spacing for sticky header */}
                {(activeTab === 'DRIVERS' || activeTab === 'PENDING') && (
                    <DriversList 
                        drivers={drivers}
                        activeTab={activeTab}
                        onAddDriver={onAddDriver}
                        onUpdateDriver={onUpdateDriver}
                        onDeleteDriver={onDeleteDriver}
                    />
                )}

                {/* TOURS TAB */}
                {activeTab === 'TOURS' && (
                     <div className="">
                        <ToursManagement 
                            tours={tours}
                            onAddTour={onAddTour}
                            onUpdateTour={onUpdateTour}
                            onDeleteTour={onDeleteTour}
                        />
                    </div>
                )}

                {/* PROMOS TAB */}
                {activeTab === 'PROMOS' && (
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <h3 className="text-lg font-bold mb-4">Create Promo Code</h3>
                             <form onSubmit={handleCreatePromo} className="flex gap-4 items-end">
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                     <input className="border p-2 rounded w-32 font-bold uppercase" value={newPromoCode} onChange={e => setNewPromoCode(e.target.value)} placeholder="SUMMER25" required />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Discount %</label>
                                     <input className="border p-2 rounded w-20" type="number" value={newPromoPercent} onChange={e => setNewPromoPercent(Number(e.target.value))} min="1" max="100" />
                                 </div>
                                 <div>
                                     <label className="text-xs font-bold text-gray-500 uppercase">Limit</label>
                                     <input className="border p-2 rounded w-24" type="number" value={newPromoLimit} onChange={e => setNewPromoLimit(Number(e.target.value))} />
                                 </div>
                                 <button type="submit" className="bg-[var(--primary)] text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[var(--primary-dark)] shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all">Create</button>
                             </form>
                         </div>

                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs border-b">
                                     <tr>
                                         <th className="px-6 py-3">Code</th>
                                         <th className="px-6 py-3">Discount</th>
                                         <th className="px-6 py-3">Usage</th>
                                         <th className="px-6 py-3">Status</th>
                                         <th className="px-6 py-3 text-right">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {promoCodes.map(p => (
                                         <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                             <td className="px-6 py-3 font-bold font-mono">{p.code}</td>
                                             <td className="px-6 py-3 text-[var(--primary)] font-black text-xs">-{p.discountPercent}%</td>
                                             <td className="px-6 py-3">{p.usageCount} / {p.usageLimit}</td>
                                             <td className="px-6 py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">{p.status}</span></td>
                                             <td className="px-6 py-3 text-right"><button onClick={() => handleDeletePromo(p.id)} className="text-red-500 font-bold hover:underline">Delete</button></td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                )}

                {/* SMS LOGS TAB */}
                {activeTab === 'SMS' && (
                    <div className="">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 font-bold text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Time</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">To</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {smsLogs.map(log => (
                                        <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-3 font-bold text-xs">{log.type}</td>
                                            <td className="px-6 py-3 font-mono">{log.recipient}</td>
                                            <td className="px-6 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.status === 'SENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'SETTINGS' && (
                     <div className="">
                        <SystemSettingsView settings={settings} setSettings={setSettings} />
                     </div>
                )}
            </div>
        </main>
    </div>
  );
};

export default AdminDashboard;
