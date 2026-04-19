import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { Booking, Tour, Driver, Language } from '../types';
import { db } from '../services/db';
import { GEORGIAN_LOCATIONS } from '../data/locations';
import { storageService } from '../services/storage';
import TourEditModal from './driver/TourEditModal';
import DriverProfileSettings from './driver/DriverProfileSettings';
import { 
    LayoutDashboard, 
    Calendar, 
    Car, 
    ShieldCheck, 
    Map as MapIcon, 
    Ticket, 
    MessageSquare, 
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    Info,
    CheckCircle2,
    Clock,
    Zap,
    MapPin,
    ArrowRight,
    Search,
    User,
    RefreshCw,
    Star,
    Check
} from 'lucide-react';

interface DriverDashboardProps {
  bookings: Booking[];
  tours: Tour[];
  drivers: Driver[];
  onAddTour: (tour: Tour) => void;
  onUpdateTour: (tour: Tour) => void;
  onDeleteTour: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: any) => void;
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
  onDeleteDriver: (id: string) => void;
  driverId: string;
  onLogout: () => void;
  language?: Language;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
    bookings, tours, drivers, 
    onAddTour, onUpdateTour, onDeleteTour, onUpdateBookingStatus, 
    onAddDriver, onUpdateDriver, onDeleteDriver,
    driverId, onLogout, language = Language.EN 
}) => {
    const isEn = language === Language.EN;
  const [activeTab, setActiveTab] = useState(() => {
      if (typeof window !== 'undefined') {
          return sessionStorage.getItem('orbitrip_driver_active_tab') || 'JOBS';
      }
      return 'JOBS';
  });

  const [isOnline, setIsOnline] = useState(true);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [commissionRate, setCommissionRate] = useState(0); // Platform is now 0% commission
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDateDetails, setSelectedDateDetails] = useState<Booking[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [blockProcessing, setBlockProcessing] = useState(false);
  
  // Profile Editing State (Now Editable for Price Settings)
  const [editProfile, setEditProfile] = useState<Partial<Driver>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Author Tours State
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Partial<Tour>>({});
  const [isUploadingTour, setIsUploadingTour] = useState(false);

  useEffect(() => {
      if (typeof window !== 'undefined') {
          sessionStorage.setItem('orbitrip_driver_active_tab', activeTab);
      }
  }, [activeTab]);

  useEffect(() => {
      const fetchSettingsAndData = async () => {
          setIsRefreshing(true);
          window.dispatchEvent(new Event('orbitrip-db-change'));
          
          const settings = await db.settings.get();
          if (settings && settings.commissionRate) {
              setCommissionRate(settings.commissionRate);
          }
          setTimeout(() => setIsRefreshing(false), 500);
      };
      fetchSettingsAndData();
      
      window.addEventListener('orbitrip-db-change', fetchSettingsAndData);
      return () => window.removeEventListener('orbitrip-db-change', fetchSettingsAndData);
  }, []);

  const currentProfile = useMemo(() => {
      const found = drivers.find(d => String(d.id) === String(driverId));
      if (found) return found;
      return {
          id: driverId, name: 'Driver', email: '', city: 'tbilisi', 
          photoUrl: 'https://via.placeholder.com/150', carModel: 'Unknown',
          carPhotoUrl: '', vehicleType: 'Sedan', languages: [], rating: 5.0,
          reviewCount: 0, reviews: [], pricePerKm: 1.2, basePrice: 30,
          features: [], status: 'ACTIVE', blockedDates: []
      } as Driver;
  }, [drivers, driverId]);

  useEffect(() => {
      if (currentProfile) {
          setEditProfile({ 
              ...currentProfile,
              pricePerKm: currentProfile.pricePerKm || 1.2,
              basePrice: currentProfile.basePrice || 30
          });
          setBlockedDates(currentProfile.blockedDates || []);
      }
  }, [currentProfile]);


  const myBookings = useMemo(() => {
      if (!driverId) return [];
      return bookings.filter(b => {
          const bookingDriverId = b.driverId ? String(b.driverId) : '';
          const currentDriverId = String(driverId);
          return bookingDriverId === currentDriverId;
      });
  }, [bookings, driverId]);

  const marketBookings = useMemo(() => {
      return bookings.filter(b => 
          b.status === 'PENDING' && 
          (!b.driverId || b.driverName === 'Any Driver') &&
          b.id !== processingJobId 
      );
  }, [bookings, processingJobId]);

  const myAuthorTours = useMemo(() => {
      return tours.filter(t => t.authorId === driverId);
  }, [tours, driverId]);

  const pendingRequests = myBookings.filter(b => b.status === 'PENDING');
  const activeSchedule = myBookings.filter(b => b.status === 'CONFIRMED');
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');

  // --- CALENDAR LOGIC (COLOR CODING) ---
  const getDayKey = (dateInput: any): string => {
      if (!dateInput) return '';
      try {
          let dateStr = typeof dateInput === 'string' ? dateInput.split(' at ')[0] : dateInput;
          let date = new Date(dateStr);
          if (isNaN(date.getTime())) return '';
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
      } catch (e) {
          return '';
      }
  };

  const dateStatusMap = useMemo(() => {
      const map = new Map<string, 'PENDING' | 'CONFIRMED' | 'BLOCKED'>();
      blockedDates.forEach(dateStr => {
          const key = getDayKey(dateStr); 
          if (key) map.set(key, 'BLOCKED');
      });
      myBookings.forEach(b => {
          if (['CANCELLED', 'COMPLETED'].includes(b.status)) return;
          const key = getDayKey(b.date); 
          if (key) {
              const currentStatus = map.get(key);
              if (b.status === 'CONFIRMED') {
                  map.set(key, 'CONFIRMED');
              } else if (b.status === 'PENDING') {
                  if (currentStatus !== 'CONFIRMED') {
                      map.set(key, 'PENDING');
                  }
              }
          }
      });
      return map;
  }, [myBookings, blockedDates]);

  const earningsAmount = useMemo(() => {
      const totalNet = completedJobs.reduce((sum, b) => {
          const gross = typeof b.numericPrice === 'number' ? b.numericPrice : parseFloat(String(b.numericPrice || 0));
          if (Number.isNaN(gross)) return sum;
          return sum + gross; // 100% is driver profit
      }, 0);
      return Math.floor(totalNet); 
  }, [completedJobs]);

  const handleDateClick = async (date: Date) => {
      if (blockProcessing) return;
      setBlockProcessing(true);
      
      setSelectedDate(date);
      const key = getDayKey(date);
      const dayBookings = myBookings.filter(b => getDayKey(b.date) === key);
      setSelectedDateDetails(dayBookings);
      
      if (dayBookings.length === 0) {
          let newBlocked = [...blockedDates];
          const isCurrentlyBlocked = dateStatusMap.get(key) === 'BLOCKED';
          if (isCurrentlyBlocked) {
              newBlocked = newBlocked.filter(d => getDayKey(d) !== key);
          } else {
              newBlocked.push(key); 
          }
          setBlockedDates(newBlocked);
          const updatedDriver = { ...currentProfile, blockedDates: newBlocked } as Driver;
          await onUpdateDriver(updatedDriver); 
      }
      setTimeout(() => setBlockProcessing(false), 300);
  };

  const renderDayContents = (day: number, date: Date) => {
      const key = getDayKey(date);
      const status = dateStatusMap.get(key);
      const isSelected = selectedDate && getDayKey(selectedDate) === key;
      let colorClass = 'bg-white text-gray-700 hover:bg-gray-100 border-gray-100';
      let statusIcon = null;

      if (status === 'CONFIRMED') {
          colorClass = 'bg-green-500 text-white hover:bg-green-600 font-bold shadow-md border-green-500';
          statusIcon = <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>;
      } else if (status === 'PENDING') {
          colorClass = 'bg-amber-400 text-white hover:bg-amber-500 font-bold shadow-md animate-pulse border-amber-400';
          statusIcon = <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>;
      } else if (status === 'BLOCKED') {
          colorClass = 'bg-red-50 text-red-400 hover:bg-red-100 font-bold shadow-inner border-red-100';
          statusIcon = <div className="absolute top-0.5 right-0.5 text-[8px]">⛔</div>;
      }

      return (
          <div className={`w-full h-full flex items-center justify-center rounded-xl transition-all duration-200 border-2 relative ${colorClass} ${isSelected ? 'ring-2 ring-[var(--primary)] ring-offset-1 z-10' : ''}`}>
              {day}
              {statusIcon}
          </div>
      );
  };

  const handleTakeJob = async (jobId: string) => {
      setProcessingJobId(jobId);
      const success = await db.bookings.assignDriver(jobId, currentProfile as Driver);
      if (success) {
          setTimeout(() => setActiveTab('JOBS'), 500); 
      } else {
          alert("Sorry, this job was just taken by another driver.");
          window.dispatchEvent(new Event('orbitrip-db-change'));
      }
      setProcessingJobId(null);
  };

  const handleManualRefresh = () => {
      setIsRefreshing(true);
      window.dispatchEvent(new Event('orbitrip-db-change'));
      setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleStatusChange = (id: string, s: string) => { onUpdateBookingStatus(id, s); };

  const handleProfileUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProfile(true);
      try {
          const updatedDriver = {
              ...currentProfile,
              pricePerKm: editProfile.pricePerKm,
              basePrice: editProfile.basePrice
          } as Driver;
          
          await onUpdateDriver(updatedDriver);
          alert("Pricing settings updated successfully!");
      } catch (err) {
          console.error(err);
          alert("Failed to update profile.");
      } finally {
          setIsSavingProfile(false);
      }
  };

  // --- AUTHOR TOUR LOGIC ---
  const handleOpenTourModal = (tour?: Tour) => {
      setIsUploadingTour(false);
      if (tour) {
          setEditingTour({ ...tour });
      } else {
          setEditingTour({
              id: `tour-author-${Date.now()}`,
              authorId: driverId,
              titleEn: '', titleRu: '',
              descriptionEn: '', descriptionRu: '',
              price: '150 GEL', basePrice: 150,
              duration: '5-6 Hours',
              category: 'AUTHOR',
              rating: 5,
              image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c',
              highlightsEn: [], highlightsRu: [],
              routeStops: [],
              priceOptions: [{ vehicle: currentProfile.vehicleType, price: '150 GEL', guests: '1-4' }],
              reviews: []
          });
      }
      setIsTourModalOpen(true);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
      e.preventDefault();
      const newTour = {
          ...editingTour,
          category: 'AUTHOR',
          authorId: driverId,
          // Ensure at least one price option matches driver
          priceOptions: [{ vehicle: currentProfile.vehicleType, price: editingTour.price || '150 GEL', guests: `1-${currentProfile.maxPassengers}` }]
      } as Tour;

      const exists = tours.find(t => t.id === newTour.id);
      if (exists) {
          await onUpdateTour(newTour);
      } else {
          await onAddTour(newTour);
      }
      setIsTourModalOpen(false);
  };

  const handleArrayInput = (field: keyof Tour, value: string) => {
      setEditingTour(prev => ({
          ...prev,
          [field]: value.split(',').map(s => s.trim())
      }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 md:flex-row font-sans overflow-hidden">
        
        {/* MOBILE HEADER - PREMIUM SYNC */}
        <div className="md:hidden bg-slate-950 text-white p-4 flex justify-between items-center z-50 shadow-xl fixed top-0 w-full h-16 border-b border-slate-900">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white">
                    <Car size={18} />
                </div>
                <h1 className="font-black text-sm uppercase tracking-tighter italic">ORBI<span className="text-[var(--primary)] not-italic">TRIP</span></h1>
            </div>
            <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Active' : 'Offline'}</span>
                 </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white bg-slate-900 rounded-xl">
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className={`fixed inset-y-0 left-0 z-40 bg-slate-950 text-white transform transition-all duration-500 md:relative md:translate-x-0 w-72 flex flex-col pt-16 md:pt-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}`}>
            <div className="p-8 border-b border-slate-900 hidden md:block">
                 <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
                        <Car size={20} />
                    </div>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter">ORBI<span className="text-[var(--primary)] not-italic">TRIP</span></h1>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Partner Hub</p>
            </div>
            
            <div className="p-6 border-b border-slate-900">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="relative">
                        <img src={currentProfile.photoUrl} className="w-14 h-14 rounded-2xl border-2 border-[var(--primary)]/30 object-cover shadow-xl" alt="Profile" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-slate-950 rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-black text-base leading-tight truncate w-32 uppercase tracking-tighter">{currentProfile.name}</h2>
                        <div className="text-amber-400 text-xs font-black flex items-center gap-1 mt-1">
                            <Star size={12} fill="currentColor" />
                            <span>{currentProfile.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-900 rounded-3xl p-6 text-center mb-8 border border-slate-800 relative overflow-hidden group shadow-inner">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Net Earnings</p>
                    <p className="text-4xl font-black text-[var(--primary)] tracking-tighter italic">{earningsAmount.toFixed(0)}<span className="text-lg not-italic ml-1 opacity-50">GEL</span></p>
                    <div className="flex justify-center items-center gap-2 mt-3">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Service Fee: 0%</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </div>

                <button onClick={() => setIsOnline(!isOnline)} className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center transition-all duration-300 shadow-xl ${isOnline ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-[var(--primary)]/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                    {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {[
                    { id: 'MARKET', icon: <Search size={18} />, label: 'Marketplace' },
                    { id: 'JOBS', icon: <Car size={18} />, label: 'My Jobs' },
                    { id: 'MY_TOURS', icon: <MapPin size={18} />, label: 'My Tours' },
                    { id: 'CALENDAR', icon: <Calendar size={18} />, label: 'Calendar' },
                    { id: 'GUIDE', icon: <Info size={18} />, label: 'Guide' }, 
                    { id: 'EARNINGS', icon: <Wallet size={18} />, label: 'Earnings' },
                    { id: 'PROFILE', icon: <Settings size={18} />, label: 'Pricing' }
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === item.id ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20 translate-x-1' : 'text-slate-500 hover:bg-slate-900 hover:text-white'}`}
                    >
                        <span className="mr-4">{item.icon}</span>
                        {item.label}
                        {item.id === 'MARKET' && marketBookings.length > 0 && <span className="ml-auto bg-[var(--primary)] text-white text-[9px] px-2 py-0.5 rounded-lg font-black animate-pulse shadow-lg shadow-[var(--primary)]/30 border border-white/20">{marketBookings.length}</span>}
                        {item.id === 'JOBS' && pendingRequests.length > 0 && <span className="ml-auto bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-lg font-black shadow-lg shadow-amber-500/30">{pendingRequests.length}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-900">
                <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-rose-500/10">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 pt-20 md:pt-8">
            <div className="max-w-6xl mx-auto pb-20 md:pb-0">
                
                {/* --- TAB: MARKETPLACE --- */}
                {activeTab === 'MARKET' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800">Available Orders</h3>
                                <p className="text-sm text-gray-500">Pick up new passengers here</p>
                            </div>
                            <button onClick={handleManualRefresh} className={`bg-white text-[var(--primary)] px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow transition border border-[var(--primary)]/10 flex items-center w-full md:w-auto justify-center ${isRefreshing ? 'opacity-50 cursor-wait' : ''}`}>
                                <span className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`}>↻</span> Refresh
                            </button>
                        </div>
                        
                        {marketBookings.length === 0 ? (
                            <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Search size={40} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No open orders</h4>
                                <p className="text-sm text-slate-400 font-medium">Check back later or enable notifications.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {marketBookings.map(job => (
                                    <div key={job.id} className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[9px] font-black px-5 py-2 rounded-bl-2xl shadow-lg uppercase tracking-widest">
                                            New Opportunity
                                        </div>
                                        <div className="mb-6">
                                            <h4 className="font-black text-xl text-slate-900 leading-tight mb-4 line-clamp-2 h-14 uppercase tracking-tighter">{job.tourTitle}</h4>
                                            <div className="flex items-center text-xs text-slate-500 font-black uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <Calendar size={14} className="mr-3 text-[var(--primary)]" /> {job.date}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-slate-50 pt-6 mt-auto">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Potential Profit</p>
                                                <span className="text-3xl font-black text-slate-900 italic">{job.numericPrice}<span className="text-lg not-italic ml-1 opacity-40">GEL</span></span>
                                            </div>
                                            <button onClick={() => handleTakeJob(job.id)} disabled={!!processingJobId} className="bg-slate-900 hover:bg-[var(--primary)] text-white text-[10px] font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-[var(--primary)]/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest flex items-center gap-2">
                                                {processingJobId === job.id ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                                {processingJobId === job.id ? 'Taking...' : 'Accept'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB: MY TOURS --- */}
                {activeTab === 'MY_TOURS' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800">My Author Tours</h3>
                                <p className="text-sm text-gray-500">Create and manage your unique offers</p>
                            </div>
                            <button onClick={() => handleOpenTourModal()} className="bg-[var(--primary)] text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:bg-[var(--primary-dark)] transition-all flex items-center w-full md:w-auto justify-center gap-2">
                                <MapPin size={16} /> New Tour
                            </button>
                        </div>

                        {myAuthorTours.length === 0 ? (
                             <div className="text-center py-24 bg-white rounded-[32px] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <MapIcon size={40} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No tours created</h4>
                                <p className="text-sm text-slate-400 font-medium">Start by creating your first unique route!</p>
                            </div>
                        ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myAuthorTours.map(t => (
                                    <div key={t.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
                                        <div className="relative h-32">
                                            <img src={t.image} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded">AUTHOR</div>
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{t.titleEn}</h4>
                                            <p className="text-xs text-gray-500 mb-3">{t.price}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleOpenTourModal(t)} className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded hover:bg-gray-200">Edit</button>
                                                <button onClick={() => { if(confirm('Delete?')) onDeleteTour(t.id) }} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded hover:bg-red-100">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                )}

                {/* --- TAB: MY JOBS --- */}
                {activeTab === 'JOBS' && (
                    <div className="space-y-8 animate-fadeIn">
                        
                        {/* PENDING REQUESTS */}
                        {pendingRequests.length > 0 && (
                            <div className="bg-amber-50/50 border border-amber-100 rounded-[32px] p-8 shadow-sm mb-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-900 pointer-events-none">
                                    <Clock size={120} />
                                </div>
                                <h3 className="text-xl font-black text-amber-900 mb-6 flex items-center uppercase tracking-tighter italic">
                                    <Clock className="mr-3 text-amber-600" size={24} /> Action Required
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {pendingRequests.map(job => (
                                        <div key={job.id} className="bg-white rounded-[28px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-amber-100/50">
                                            <div className="flex-1">
                                                <h4 className="font-black text-lg text-slate-900 uppercase tracking-tighter">{job.tourTitle}</h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">ID: {job.id.slice(-6).toUpperCase()}</span>
                                                    <span className="text-xs text-slate-500 font-black uppercase tracking-widest">📅 {job.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                                                <div className="text-right">
                                                    <span className="block text-3xl font-black text-slate-900 italic leading-none">{job.numericPrice}<span className="text-base not-italic ml-1 opacity-40">GEL</span></span>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Cash Reward</span>
                                                </div>
                                                <button onClick={() => handleStatusChange(job.id, 'CONFIRMED')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest text-[10px] active:scale-95 flex items-center gap-2">
                                                    <Check size={16} /> Confirm
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ACTIVE SCHEDULE */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><span className="mr-3">🗓️</span> Upcoming Schedule</h3>
                            {activeSchedule.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-gray-400">No confirmed jobs yet.</p>
                                    <button onClick={() => setActiveTab('MARKET')} className="mt-4 text-[var(--primary)] font-bold hover:underline">{isEn ? "Check Marketplace →" : "Проверить биржу →"}</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeSchedule.map(job => (
                                        <div key={job.id} className="bg-white border-l-8 border-green-500 rounded-r-2xl p-6 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide">Confirmed</span>
                                                    <h4 className="font-bold text-gray-900 mt-2 text-lg">{job.tourTitle}</h4>
                                                    <div className="mt-1 text-[10px] font-bold text-gray-400 bg-gray-50 inline-block px-1 rounded">#{job.id.slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">📅</span> <strong>{job.date}</strong></div>
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">👤</span> {job.customerName} ({job.guests} pax)</div>
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">📞</span> <a href={`tel:${job.contactInfo}`} className="text-blue-600 hover:underline font-bold">{job.contactInfo}</a></div>
                                                {job.flightNumber && <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg"><span className="mr-3">✈️</span> Flight: {job.flightNumber}</div>}
                                            </div>

                                            {/* FINANCIAL BREAKDOWN */}
                                            <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-3 mb-6 grid grid-cols-2 gap-2 text-center">
                                                <div>
                                                    <div className="text-[10px] font-bold text-[var(--primary)]/50 uppercase">Collect Cash</div>
                                                    <div className="text-xl font-black text-slate-900">{job.numericPrice} GEL</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-blue-500 uppercase">Your Profit</div>
                                                    <div className="text-xl font-black text-blue-600">{job.numericPrice} GEL</div>
                                                </div>
                                            </div>

                                            <button onClick={() => handleStatusChange(job.id, 'COMPLETED')} className="w-full bg-white border-2 border-[var(--primary)]/10 text-[var(--primary)] font-bold py-3 rounded-xl hover:bg-[var(--primary)]/5 transition flex items-center justify-center">
                                                <span className="mr-2">🏁</span> Mark as Completed
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: CALENDAR --- */}
                {activeTab === 'CALENDAR' && (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 animate-fadeIn">
                        <div className="md:w-1/2">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Availability Calendar</h3>
                            <div className="calendar-wrapper driver-calendar">
                                <style>{`
                                    .driver-calendar .react-datepicker { border: none; font-family: inherit; width: 100%; }
                                    .driver-calendar .react-datepicker__month-container { width: 100%; }
                                    .driver-calendar .react-datepicker__header { background: white; border: none; padding-top: 1rem; }
                                    .driver-calendar .react-datepicker__day-name { color: #9ca3af; font-weight: bold; width: 3rem; margin: 0.2rem; }
                                    .driver-calendar .react-datepicker__day { width: 3rem; height: 3rem; margin: 0.2rem; position: relative; }
                                    .driver-calendar .react-datepicker__day--selected { background-color: transparent !important; }
                                    .driver-calendar .react-datepicker__day--keyboard-selected { background-color: transparent !important; }
                                `}</style>
                                <DatePicker inline selected={selectedDate} onChange={handleDateClick} renderDayContents={renderDayContents} />
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-6 text-xs font-bold text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                <div className="flex items-center"><span className="w-4 h-4 bg-green-500 rounded-full mr-3 shadow-sm ring-2 ring-green-200"></span> Confirmed Job</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-amber-400 rounded-full mr-3 shadow-sm ring-2 ring-amber-200 animate-pulse"></span> Pending Request</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-red-100 border border-red-200 rounded-full mr-3 shadow-sm"></span> Blocked Day</div>
                                <div className="flex items-center"><span className="w-4 h-4 bg-white border border-gray-300 rounded-full mr-3 shadow-sm"></span> Available</div>
                            </div>
                        </div>
                        
                        <div className="md:w-1/2 border-l border-gray-100 pl-0 md:pl-12">
                            <h4 className="font-bold text-gray-900 mb-6 flex items-center text-lg"><span className="text-2xl mr-3 bg-gray-100 p-2 rounded-lg">📅</span> Details for {selectedDate?.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</h4>
                            {selectedDateDetails.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateDetails.map(job => (
                                        <div key={job.id} className={`rounded-[28px] p-6 border shadow-sm transition-all duration-300 ${job.status === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm ${job.status === 'CONFIRMED' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>{job.status}</span>
                                                <span className="font-black text-slate-900 text-2xl italic">{job.numericPrice}<span className="text-xs not-italic ml-1 opacity-40">GEL</span></span>
                                            </div>
                                            <div className="font-black text-slate-900 text-lg uppercase tracking-tighter mb-4">{job.tourTitle}</div>
                                            {job.status === 'PENDING' && (
                                                <div className="mt-4 pt-6 border-t border-amber-200/50 flex gap-2">
                                                    <button onClick={() => handleStatusChange(job.id, 'CONFIRMED')} className="flex-1 bg-emerald-500 text-white text-[10px] font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 uppercase tracking-widest flex items-center justify-center gap-2">
                                                        <Check size={16} /> Accept Request
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 h-full flex flex-col justify-center items-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">
                                        {blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? <X className="text-rose-500" /> : <Star className="text-amber-400" />}
                                    </div>
                                    <p className="text-slate-900 font-black uppercase tracking-tighter text-base mb-2">
                                        {blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? "Busy / Off Day" : "Open for Bookings"}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                                        {blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? "No jobs can be assigned" : "You are visible to clients"}
                                    </p>
                                    <button 
                                        onClick={() => handleDateClick(selectedDate || new Date())} 
                                        disabled={blockProcessing} 
                                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 ${blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50' : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'}`}>
                                        {blockProcessing ? <RefreshCw size={14} className="animate-spin" /> : (blockedDates.includes(selectedDate ? getDayKey(selectedDate) : '') ? "Unblock Date" : "Block Date")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB: GUIDE (INSTRUCTIONS) --- */}
                {activeTab === 'GUIDE' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                        {/* HERO HEADER */}
                        <div className="bg-gradient-to-r from-slate-950 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-4xl font-black mb-4">Partner Guidelines</h2>
                                <p className="text-slate-400 text-lg max-w-2xl font-bold tracking-tight italic">{isEn ? "Welcome to the OrbiTrip Family! We create unforgettable memories for tourists." : "Добро пожаловать в семью OrbiTrip!"}</p>
                            </div>
                            <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* RULE 1: FINANCIALS (13%) */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl group-hover:scale-110 transition-transform">💰</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                    {isEn ? "Earnings & Payments" : "Выплаты и платежи"}
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        <strong>{isEn ? "Cash Payment:" : "Оплата наличными:"}</strong> {isEn ? "The client pays you the full amount in CASH at the end of the trip." : "Клиент платит вам полную сумму НАЛИЧНЫМИ в конце поездки."}
                                    </p>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-emerald-700 text-sm font-black mb-2 uppercase tracking-tight">{isEn ? "Zero Commission" : "Нулевая комиссия"}</p>
                                        <p className="text-emerald-800 text-xs font-bold leading-relaxed">
                                            {isEn ? "OrbiTrip operates with 0% platform commission. You keep 100% of the price shown in your dashboard." : "OrbiTrip работает с комиссией 0%. Вы оставляете себе 100% стоимости, указанной в вашем кабинете."}
                                            <br/><br/>
                                            {isEn ? "Help us grow: Ensure high service quality so clients return and leave positive reviews!" : "Помогите нам расти: обеспечьте высокое качество сервиса, чтобы клиенты возвращались и оставляли отзывы!"}
                                        </p>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed font-bold italic">
                                        {isEn ? "It is strictly forbidden to ask for extra fees for luggage, wait time, or air conditioning." : "Строго запрещено просить доплату за багаж, ожидание или кондиционер."}
                                    </p>
                                </div>
                            </div>

                            {/* RULE 2: CANCELLATION */}
                            <div className="bg-red-50 p-8 rounded-3xl shadow-sm border border-red-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-red-900">⚠️</div>
                                <h3 className="text-xl font-black text-red-900 mb-4 flex items-center">
                                    <span className="bg-red-200 text-red-800 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                    Penalties
                                </h3>
                                <p className="text-red-800 text-sm leading-relaxed mb-4">
                                    Cancelling a confirmed booking causes significant issues.
                                </p>
                                <div className="bg-white/60 p-4 rounded-xl border border-red-200">
                                    <p className="text-red-900 text-xs font-bold mb-1">Penalty Rule:</p>
                                    <p className="text-red-800 text-xs leading-relaxed">
                                        If a booking is cancelled due to your fault and the administrator has to assign a more expensive driver, the difference will be charged to your debt.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: EARNINGS --- */}
                {activeTab === 'EARNINGS' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center relative overflow-hidden group">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Total Volume</p>
                                <p className="text-4xl font-black text-slate-900 italic">{completedJobs.length}<span className="text-xs not-italic ml-1 opacity-40 uppercase tracking-widest font-black">Trips</span></p>
                            </div>
                            <div className="bg-slate-900 p-8 rounded-[32px] shadow-2xl text-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-white group-hover:rotate-12 transition-transform">
                                    <Wallet size={80} />
                                </div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Net Profit</p>
                                <p className="text-4xl font-black text-[var(--primary)] italic">{earningsAmount}<span className="text-lg not-italic ml-1 opacity-50">GEL</span></p>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Paid in Cash</span>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center group">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Service Debt</p>
                                <p className={`text-4xl font-black italic ${currentProfile.debt && currentProfile.debt > 0 ? 'text-rose-500' : 'text-slate-200'}`}>
                                    {currentProfile.debt || 0}<span className="text-lg not-italic ml-1 opacity-50">GEL</span>
                                </p>
                            </div>
                        </div>

                        {currentProfile.debt && currentProfile.debt > 0 && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <h4 className="text-red-800 font-black text-lg uppercase">Commission Debt</h4>
                                    <p className="text-red-700 text-sm">You owe platform fees (13%) from previous trips.</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-black text-red-600">-{currentProfile.debt} GEL</span>
                                    <button onClick={() => alert("Contact Admin to transfer: 995 593 456 876")} className="text-xs font-bold underline text-red-800 hover:text-red-900">Pay Now</button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Job Description</th>
                                        <th className="px-6 py-4 text-right">Your Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {completedJobs.map(job => {
                                        const gross = job.numericPrice || 0;
                                        return (
                                            <tr key={job.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-800">{job.date}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600 font-bold">{job.tourTitle}</div>
                                                    <div className="text-[10px] text-gray-400">ID: #{job.id.slice(-6).toUpperCase()}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-blue-600">+{gross} GEL</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {completedJobs.length === 0 && <div className="p-8 text-center text-gray-400">No completed jobs yet.</div>}
                        </div>
                    </div>
                )}

                {/* --- TAB: PROFILE (EDITABLE PRICING) --- */}
                {activeTab === 'PROFILE' && (
                    <DriverProfileSettings 
                        currentProfile={currentProfile}
                        editProfile={editProfile}
                        setEditProfile={setEditProfile}
                        handleProfileUpdate={handleProfileUpdate}
                        isSavingProfile={isSavingProfile}
                    />
                )}

            </div>
        </div>

        {/* --- TOUR CREATE/EDIT MODAL --- */}
        {isTourModalOpen && (
             <TourEditModal 
                editingTour={editingTour}
                setEditingTour={setEditingTour}
                isUploadingTour={isUploadingTour}
                setIsUploadingTour={setIsUploadingTour}
                onSave={handleSaveTour}
                onClose={() => setIsTourModalOpen(false)}
                handleArrayInput={handleArrayInput}
             />
        )}

    </div>
  );
};

export default DriverDashboard;