
import React, { useState } from 'react';
import { Tour } from '../../types';
import { storageService } from '../../services/storage';

interface ToursManagementProps {
    tours: Tour[];
    onAddTour: (tour: Tour) => void;
    onUpdateTour: (tour: Tour) => void;
    onDeleteTour: (id: string) => void;
}

const ToursManagement: React.FC<ToursManagementProps> = ({ tours, onAddTour, onUpdateTour, onDeleteTour }) => {
    const [isTourModalOpen, setIsTourModalOpen] = useState(false);
    const [editingTour, setEditingTour] = useState<Partial<Tour>>({});
    const [isUploadingTour, setIsUploadingTour] = useState(false);

    const openEditTour = (tour?: Tour) => {
        setIsUploadingTour(false);
        if (tour) {
            setEditingTour(JSON.parse(JSON.stringify(tour))); 
        } else {
            setEditingTour({
                id: `tour-${Date.now()}`,
                titleEn: '', titleRu: '', descriptionEn: '', descriptionRu: '',
                price: 'From 100 GEL', basePrice: 100, duration: '1 Day', category: 'CULTURE',
                image: '', highlightsEn: [], highlightsRu: [], routeStops: [],
                priceOptions: [{ vehicle: 'Sedan', price: "100 GEL", guests: "1-4" }],
                rating: 5, reviews: []
            });
        }
        setIsTourModalOpen(true);
    };

    const saveTour = (e: React.FormEvent) => {
        e.preventDefault();
        const tourToSave = editingTour as Tour;
        const exists = tours.find(t => t.id === tourToSave.id);
        exists ? onUpdateTour(tourToSave) : onAddTour(tourToSave);
        setIsTourModalOpen(false);
    };

    const handleTourImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingTour.id) return;
        setIsUploadingTour(true);
        try {
            const url = await storageService.uploadTourImage(file, editingTour.id);
            if (url) setEditingTour(prev => ({ ...prev, image: url }));
        } catch (err: any) { alert(`Upload Failed: ${err.message}`); } 
        finally { setIsUploadingTour(false); }
    };
    
    const handleArrayInput = (field: keyof Tour, value: string) => {
        setEditingTour(prev => ({
            ...prev,
            [field]: value.split(',').map(s => s.trim())
        }));
    };

    return (
        <div>
             <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Tour Packages</h2>
                <button onClick={() => openEditTour()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">+ New Tour</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map(t => (
                    <div key={t.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                        <img src={t.image} className="w-full h-40 object-cover" />
                        <div className="p-4">
                            <h4 className="font-bold text-lg">{t.titleEn}</h4>
                            <p className="text-xs text-gray-500 mb-2">{t.category}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-blue-600">{t.price}</span>
                                <div>
                                    <button onClick={() => openEditTour(t)} className="text-indigo-600 font-bold text-xs mr-3 hover:underline">Edit</button>
                                    <button onClick={() => {if(confirm('Delete?')) onDeleteTour(t.id)}} className="text-red-500 font-bold text-xs hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TOUR EDIT MODAL */}
            {isTourModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 ">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-xl font-bold mb-4">{editingTour.id?.startsWith('tour-') ? 'Edit Tour' : 'Create Tour'}</h3>
                        <form onSubmit={saveTour} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Title (EN)</label><input className="w-full border p-2 rounded" value={editingTour.titleEn || ''} onChange={e => setEditingTour({...editingTour, titleEn: e.target.value})} required /></div>
                                <div><label className="text-xs font-bold text-gray-500">Title (RU)</label><input className="w-full border p-2 rounded" value={editingTour.titleRu || ''} onChange={e => setEditingTour({...editingTour, titleRu: e.target.value})} required /></div>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">Description (EN)</label><textarea className="w-full border p-2 rounded" rows={2} value={editingTour.descriptionEn || ''} onChange={e => setEditingTour({...editingTour, descriptionEn: e.target.value})} /></div>
                            <div><label className="text-xs font-bold text-gray-500">Description (RU)</label><textarea className="w-full border p-2 rounded" rows={2} value={editingTour.descriptionRu || ''} onChange={e => setEditingTour({...editingTour, descriptionRu: e.target.value})} /></div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Price Display</label><input className="w-full border p-2 rounded" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: e.target.value})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Base Price (Numeric)</label><input type="number" className="w-full border p-2 rounded" value={editingTour.basePrice || 0} onChange={e => setEditingTour({...editingTour, basePrice: parseInt(e.target.value)})} /></div>
                                <div><label className="text-xs font-bold text-gray-500">Duration</label><input className="w-full border p-2 rounded" value={editingTour.duration || ''} onChange={e => setEditingTour({...editingTour, duration: e.target.value})} /></div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Image</label>
                                <input type="file" accept="image/*" className="mb-2 text-sm text-slate-500" onChange={handleTourImageUpload} />
                                <input className="w-full border p-2 rounded text-xs" placeholder="Or Image URL" value={editingTour.image || ''} onChange={e => setEditingTour({...editingTour, image: e.target.value})} />
                                {isUploadingTour && <span className="text-xs text-indigo-500 animate-pulse">Uploading...</span>}
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-500 block mb-1">Route Stops (Comma Separated)</label>
                                <input className="w-full border p-2 rounded text-xs" placeholder="Tbilisi, Mtskheta, Gudauri" value={editingTour.routeStops?.join(', ') || ''} onChange={e => handleArrayInput('routeStops', e.target.value)} />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsTourModalOpen(false)} className="text-gray-500 font-bold">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Save Tour</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToursManagement;
