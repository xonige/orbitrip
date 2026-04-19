import { GoogleGenerativeAI } from "@google/generative-ai";

// User provided API Key
const API_KEY = "AIzaSyBUtJSaZyp0NCx70fAKXDJlZruHZPpe4aw";
const genAI = new GoogleGenerativeAI(API_KEY);

// Unsplash Access Key (from Skytrip)
const UNSPLASH_ACCESS_KEY = 'n7UdKuqc3wBNViwDxDrOzihMsni-0rUorws8CihpaAQ';

export const generateItineraryJSON = async (promptContext: string, dateString: string, weatherContext: string) => {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `
        Role: Elite Travel Curator for OrbiTrip Georgia.
        Task: Create a 1-Day "HIDDEN GEM" itinerary. Output ONLY valid JSON.
        
        THEME: "${promptContext}"
        CONTEXT: Date: ${dateString}. Weather: ${weatherContext}.

        🚨 STRICT PROHIBITED: Martvili Canyon, Okatse, Prometheus Cave, Sataplia.

        ✅ PREFERRED: Lechkhumi, Tkibuli, Chiatura, Vani, Sairme, Kakheti, Kazbegi, Svaneti.

        LOGISTICS:
        - Start: Pickup. End: Return.
        - Exactly ONE authentic lunch.
        - Duration: 6-10 hours.

        💰 PRICING:
        - Base Price ~300-400 GEL total.
        - price field = USD (divide total GEL by 2.7), integer.

        Required JSON Schema:
        {
            "title_en": "string",
            "title_ru": "string",
            "category": "Nature|Culinary|Culture|Adventure|Urban",
            "description_en": "string",
            "description_ru": "string",
            "price": number,
            "duration_days": 1,
            "itinerary": [
                {
                    "stop_name_en": "string",
                    "stop_name_ru": "string",
                    "activity_type": "travel|sight|food|chill|hike|urbex",
                    "activity_description": "string",
                    "stay_duration": "string",
                    "start_time": "string",
                    "review_highlight": "string"
                }
            ],
            "image_search_query": "string",
            "included_en": ["string"],
            "included_ru": ["string"]
        }
    `;

    // Retry logic for rate limits (429)
    const MAX_RETRIES = 3;
    let lastError: any;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                const waitMs = Math.pow(2, attempt) * 15000; // 30s, 60s
                console.log(`⏳ Rate limited. Waiting ${waitMs/1000}s before retry ${attempt + 1}...`);
                await new Promise(r => setTimeout(r, waitMs));
            }
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return JSON.parse(text);
        } catch (err: any) {
            lastError = err;
            const msg = (err.message || '').toLowerCase();
            if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
                console.warn(`⚠️ Rate limit hit (attempt ${attempt + 1}/${MAX_RETRIES})`);
                continue;
            }
            throw err; // Non-rate-limit error, throw immediately
        }
    }
    throw lastError;
};

// --- PHOTO ENGINE ---
export const smartPhotoSearch = async (query: string, _type: string = 'sight'): Promise<{ url: string }> => {
    try {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + " Georgia")}&per_page=1&orientation=landscape`, {
            headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.results?.[0]) return { url: data.results[0].urls.regular };
        }
    } catch (e) {
        console.warn("Unsplash search failed:", e);
    }
    return { url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&q=80' };
};
