
const BOT_TOKEN = '8603163742:AAFB6fvSGy9b5GIDZsW7hJCz20N7LFaLRjs';
const CHAT_ID = '6346489341'; // Admin Chat ID from user's idbot screenshot

export const telegramService = {
    sendBookingNotification: async (bookingData: {
        id: string;
        tourTitle: string;
        customerName: string;
        contactInfo: string;
        date: string;
        driverName?: string;
        totalPrice: string;
        vehicle?: string;
        guests?: number;
        paymentMethod?: string;
    }) => {
        try {
            const shortId = bookingData.id.slice(-6).toUpperCase();
            const message = `
🚀 *NEW BOOKING: #${shortId}*
━━━━━━━━━━━━━━━━━━━━
🗺️ *Route:* ${bookingData.tourTitle}
📅 *Date:* ${bookingData.date}
👤 *Customer:* ${bookingData.customerName}
📞 *Contact:* ${bookingData.contactInfo}
🚗 *Driver:* ${bookingData.driverName}
🚕 *Vehicle:* ${bookingData.vehicle || 'Any'}
👥 *Guests:* ${bookingData.guests || 1}
💰 *Price:* ${bookingData.totalPrice}
💳 *Payment:* ${bookingData.paymentMethod || 'Cash'}
━━━━━━━━━━━━━━━━━━━━
✅ *Check admin panel for more details.*
    `.trim();

            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`[Telegram] API Error (${response.status}):`, err);
            }
            return response.ok;
        } catch (error) {
            console.error('[Telegram] Service Error:', error);
            return false;
        }
    },
    sendCancellationNotification: async (bookingData: {
        id: string;
        customerName: string;
        tourTitle: string;
        date: string;
    }) => {
        try {
            const shortId = bookingData.id.slice(-6).toUpperCase();
            const message = `
⚠️ *Booking CANCELLED on OrbiTrip!*
━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${bookingData.date}
━━━━━━━━━━━━━━━━━━━━
⚠️ *Status changed to CANCELLED.*
    `.trim();

            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`[Telegram] Cancel API Error (${response.status}):`, err);
            }
            return response.ok;
        } catch (error) {
            console.error('[Telegram] Cancel Service Error:', error);
            return false;
        }
    }
};
