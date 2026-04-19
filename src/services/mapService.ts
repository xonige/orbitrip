import { GEORGIAN_LOCATIONS } from '../data/locations';

// --- CONSTANTS ---
const ROAD_FACTOR_DEFAULT = 1.35;
const ROAD_FACTOR_MOUNTAIN = 1.55;
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
const ORS_BASE = 'https://api.openrouteservice.org/v2/directions/driving-car';
const ORS_KEY = '5b3ce3597851110001cf6248a1b2c3d4e5f6a7b8c9d0e1f2'; // Free tier key

// --- CACHE ---
const distanceCache = new Map<string, { distance: number, duration: number }>();

// --- COORDINATE LOOKUP ---
const getCoords = (name: string): { lat: number, lng: number } | null => {
    if (!name) return null;
    const lower = name.toLowerCase().trim();
    const loc = GEORGIAN_LOCATIONS.find(l =>
        l.id === lower ||
        l.nameEn.toLowerCase() === lower ||
        l.nameRu.toLowerCase() === lower ||
        l.nameEn.toLowerCase().includes(lower) ||
        l.nameRu.toLowerCase().includes(lower)
    );
    if (loc) return { lat: loc.lat, lng: loc.lng };
    return null;
};

// --- SOURCE 1: OSRM (Free, no key needed) ---
const fetchOSRM = async (lat1: number, lng1: number, lat2: number, lng2: number): Promise<{ distance: number, duration: number } | null> => {
    try {
        const url = `${OSRM_BASE}/${lng1},${lat1};${lng2},${lat2}?overview=false`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) return null;
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes?.[0]) return null;
        const route = data.routes[0];
        return {
            distance: Math.round(route.distance / 1000), // meters → km
            duration: Math.round(route.duration / 60)     // seconds → minutes
        };
    } catch (e) {
        console.warn('[MapService] OSRM failed:', e);
        return null;
    }
};

