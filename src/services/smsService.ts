
import { db } from './db';

// SMS Service for OrbiTrip using smsoffice.ge API V2
const SENDER_NAME = 'localltrip'; 
const HARDCODED_ADMIN_PHONE = '995593456876'; 

export const smsService = {
    cleanPhoneNumber: (phone: string): string => {
        if (!phone) return '';
        let clean = phone.replace(/\D/g, ''); 
        if (clean.length === 9 && clean.startsWith('5')) {
            return '995' + clean;
        }
        if (clean.length === 10 && clean.startsWith('05')) {
            return '995' + clean.substring(1);
        }
        if (clean.length === 12 && clean.startsWith('995')) {
            return clean;
        }
        return clean;
    },

    sendDriverNotification: async (driverPhone: string, bookingDetails: { id: string, tourTitle: string, date: string, price: string }): Promise<boolean> => {
        if (!driverPhone) return false;
        const destination = smsService.cleanPhoneNumber(driverPhone);
        const shortId = bookingDetails.id.slice(-6).toUpperCase();
        const text = `OrbiTrip: Axali Shekveta #${shortId}!\nTuri: ${bookingDetails.tourTitle.substring(0, 20)}\nTarigi: ${bookingDetails.date}\nFasi: ${bookingDetails.price}\nSheamowmet kabineti.`;
        return smsService.sendSms(destination, text, 'DRIVER_NOTIFY');
    },

    sendDriverCancellationNotification: async (driverPhone: string, bookingDetails: { id: string, date: string }): Promise<boolean> => {
        if (!driverPhone) return false;
        const destination = smsService.cleanPhoneNumber(driverPhone);
        const shortId = bookingDetails.id.slice(-6).toUpperCase();
        const text = `OrbiTrip: Javshani #${shortId} (${bookingDetails.date}) gaukmeda an gadaeca sxva mzgols.`;
        return smsService.sendSms(destination, text, 'DRIVER_NOTIFY');
    },

    sendAdminNotification: async (bookingDetails: { id?: string, tourTitle: string, date: string, price: string, customerName: string, contact: string, driverName: string }): Promise<boolean> => {
        let adminPhone = HARDCODED_ADMIN_PHONE;
        try {
            const settings = await db.settings.get();
            if (settings.adminPhoneNumber && settings.adminPhoneNumber.length > 5) {
                adminPhone = settings.adminPhoneNumber;
            }
        } catch (e) {
            console.warn('[SMS] Using hardcoded admin phone.');
        }

        const destination = smsService.cleanPhoneNumber(adminPhone);
        const shortId = bookingDetails.id ? bookingDetails.id.slice(-6).toUpperCase() : 'NEW';
        const text = `[ADMIN] Javshani #${shortId}!\nKlienti: ${bookingDetails.customerName}\nTel: ${bookingDetails.contact}\nMzgoli: ${bookingDetails.driverName}\nTuri: ${bookingDetails.tourTitle.substring(0, 15)}\nFasi: ${bookingDetails.price}`;
        return smsService.sendSms(destination, text, 'ADMIN_NOTIFY');
    },

    sendSms: async (destination: string, text: string, type: 'ADMIN_NOTIFY' | 'DRIVER_NOTIFY'): Promise<boolean> => {
        let apiKey = '';
        try {
            const settings = await db.settings.get();
            if (settings.smsEnabled === false) return false;
            if (settings.smsApiKey && settings.smsApiKey.length > 5) {
                apiKey = settings.smsApiKey;
            }
        } catch (e) {}

        if (!apiKey) {
            console.warn("[SMS] No API Key.");
            return false;
        }

        const encodedContent = encodeURIComponent(text);
        const url = `https://smsoffice.ge/api/v2/send/?key=${apiKey}&destination=${destination}&sender=${SENDER_NAME}&content=${encodedContent}&urgent=true`;
        const logId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        try {
            await db.smsLogs.log({ id: logId, recipient: destination, content: text, status: 'TRYING', timestamp: Date.now(), type });
            await fetch(url, { method: 'GET', mode: 'no-cors' });
            await db.smsLogs.log({ id: logId, recipient: destination, content: text, status: 'SENT', timestamp: Date.now(), type });
            return true;
        } catch (error: any) {
            console.error('[SMS] Fail:', error);
            await db.smsLogs.log({ id: logId, recipient: destination, content: `Error: ${error.message}`, status: 'FAILED', timestamp: Date.now(), type });
            return false;
        }
    }
};
