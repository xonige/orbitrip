
import React from 'react';
import { Tour } from '../../types';
import { storageService } from '../../services/storage';
import { X } from 'lucide-react';

interface TourEditModalProps {
    editingTour: Partial<Tour>;
    setEditingTour: React.Dispatch<React.SetStateAction<Partial<Tour>>>;
    isUploadingTour: boolean;
    setIsUploadingTour: React.Dispatch<React.SetStateAction<boolean>>;
    onSave: (e: React.FormEvent) => void;
    onClose: () => void;
    handleArrayInput: (field: keyof Tour, value: string) => void;
}

const TourEditModal: React.FC<TourEditModalProps> = ({
    editingTour,
    setEditingTour,
    isUploadingTour,
    setIsUploadingTour,
    onSave,
    onClose,
    handleArrayInput
}) => {

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

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4  animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase italic leading-none">
                        {editingTour.id?.startsWith('tour-author-') ? 'Create New Tour' : 'Edit My Tour'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={onSave} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tour Title (English)</label>
                            <input className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none font-bold text-slate-900 transition-all" value={editingTour.titleEn || ''} onChange={e => setEditingTour({...editingTour, titleEn: e.target.value})} placeholder="e.g. My Secret Wine Tour" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tour Title (Russian)</label>
                            <input className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none font-bold text-slate-900 transition-all" value={editingTour.titleRu || ''} onChange={e => setEditingTour({...editingTour, titleRu: e.target.value})} placeholder="напр. Мой Винный Тур" required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description (English)</label>
                        <textarea className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none h-28 resize-none font-medium text-slate-700 transition-all" value={editingTour.descriptionEn || ''} onChange={e => setEditingTour({...editingTour, descriptionEn: e.target.value})} placeholder="Describe the experience..." required />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Description (Russian)</label>
                        <textarea className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none h-28 resize-none font-medium text-slate-700 transition-all" value={editingTour.descriptionRu || ''} onChange={e => setEditingTour({...editingTour, descriptionRu: e.target.value})} placeholder="Опишите тур..." required />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Price (GEL)</label>
                            <input className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none font-black text-xl text-slate-900 transition-all" value={editingTour.price || ''} onChange={e => setEditingTour({...editingTour, price: e.target.value})} placeholder="150" required />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Duration</label>
                            <input className="w-full border-2 border-slate-50 bg-slate-50 p-4 rounded-2xl focus:bg-white focus:border-[var(--primary)] outline-none font-bold text-slate-900 transition-all" value={editingTour.duration || ''} onChange={e => setEditingTour({...editingTour, duration: e.target.value})} placeholder="e.g. 6 Hours" required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Main Image</label>
                        <div className="flex gap-4 items-center">
                            <input type="file" accept="image/*" className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[var(--primary)]/5 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/10" onChange={handleTourImageUpload} />
                            {isUploadingTour && <span className="text-[10px] text-[var(--primary)] font-black animate-pulse uppercase tracking-widest">Uploading...</span>}
                        </div>
                        {editingTour.image && (
                            <div className="mt-2 h-32 w-full bg-gray-100 rounded-xl overflow-hidden">
                                <img src={editingTour.image} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-8 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                        <button type="submit" disabled={isUploadingTour || !editingTour.image} className="bg-[var(--primary)] text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-[var(--primary)]/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50">Save Tour</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TourEditModal;
