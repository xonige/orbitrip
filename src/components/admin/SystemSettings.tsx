import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { db } from '../../services/db';
import { smsService } from '../../services/smsService';
import { mapService } from '../../services/mapService';

interface SystemSettingsProps {
    settings: SystemSettings;
    setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}

const SystemSettingsView: React.FC<SystemSettingsProps> = ({ settings, setSettings }) => {
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [testSmsNumber, setTestSmsNumber] = useState(settings.adminPhoneNumber || '');
    const [sendingTestSms, setSendingTestSms] = useState(false);
    const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
    
    // Map Key State
    const [newMapKey, setNewMapKey] = useState('');
    const [testingKey, setTestingKey] = useState(false);

    const saveSettings = async () => {
        setIsSavingSettings(true);
        try {
            await db.settings.save(settings);
            alert('Settings saved!');
        } catch (e: any) { alert(`Error: ${e.message}`); } 
        finally { setIsSavingSettings(false); }
    };

    const handleTestSms = async () => {
        if (!testSmsNumber) return alert('Enter phone number');
        setSendingTestSms(true);
        try {
            const success = await smsService.sendSms(testSmsNumber, "Test Message from Orbitrip", 'ADMIN_NOTIFY');
            alert(success ? "SMS Sent!" : "SMS Failed. Check Logs.");
        } catch (e) { alert("Error sending SMS"); } 
        finally { setSendingTestSms(false); }
    };
    
    const handleDownloadBackup = async () => {
        setIsGeneratingBackup(true);
        try {
            const sqlDump = await db.backup.generateDump();
            const blob = new Blob([sqlDump], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orbitrip_backup_${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            alert('Backup failed: ' + e.message);
        } finally {
            setIsGeneratingBackup(false);
        }
    };

    const handleAddMapKey = async () => {
        if (!newMapKey.trim()) return;
        setTestingKey(true);
        
        // Validate before adding
        const isValid = await mapService.testKey(newMapKey.trim());
        setTestingKey(false);

        if (isValid) {
            const currentKeys = settings.googleMapsApiKeys || [];
            if (!currentKeys.includes(newMapKey.trim())) {
                setSettings(prev => ({ ...prev, googleMapsApiKeys: [...currentKeys, newMapKey.trim()] }));
                setNewMapKey('');
                alert("Key verified and added!");
            } else {
                alert("Key already exists.");
            }
        } else {
            if (confirm("Key verification failed. Add anyway? (Maybe Quota exceeded or IP restricted)")) {
                const currentKeys = settings.googleMapsApiKeys || [];
                setSettings(prev => ({ ...prev, googleMapsApiKeys: [...currentKeys, newMapKey.trim()] }));
                setNewMapKey('');
            }
        }
    };

    const removeMapKey = (index: number) => {
        const newKeys = [...(settings.googleMapsApiKeys || [])];
        newKeys.splice(index, 1);
        setSettings(prev => ({ ...prev, googleMapsApiKeys: newKeys }));
    };

    const handleNumberSetting = (field: keyof SystemSettings, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) setSettings(prev => ({ ...prev, [field]: num }));
    };

    const handleStringSetting = (field: keyof SystemSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleBooleanSetting = (field: keyof SystemSettings, value: boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
                {/* General & Finance */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Core Settings</h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Commission Rate (e.g. 0.13)</label>
                        <input type="number" step="0.01" value={settings.commissionRate} onChange={e => handleNumberSetting('commissionRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                    </div>
                    
                    <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Trip Price (GEL)</label>
                            <input type="number" value={settings.minTripPrice} onChange={e => handleNumberSetting('minTripPrice', e.target.value)} className="w-full border p-3 rounded-xl" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
                            <input type="number" value={settings.taxRate} onChange={e => handleNumberSetting('taxRate', e.target.value)} className="w-full border p-3 rounded-xl" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency Symbol</label>
                            <input type="text" value={settings.currencySymbol} onChange={e => handleStringSetting('currencySymbol', e.target.value)} className="w-full border p-3 rounded-xl" />
                        </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Phone (Notifications)</label>
                        <input type="text" value={settings.adminPhoneNumber} onChange={e => handleStringSetting('adminPhoneNumber', e.target.value)} className="w-full border p-3 rounded-xl" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SMS API Key</label>
                        <input type="password" value={settings.smsApiKey} onChange={e => handleStringSetting('smsApiKey', e.target.value)} className="w-full border p-3 rounded-xl" />
                    </div>
                    
                    {/* Booking Rules */}
                    <div className="border-t pt-4 space-y-4">
                        <h4 className="font-bold text-sm text-gray-800">Booking Rules</h4>
                        <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Booking Window (Days)</label>
                                <input type="number" value={settings.bookingWindowDays} onChange={e => handleNumberSetting('bookingWindowDays', e.target.value)} className="w-full border p-3 rounded-xl" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">Instant Booking (No Approval)</span>
                                <button onClick={() => handleBooleanSetting('instantBookingEnabled', !settings.instantBookingEnabled)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.instantBookingEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.instantBookingEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="border-t pt-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">Maintenance Mode</h4>
                            <p className="text-xs text-gray-500">Stop new bookings</p>
                        </div>
                        <button 
                            onClick={() => handleBooleanSetting('maintenanceMode', !settings.maintenanceMode)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
                
                {/* Operations & Content */}
                <div className="space-y-6">
                    
                    {/* Google Maps Config */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Google Maps API (Distance)</h3>
                        
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Manage API Keys (Rotated)</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 border p-2 rounded-lg text-sm" 
                                    placeholder="Enter Google Maps API Key" 
                                    value={newMapKey}
                                    onChange={e => setNewMapKey(e.target.value)}
                                />
                                <button 
                                    onClick={handleAddMapKey} 
                                    disabled={testingKey}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                >
                                    {testingKey ? 'Checking...' : 'Add'}
                                </button>
                            </div>
                            
                            {/* Key List */}
                            <div className="space-y-2 mt-2">
                                {settings.googleMapsApiKeys?.map((key, i) => (
                                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-xs">
                                        <span className="font-mono text-gray-600 truncate w-40">...{key.slice(-8)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-bold">Valid</span>
                                            <button onClick={() => removeMapKey(i)} className="text-red-500 font-bold hover:underline">Remove</button>
                                        </div>
                                    </div>
                                ))}
                                {(!settings.googleMapsApiKeys || settings.googleMapsApiKeys.length === 0) && (
                                    <p className="text-xs text-amber-600 italic">No keys added. Using offline distance calculation (Haversine).</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Branding & Social</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">SEO Title</label>
                                <input value={settings.siteTitle || ''} onChange={e => handleStringSetting('siteTitle', e.target.value)} className="w-full border p-3 rounded-xl text-sm" placeholder="OrbiTrip Georgia" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Facebook</label><input value={settings.socialFacebook || ''} onChange={e => handleStringSetting('socialFacebook', e.target.value)} className="w-full border p-2 rounded-lg text-xs" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Instagram</label><input value={settings.socialInstagram || ''} onChange={e => handleStringSetting('socialInstagram', e.target.value)} className="w-full border p-2 rounded-lg text-xs" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Global Alert Banner (Optional)</label>
                                <input value={settings.globalAlertMessage || ''} onChange={e => handleStringSetting('globalAlertMessage', e.target.value)} className="w-full border p-3 rounded-xl text-sm border-red-200 bg-red-50 text-red-800" placeholder="e.g. Discounts due to holiday!" />
                            </div>
                    </div>
                    
                    {/* Driver Policy */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Driver Policy</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">Auto-Approve Drivers</span>
                                <button onClick={() => handleBooleanSetting('autoApproveDrivers', !settings.autoApproveDrivers)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.autoApproveDrivers ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.autoApproveDrivers ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">Require Documents Upload</span>
                                <button onClick={() => handleBooleanSetting('requireDocuments', !settings.requireDocuments)} className={`w-10 h-5 rounded-full p-1 transition-colors ${settings.requireDocuments ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${settings.requireDocuments ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                    </div>
                </div>
            </div>
            
            {/* Driver Guidelines (Full Width) */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Driver Guidelines Content</h3>
                <p className="text-xs text-slate-500 mb-2">This content appears in the Driver Dashboard "Guide" tab. Supports basic HTML.</p>
                <textarea 
                    rows={10}
                    value={settings.driverGuidelines || ''} 
                    onChange={e => handleStringSetting('driverGuidelines', e.target.value)} 
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] text-sm font-bold uppercase tracking-tight"
                    placeholder="<h1>Welcome Partner</h1><p>Rules...</p>"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 pb-12">
                <button onClick={handleTestSms} disabled={sendingTestSms} className="text-indigo-600 font-bold text-sm hover:underline">{sendingTestSms ? 'Sending...' : 'Test SMS'}</button>
                <button onClick={handleDownloadBackup} disabled={isGeneratingBackup} className="text-[var(--primary)] font-black text-xs uppercase tracking-widest hover:underline">{isGeneratingBackup ? 'Downloading...' : 'Download DB Backup'}</button>
                <button onClick={saveSettings} disabled={isSavingSettings} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-[var(--primary)] transition-all flex items-center transform hover:-translate-y-1">
                    {isSavingSettings && <span className="animate-spin mr-2">⟳</span>}
                    {isSavingSettings ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>
        </div>
    );
};

export default SystemSettingsView;