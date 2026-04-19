import React, { useState, useMemo } from 'react';
import { Driver, VehicleType } from '../../types';
import { storageService } from '../../services/storage';
import { 
    Search, 
    UserPlus, 
    Edit, 
    Trash2, 
    X, 
    Image as ImageIcon, 
    Upload, 
    Check, 
    AlertCircle, 
    Globe, 
    Zap,
    MapPin,
    Phone,
    Mail,
    Lock,
    Settings
} from 'lucide-react';

interface DriversListProps {
    drivers: Driver[];
    onAddDriver: (driver: Driver) => void;
    onUpdateDriver: (driver: Driver) => Promise<any>;
    onDeleteDriver: (id: string) => void;
    activeTab: string;
}

const DEFAULT_DRIVER: Driver = {
    id: '',
    name: '',
    email: '',
    password: '',
    phoneNumber: '+995',
    city: 'tbilisi',
    carModel: '',
    carPhotoUrl: '',
    carPhotos: [],
    vehicleType: 'Sedan',
    status: 'ACTIVE',
    rating: 5.0,
    reviewCount: 0,
    reviews: [],
    pricePerKm: 1.0,
    basePrice: 30,
    maxPassengers: 4,
    languages: ['KA', 'RU'],
    features: ['AC', 'WiFi'],
    blockedDates: [],
    documents: [],
    debt: 0,
    photoUrl: ''
};

