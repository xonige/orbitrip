
import React from 'react';
import { Booking, Driver } from '../../types';
import { db } from '../../services/db';

interface BookingsTableProps {
    bookings: Booking[];
    drivers: Driver[];
    onUpdateBookingStatus: (id: string, status: any) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, drivers, onUpdateBookingStatus }) => {
    
    const handleAssignDriver = async (bookingId: string, driverId: string) => {
        if (!driverId) return;
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            await db.bookings.assignDriver(bookingId, driver);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-4">ID / Route</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Driver</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-bold">#{b.id.slice(-4)}</div>
                                <div className="text-xs text-gray-500">{b.tourTitle}</div>
                                <div className="text-xs text-gray-400">{b.date}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-bold">{b.customerName}</div>
                                <div className="text-xs text-gray-500">{b.contactInfo}</div>
                            </td>
                            <td className="px-6 py-4">
                                {b.driverName ? b.driverName : (
                                    <select className="border rounded text-xs p-1" onChange={(e) => handleAssignDriver(b.id, e.target.value)}>
                                        <option value="">Assign Driver...</option>
                                        {drivers.filter(d => d.status === 'ACTIVE').map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : b.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold">{b.totalPrice}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onUpdateBookingStatus(b.id, 'CANCELLED')} className="text-red-500 hover:underline text-xs font-bold">Cancel</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookingsTable;