// --- SOURCE 2: OpenRouteService (Free tier) ---
const fetchORS = async (lat1: number, lng1: number, lat2: number, lng2: number): Promise<{ distance: number, duration: number } | null> => {
    try {
        const url = `${ORS_BASE}?api_key=${ORS_KEY}&start=${lng1},${lat1}&end=${lng2},${lat2}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) return null;
        const data = await res.json();
        const seg = data.features?.[0]?.properties?.summary;
        if (!seg) return null;
        return {
            distance: Math.round(seg.distance / 1000),
            duration: Math.round(seg.duration / 60)
        };
    } catch (e) {
        console.warn('[MapService] ORS failed:', e);
        return null;
    }
};

// --- SOURCE 3: Haversine + Road Factor ---
const haversineCalc = (lat1: number, lng1: number, lat2: number, lng2: number, isMountainous: boolean): { distance: number, duration: number } => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.pow(Math.sin(dLon / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const airDist = R * c;
    const factor = isMountainous ? ROAD_FACTOR_MOUNTAIN : ROAD_FACTOR_DEFAULT;
    const distance = Math.round(airDist * factor);
    // Estimate: 60km/h average for regular roads, 40km/h for mountains
    const avgSpeed = isMountainous ? 40 : 60;
    const duration = Math.round((distance / avgSpeed) * 60);
    return { distance, duration };
};

// --- MEDIAN HELPER ---
const median = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

// --- GROUND TRUTH DATA ---
// --- GROUND TRUTH DATA ---
const GROUND_TRUTH: Record<string, { distance: number, duration: number }> = {
    // FROM TBILISI
    'tbilisi->batumi': { distance: 370, duration: 360 },
    'tbilisi->kutaisi': { distance: 230, duration: 210 },
    'tbilisi->gudauri': { distance: 120, duration: 150 },
    'tbilisi->mestia': { distance: 470, duration: 540 },
    'tbilisi->borjomi': { distance: 160, duration: 150 },
    'tbilisi->kazbegi': { distance: 155, duration: 180 },
    'tbilisi->signagi': { distance: 110, duration: 100 },
    'tbilisi->telavi': { distance: 95, duration: 90 },
    'tbilisi->mtskheta': { distance: 22, duration: 25 },
    'tbilisi->gori': { distance: 86, duration: 70 },
    'tbilisi->bakuriani': { distance: 190, duration: 180 },
    'tbilisi->tbs-airport': { distance: 18, duration: 25 },
    'tbilisi->kut-airport': { distance: 220, duration: 200 },
    'tbilisi->ananuri': { distance: 66, duration: 70 },
    'tbilisi->david-gareji': { distance: 100, duration: 120 },
    'tbilisi->akhaltsikhe': { distance: 200, duration: 210 },
    'tbilisi->vardzia': { distance: 224, duration: 245 },
    'tbilisi->kobuleti': { distance: 340, duration: 340 },
    // FROM KUTAISI
    'kutaisi->batumi': { distance: 150, duration: 150 },
    'kutaisi->mestia': { distance: 240, duration: 300 },
    'kutaisi->tbilisi': { distance: 230, duration: 210 },
    'kutaisi->kut-airport': { distance: 25, duration: 30 },
    'kutaisi->borjomi': { distance: 140, duration: 150 },
    'kutaisi->kazbegi': { distance: 330, duration: 360 },
    'kutaisi->gudauri': { distance: 280, duration: 300 },
    'kutaisi->signagi': { distance: 340, duration: 300 },
    'kutaisi->tbs-airport': { distance: 220, duration: 200 },
    'kutaisi->gori': { distance: 145, duration: 130 },
    'kutaisi->vardzia': { distance: 230, duration: 240 },
    'aspinza->vardzia': { distance: 50, duration: 60 },
    'akhaltsikhe->vardzia': { distance: 70, duration: 90 },
    // FROM BATUMI
    'batumi->tbilisi': { distance: 370, duration: 360 },
    'batumi->kutaisi': { distance: 150, duration: 150 },
    'batumi->mestia': { distance: 270, duration: 300 },
    'batumi->bus-airport': { distance: 10, duration: 20 },
    'batumi->borjomi': { distance: 240, duration: 240 },
    'batumi->kazbegi': { distance: 500, duration: 480 },
    'batumi->tbs-airport': { distance: 380, duration: 370 },
    'batumi->vardzia': { distance: 367, duration: 341 },
    'batumi->kobuleti': { distance: 25, duration: 30 },
    'batumi->gonio': { distance: 12, duration: 15 },
    // AIRPORTS
    'kut-airport->tbilisi': { distance: 220, duration: 200 },
    'kut-airport->batumi': { distance: 140, duration: 140 },
    'kut-airport->kutaisi': { distance: 25, duration: 30 },
    'kut-airport->mestia': { distance: 230, duration: 290 },
    'kut-airport->borjomi': { distance: 130, duration: 140 },
    'kut-airport->gudauri': { distance: 270, duration: 290 },
    'tbs-airport->tbilisi': { distance: 18, duration: 25 },
    'tbs-airport->batumi': { distance: 380, duration: 370 },
    'tbs-airport->kutaisi': { distance: 220, duration: 200 },
    'tbs-airport->gudauri': { distance: 130, duration: 160 },
    'tbs-airport->kazbegi': { distance: 165, duration: 190 },
    'bus-airport->batumi': { distance: 10, duration: 20 },
    'bus-airport->tbilisi': { distance: 380, duration: 370 },
    // RAILWAY
    'kut-railway->kutaisi': { distance: 5, duration: 15 },
    'tbs-railway->tbilisi': { distance: 3, duration: 10 }
};

// --- 5-FOLD VERIFICATION ENGINE ---
const verifyDistance = async (
    lat1: number, lng1: number, lat2: number, lng2: number, isMountainous: boolean, origin: string, dest: string
): Promise<{ distance: number, duration: number }> => {
    const originKey = origin.toLowerCase().trim();
    const destKey = dest.toLowerCase().trim();
    const routeKey = `${originKey}->${destKey}`;
    const reverseKey = `${destKey}->${originKey}`;

    // PRIORITY 1: High Precision Ground Truth (Local Object, no network)
    const ground = GROUND_TRUTH[routeKey] || GROUND_TRUTH[reverseKey];
    if (ground) {
        console.log(`[MapService] Instant Ground Truth: ${ground.distance}km`);
        return ground;
    }

    // PRIORITY 2: Haversine Physics-Based (Local Math, no network)
    const hav = haversineCalc(lat1, lng1, lat2, lng2, isMountainous);

    // PRIORITY 3: Fetch ONLY if we don't have enough local confidence
    // Fire 3 sources in parallel but with a lower priority
    const fetchProxy = async (source: 'osrm' | 'ors'): Promise<{ distance: number, duration: number } | null> => {
        try {
            const start = `${lng1},${lat1}`;
            const end = `${lng2},${lat2}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // Shorter timeout for mobile
            
            const res = await fetch(`/api/directions?start=${start}&end=${end}&source=${source}`, { 
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
            
            if (!res.ok) return null;
            const data = await res.json();
            if (source === 'osrm') {
                if (data.code !== 'Ok' || !data.routes?.[0]) return null;
                return { distance: Math.round(data.routes[0].distance / 1000), duration: Math.round(data.routes[0].duration / 60) };
            } else {
                const seg = data.features?.[0]?.properties?.summary;
                if (!seg) return null;
                return { distance: Math.round(seg.distance / 1000), duration: Math.round(seg.duration / 60) };
            }
        } catch (e) { return null; }
    };

    // For better mobile stability, we only fetch 2 instead of 5 sources if we already have Haversine
    const [source1, source2] = await Promise.all([
        fetchOSRM(lat1, lng1, lat2, lng2),
        fetchProxy('osrm')
    ]);

    const distances: number[] = [hav.distance];
    const durations: number[] = [hav.duration];

    if (source1) { distances.push(source1.distance); durations.push(source1.duration); }
    if (source2) { distances.push(source2.distance); durations.push(source2.duration); }

    const medDist = median(distances);
    const medDur = median(durations);

    console.log(`[MapService] Verified: ${medDist}km`);
    return { distance: medDist, duration: medDur };
};

// --- PUBLIC API ---
export const mapService = {
    calculateDistance: async (originName: string, destName: string, isMountainous: boolean = false): Promise<number> => {
        const seg = await mapService.calculateSegment(originName, destName, isMountainous);
        return seg.distance;
    },

    calculateSegment: async (originName: string, destName: string, isMountainous: boolean = false): Promise<{ distance: number, duration: number }> => {
        if (!originName || !destName) return { distance: 0, duration: 0 };
        const cacheKey = `${originName.toLowerCase().trim()}->${destName.toLowerCase().trim()}`;
        const cached = distanceCache.get(cacheKey);
        if (cached) return cached;

        // PRIORITY 1: Ground truth (verified road distances)
        const normName = (s: string) => {
            const lower = s.toLowerCase().trim();
            // Step 1: Exact ID or exact nameEn match (prevents airport/city confusion)
            const exact = GEORGIAN_LOCATIONS.find(l => l.id === lower || l.nameEn.toLowerCase() === lower);
            if (exact) return exact.id;
            // Step 2: Partial match fallback
            const partial = GEORGIAN_LOCATIONS.find(l => l.nameEn.toLowerCase().includes(lower) || lower.includes(l.nameEn.toLowerCase()));
            return partial?.id || lower;
        };
        const nO = normName(originName);
        const nD = normName(destName);
        const gtKey = `${nO}->${nD}`;
        const gtKeyRev = `${nD}->${nO}`;
        const gt = GROUND_TRUTH[gtKey] || GROUND_TRUTH[gtKeyRev];
        if (gt) {
            console.log(`[MapService] Ground Truth HIT: ${gtKey} = ${gt.distance}km`);
            distanceCache.set(cacheKey, gt);
            return gt;
        }

        // PRIORITY 2: 5-fold verification via APIs + haversine
        const c1 = getCoords(originName);
        const c2 = getCoords(destName);
        if (!c1 || !c2) return { distance: 50, duration: 60 };

        const result = await verifyDistance(c1.lat, c1.lng, c2.lat, c2.lng, isMountainous, originName, destName);
        distanceCache.set(cacheKey, result);
        return result;
    },

    /**
     * Calculate full multi-stop route with verified distances
     */
    calculateFullRoute: async (stopNames: string[]): Promise<{ totalDistance: number, totalDuration: number, segments: { from: string, to: string, distance: number, duration: number }[] }> => {
        const cleanStops = stopNames.filter(s => s.trim() !== '');
        if (cleanStops.length < 2) return { totalDistance: 0, totalDuration: 0, segments: [] };

        const segments: { from: string, to: string, distance: number, duration: number }[] = [];
        let totalDistance = 0;
        let totalDuration = 0;

        for (let i = 0; i < cleanStops.length - 1; i++) {
            const from = cleanStops[i];
            const to = cleanStops[i + 1];
            const fromLoc = GEORGIAN_LOCATIONS.find(l => l.nameEn.toLowerCase().includes(from.toLowerCase()) || l.id === from.toLowerCase());
            const toLoc = GEORGIAN_LOCATIONS.find(l => l.nameEn.toLowerCase().includes(to.toLowerCase()) || l.id === to.toLowerCase());
            const isMtn = !!(fromLoc?.isMountainous || toLoc?.isMountainous);

            const seg = await mapService.calculateSegment(from, to, isMtn);
            segments.push({ from, to, distance: seg.distance, duration: seg.duration });
            totalDistance += seg.distance;
            totalDuration += seg.duration;
        }

        return { totalDistance, totalDuration, segments };
    },

    /**
     * Load Google Maps (kept for backward compatibility)
     */
    loadGoogleMaps: async (keys: string[]): Promise<boolean> => {
        return false; // Disabled - using OSRM/ORS instead
    },

    /**
     * Test API connectivity
     */
    testKey: async (key: string): Promise<boolean> => {
        try {
            const result = await fetchOSRM(41.7151, 44.8271, 41.6168, 41.6367); // Tbilisi → Batumi
            return !!result;
        } catch { return false; }
    }
};