const DriversList: React.FC<DriversListProps> = ({ drivers, onAddDriver, onUpdateDriver, onDeleteDriver, activeTab }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver>(DEFAULT_DRIVER);
    const [isUploading, setIsUploading] = useState<number | string | null>(null); // Track specific slot uploading

    // --- MODAL HANDLERS ---
    const openModal = (driver?: Driver) => {
        if (driver) {
            setEditingDriver({ ...driver, carPhotos: driver.carPhotos || [] });
        } else {
            setEditingDriver({
                ...DEFAULT_DRIVER,
                id: `drv-${Date.now()}`,
                email: `driver${Date.now()}@orbitrip.ge`,
                password: 'start'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDriver(DEFAULT_DRIVER);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const exists = drivers.find(d => d.id === editingDriver.id);
        
        try {
            if (exists) {
                await onUpdateDriver(editingDriver);
            } else {
                onAddDriver(editingDriver);
            }
            closeModal();
        } catch (error) {
            alert("Error saving driver. Check console.");
            console.error(error);
        }
    };

    // --- FIELD HANDLERS ---
    const handleChange = (field: keyof Driver, value: any) => {
        setEditingDriver(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayToggle = (field: 'languages' | 'features', value: string) => {
        setEditingDriver(prev => {
            const arr = prev[field] || [];
            const newArr = arr.includes(value) 
                ? arr.filter(item => item !== value) 
                : [...arr, value];
            return { ...prev, [field]: newArr };
        });
    };

    // --- FILE UPLOAD HANDLERS ---
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading('avatar');
        try {
            const url = await storageService.uploadDriverImage(file, editingDriver.id, 'avatar');
            if (url) handleChange('photoUrl', url);
        } catch (err: any) {
            alert(`Upload failed: ${err.message}`);
        } finally {
            setIsUploading(null);
        }
    };

    // Slot Mapping: -1 = Front (Main), 0 = Back, 1 = Side, 2 = Interior
    const handleCarSlotUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsUploading(slotIndex);
        
        // Define naming convention based on slot
        let suffix = 'car_main';
        if (slotIndex === 0) suffix = 'car_back';
        if (slotIndex === 1) suffix = 'car_side';
        if (slotIndex === 2) suffix = 'car_interior';
        if (slotIndex === -1) suffix = 'car_front'; // Main image

        try {
            const url = await storageService.uploadDriverImage(file, editingDriver.id, suffix);
            
            if (url) {
                if (slotIndex === -1) {
                    // Update Main Photo
                    setEditingDriver(prev => ({ ...prev, carPhotoUrl: url }));
                } else {
                    // Update Gallery Array
                    setEditingDriver(prev => {
                        const newPhotos = [...(prev.carPhotos || [])];
                        // Ensure array is filled up to index
                        while (newPhotos.length <= slotIndex) {
                            newPhotos.push('');
                        }
                        newPhotos[slotIndex] = url;
                        return { ...prev, carPhotos: newPhotos };
                    });
                }
            }
        } catch (err: any) {
            alert(`Upload failed: ${err.message}`);
        } finally {
            setIsUploading(null);
        }
    };

    const removeCarPhoto = (slotIndex: number) => {
         if (slotIndex === -1) {
             setEditingDriver(prev => ({ ...prev, carPhotoUrl: '' }));
         } else {
             setEditingDriver(prev => {
                const newPhotos = [...(prev.carPhotos || [])];
                if (newPhotos[slotIndex]) {
                    newPhotos[slotIndex] = ''; // Just clear the string to keep index position or splice if strictly dynamic
                    // Better to just empty string to maintain "slots" logic for now
                }
                return { ...prev, carPhotos: newPhotos };
             });
         }
    };

    // --- FILTERING ---
    const processedDrivers = useMemo(() => {
        let list = drivers;
        if (activeTab === 'PENDING') {
            list = list.filter(d => d.status === 'PENDING');
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter(d => 
                d.name.toLowerCase().includes(lower) || 
                d.email.toLowerCase().includes(lower) ||
                d.phoneNumber?.includes(lower)
            );
        }
        return list;
    }, [drivers, activeTab, searchTerm]);

    return (
        <div className="space-y-6 pt-24 md:pt-8"> 
            
            {/* Header & Actions - PREMIUM STYLE */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-96 group">
                    <input 
                        type="text" 
                        placeholder="Search fleet by name, email or phone..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300 text-sm font-medium"
                    />
                    <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                </div>
                {activeTab === 'DRIVERS' && (
                    <button 
                        onClick={() => openModal()} 
                        className="w-full md:w-auto bg-slate-900 hover:bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <UserPlus size={16} /> Add New Partner
                    </button>
                )}
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Partner</th>
                                <th className="px-8 py-5">Vehicle Meta</th>
                                <th className="px-8 py-5">Pricing / Tariff</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {processedDrivers.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-medium uppercase tracking-widest text-[10px]">No partners found in local database</td></tr>
                            ) : (
                                processedDrivers.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <img src={d.photoUrl || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase tracking-tighter italic">{d.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{d.phoneNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-black text-slate-700 uppercase tracking-tighter mb-1">{d.carModel}</p>
                                            <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[9px] uppercase font-black tracking-widest border border-white/10 shadow-sm">{d.vehicleType}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate:</span>
                                                    <span className="font-black text-slate-900">{d.pricePerKm} <span className="text-[10px] opacity-40">GEL/KM</span></span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base:</span>
                                                    <span className="font-black text-slate-900">{d.basePrice} <span className="text-[10px] opacity-40">GEL</span></span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${d.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : d.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openModal(d)} className="p-2 text-slate-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-xl transition-all">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => { if(confirm('Delete partner permanently?')) onDeleteDriver(d.id); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- FULL EDIT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 ">
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        
                        <div className="bg-slate-950 px-10 py-6 border-b border-slate-900 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{editingDriver.name ? editingDriver.name : 'New Partner'} <span className="text-[var(--primary)] not-italic tracking-widest text-xs ml-3 uppercase">Configuration</span></h2>
                            <button onClick={closeModal} className="w-10 h-10 bg-slate-900 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form id="driverForm" onSubmit={handleSave} className="space-y-8">
                                
                                {/* SECTION 1: IDENTITY */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Identity & Login</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex gap-4 items-center">
                                             <div className="relative group w-20 h-20 flex-shrink-0">
                                                 <img src={editingDriver.photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover border-2 border-gray-200" />
                                                 <label className="absolute inset-0 bg-black/30 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition text-xs font-bold">
                                                     {isUploading === 'avatar' ? '...' : 'Change'}
                                                     <input type="file" className="hidden" onChange={handleAvatarUpload} />
                                                 </label>
                                             </div>
                                             <div className="flex-1">
                                                 <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                                                 <input required className="w-full border p-3 rounded-xl" value={editingDriver.name} onChange={e => handleChange('name', e.target.value)} />
                                             </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                                            <input required className="w-full border p-3 rounded-xl" value={editingDriver.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Email (Login)</label>
                                            <input required type="email" className="w-full border p-3 rounded-xl" value={editingDriver.email} onChange={e => handleChange('email', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                                            <input className="w-full border p-3 rounded-xl" value={editingDriver.password} onChange={e => handleChange('password', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                                            <select className="w-full border p-3 rounded-xl bg-white" value={editingDriver.city} onChange={e => handleChange('city', e.target.value)}>
                                                <option value="tbilisi">Tbilisi</option>
                                                <option value="kutaisi">Kutaisi</option>
                                                <option value="batumi">Batumi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                            <select className="w-full border p-3 rounded-xl bg-white" value={editingDriver.status} onChange={e => handleChange('status', e.target.value)}>
                                                <option value="ACTIVE">Active</option>
                                                <option value="PENDING">Pending</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 2: VEHICLE PHOTOS (4 SLOTS) */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Vehicle Photos (Mandatory 4 Angles)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        
                                        {/* Slot 1: Front (Main) */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-center text-gray-500">1. Front / Main</p>
                                            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition group">
                                                {editingDriver.carPhotoUrl ? (
                                                    <>
                                                        <img src={editingDriver.carPhotoUrl} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeCarPhoto(-1)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}
                                                
                                                {isUploading === -1 && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-indigo-600 font-bold text-xs animate-pulse">Uploading...</div>}
                                                
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCarSlotUpload(e, -1)} />
                                            </div>
                                        </div>

                                        {/* Slot 2: Back */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-center text-gray-500">2. Back</p>
                                            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition group">
                                                {editingDriver.carPhotos?.[0] ? (
                                                    <>
                                                        <img src={editingDriver.carPhotos[0]} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeCarPhoto(0)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}
                                                
                                                {isUploading === 0 && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-indigo-600 font-bold text-xs animate-pulse">Uploading...</div>}

                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCarSlotUpload(e, 0)} />
                                            </div>
                                        </div>

                                        {/* Slot 3: Side */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-center text-gray-500">3. Side</p>
                                            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition group">
                                                {editingDriver.carPhotos?.[1] ? (
                                                    <>
                                                        <img src={editingDriver.carPhotos[1]} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeCarPhoto(1)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}

                                                {isUploading === 1 && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-indigo-600 font-bold text-xs animate-pulse">Uploading...</div>}

                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCarSlotUpload(e, 1)} />
                                            </div>
                                        </div>

                                        {/* Slot 4: Interior */}
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-center text-gray-500">4. Interior</p>
                                            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition group">
                                                {editingDriver.carPhotos?.[2] ? (
                                                    <>
                                                        <img src={editingDriver.carPhotos[2]} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeCarPhoto(2)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                                                    </>
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}

                                                {isUploading === 2 && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-indigo-600 font-bold text-xs animate-pulse">Uploading...</div>}

                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleCarSlotUpload(e, 2)} />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* SECTION 3: VEHICLE INFO & PRICING */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Specs & Pricing</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Car Model</label>
                                            <input required className="w-full border p-3 rounded-xl" value={editingDriver.carModel} onChange={e => handleChange('carModel', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
                                            <select className="w-full border p-3 rounded-xl bg-white" value={editingDriver.vehicleType} onChange={e => handleChange('vehicleType', e.target.value)}>
                                                <option value="Sedan">Sedan</option>
                                                <option value="Minivan">Minivan</option>
                                                <option value="SUV">SUV</option>
                                                <option value="Bus">Bus</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Max Passengers</label>
                                            <input type="number" className="w-full border p-3 rounded-xl" value={editingDriver.maxPassengers} onChange={e => handleChange('maxPassengers', parseInt(e.target.value))} />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Price Per KM (GEL)</label>
                                            <input type="number" step="0.1" className="w-full border p-3 rounded-xl" value={editingDriver.pricePerKm} onChange={e => handleChange('pricePerKm', parseFloat(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Base Price (GEL)</label>
                                            <input type="number" className="w-full border p-3 rounded-xl" value={editingDriver.basePrice} onChange={e => handleChange('basePrice', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Debt (GEL)</label>
                                            <div className="flex gap-2">
                                                <input type="number" className="w-full border p-3 rounded-xl bg-red-50 text-red-600 font-bold" value={editingDriver.debt} onChange={e => handleChange('debt', parseFloat(e.target.value))} />
                                                <button type="button" onClick={() => handleChange('debt', 0)} className="bg-gray-200 px-3 rounded-xl hover:bg-gray-300">↺</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: FEATURES & LANGUAGES */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Features & Languages</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2">Languages</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['KA', 'EN', 'RU', 'DE'].map(lang => (
                                                    <button type="button" key={lang} onClick={() => handleArrayToggle('languages', lang)} className={`px-3 py-1 rounded-full text-xs font-bold border ${editingDriver.languages.includes(lang) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-300'}`}>
                                                        {lang}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2">Comfort</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['AC', 'WiFi', 'Water', 'Child Seat', 'Roof Box', 'Non-Smoking'].map(feat => (
                                                    <button type="button" key={feat} onClick={() => handleArrayToggle('features', feat)} className={`px-3 py-1 rounded-full text-xs font-bold border ${editingDriver.features.includes(feat) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-300'}`}>
                                                        {feat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end gap-4">
                            <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">Cancel</button>
                            <button type="submit" form="driverForm" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition transform active:scale-95">
                                {editingDriver.id ? 'Save Changes' : 'Create Driver'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default DriversList;