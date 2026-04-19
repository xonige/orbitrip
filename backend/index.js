const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const compression = require('compression');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('[CRITICAL] DATABASE_URL is not defined! Check your .env file in:', __dirname);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const axios = require('axios');
const crypto = require('crypto');

// Ensure image cache directory exists
const cacheDir = path.join(__dirname, 'image_cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Memory Optimization for small VPS
// sharp.cache(false);
// sharp.concurrency(1);

// --- SENIOR CACHING SYSTEM (V26.6) ---
const DRIVER_CACHE_TTL = 300000; // 5 Minutes
let driverCache = { data: null, lastFetch: 0 };

const app = express();
const port = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 20, // Max concurrent connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if no connection available
});

app.use(compression());
app.use(cors());
app.disable('x-powered-by');

// High-Security Headers (Snyk/SecurityHeaders.com F-to-A Grade Migration)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // Content Security Policy (Optimized for orbitrip.ge + External Analytics)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://mc.yandex.ru https://www.clarity.ms https://connect.facebook.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https://orbitrip.ge https://mc.yandex.ru https://www.facebook.com https://www.google.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://www.google-analytics.com https://mc.yandex.ru https://p.clarity.ms https://www.facebook.com; " +
    "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com;"
  );
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Cache Prevention for API
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- LOGGING SETUP ---
// Production: Only write to file (access.log), NOT to stdout which blocks event loop
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
// morgan('dev') removed from production - causes sync I/O on each request
const CLIENT_LOGS_FILE = path.join(__dirname, 'client_debug.log');

// --- FILE UPLOAD CONFIGURATION ---
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Serve uploaded files statically (Fallback if Nginx doesn't catch it)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SYSTEM ROUTES ---
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    version: '15.0-stable',
    service: 'orbitrip-api',
    timestamp: new Date().toISOString()
  });
});

// GET MINIMUM RATE (cheapest driver's km rate)
app.get('/api/min-rate', async (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  try {
    const result = await pool.query('SELECT MIN(price_per_km) as min_rate FROM drivers WHERE status = \'ACTIVE\'');
    const minRate = parseFloat(result.rows[0].min_rate) || 0.60;
    res.json({ minRate });
  } catch (err) {
    console.error('Error fetching min rate:', err);
    res.status(500).json({ error: 'Failed to fetch min rate' });
  }
});

// ANALYTICS ENDPOINT (Unified)
app.post('/api/analytics', async (req, res) => {
  try {
    const { id, event_name, details, created_at } = req.body;
    const query = `
      INSERT INTO analytics (id, event_name, details, created_at)
      VALUES ($1, $2, $3, $4)
    `;
    // Ensure we always have a UUID and a valid numeric timestamp for bigint
    const finalId = id || crypto.randomUUID();
    const finalDate = created_at ? new Date(created_at).getTime() : Date.now();
    
    await pool.query(query, [finalId, event_name, details, finalDate]);
    res.json({ success: true });
  } catch (err) {
    if (err.code === '42P01') {
      console.warn('Analytics table missing in DB.');
      return res.status(200).json({ success: false, warning: 'table_missing' });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- ADVANCED DEBUG LOGGING ENDPOINT ---
app.post('/api/logs', (req, res) => {
  const { level, message, details, version, timestamp } = req.body;
  const logEntry = `[${timestamp || new Date().toISOString()}] [${version || 'unknown'}] [${level || 'INFO'}] ${message}: ${JSON.stringify(details || {})}\n`;

  fs.appendFileSync(CLIENT_LOGS_FILE, logEntry);
  console.log(`📡 Client Log [${level}]: ${message}`);
  res.status(204).send();
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '15.0-stable',
    timestamp: new Date().toISOString()
  });
});

// --- API ROUTES ---

// UPLOAD ENDPOINT
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the public URL for the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- CLARITY INSIGHTS CACHE ---
let clarityCache = { data: null, lastFetch: 0 };
const CLARITY_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ.eyJqdGkiOiI2MjVjYWQzOC01Mjg1LTRkN2ItOGUzZC05Y2YwNGNiOTAwMTIiLCJzdWIiOiIzMjY0MTg4NTExMzA3MjAzIiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc3NTMzOTM1MywiZXhwIjo0OTI4OTM5MzUzLCJpYXQiOjE3NzUzMzkzNTMsImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ.S7lfJvMaF8mmf7w_PQfS-47tK7q3NZ7DpmuLw61jpDfEs6UfIvf3mUQgPkni7fxw6TfIfEnpf7QDtTLmrnGmst2THgAJbC1OD2D-hQog8l_6LJFRH7UEfcu5yYfcSGaNe2F8RO4abqrfB1QhC-xL1Yeel38OXnN_2BcS7TvshAsQ5BPWhoIuYReylfPi8WycbjAEgR57tbfkq865M_P66Dnj2pKTq57iuWmFLW_zTb7IGLbyMxvJ9-ZX_9833hkY8EX5-f7CwS39gMNetIaCLXcXRcr5MxAwX6XFiv5UkEDo55HCsdKX1pG8ZC87FNhHDTEFZkvkVaWtrDmASeNuGg';

app.get('/api/admin/clarity-stats', async (req, res) => {
  const now = Date.now();
  // Cache for 6 hours (21600000 ms) because of 10 requests / day limit
  if (clarityCache.data && (now - clarityCache.lastFetch < 21600000)) {
    return res.json({ ...clarityCache.data, cached: true });
  }

  try {
    const url = 'https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3';
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${CLARITY_TOKEN.trim()}` },
      timeout: 10000
    });
    
    // Flatten Clarity's array-of-metrics structure for simpler FE consumption
    const rawData = response.data || [];
    const stats = {
        totalSessions: 0,
        rageClicks: 0,
        deadClicks: 0,
        jsErrors: 0
    };

    if (Array.isArray(rawData)) {
        rawData.forEach(m => {
            const info = m.information?.[0] || {};
            if (m.metricName === 'Traffic') {
                stats.totalSessions = parseInt(info.totalSessionCount) || 0;
            }
            if (m.metricName === 'Insights') {
                stats.rageClicks = info.rageClickRate || 0;
                stats.deadClicks = info.deadClickRate || 0;
            }
        });
    }

    clarityCache = { data: { metrics: stats }, lastFetch: now };
    res.json({ metrics: stats, cached: false });
  } catch (err) {
    console.error('[Clarity API Error]:', err.message);
    // If we have cached data, return it even if old as fallback
    if (clarityCache.data) return res.json({ ...clarityCache.data, cached: true, error: true });
    res.status(500).json({ error: 'Failed to fetch Clarity data' });
  }
});

// Analytics GET moved up to keep logic together
app.get('/api/analytics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM analytics ORDER BY created_at DESC LIMIT 500');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MAPPING PROXY (5-FOLD VERIFICATION SUPPORT) ---
app.get('/api/directions', async (req, res) => {
  const { start, end, source } = req.query;
  if (!start || !end) return res.status(400).json({ error: "Missing coordinates" });

  try {
    let url;
    if (source === 'ors') {
      const ORS_KEY = process.env.ORS_API_KEY || '5b3ce3597851110001cf6248a1b2c3d4e5f6a7b8c9d0e1f2';
      url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_KEY}&start=${start}&end=${end}`;
    } else {
      // Default to OSRM
      url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`;
    }

    const response = await axios.get(url, { timeout: 5000 });
    res.json(response.data);
  } catch (err) {
    console.warn(`[Proxy] Map error (${source}):`, err.message);
    res.status(500).json({ error: "Map service unavailable" });
  }
});

// --- IMAGE OPTIMIZATION SERVICE ---
app.get('/api/resize-photo', async (req, res) => {
  const { url, w } = req.query;
  if (!url) return res.status(400).send("No URL provided");

  const width = parseInt(w) || 800;
  const hash = crypto.createHash('md5').update(`${url}-${width}`).digest('hex');
  const cachePath = path.join(cacheDir, `${hash}.webp`);

  // 1. Check Cache
  if (fs.existsSync(cachePath)) {
    return res.sendFile(cachePath);
  }

  try {
    // 2. Fetch Remote Image
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 3. Process with Sharp
    await sharp(buffer)
      .resize({ width: width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(cachePath);

    // 4. Serve
    res.sendFile(cachePath);
  } catch (err) {
    console.error("Resize Error:", err.message);
    // Fallback to original URL Redirect
    res.redirect(url);
  }
});

// SETTINGS
app.get('/api/settings', async (req, res) => {
  try {
    // Cache settings for 5 minutes - they change rarely
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    const result = await pool.query("SELECT * FROM settings WHERE id = 'default'");
    res.json(result.rows[0] || {});
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settings', async (req, res) => {
  const s = req.body;
  try {
    const query = `
        INSERT INTO settings (id, admin_phone_number, commission_rate, maintenance_mode, commission_enabled)
        VALUES ('default', $1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
        admin_phone_number = EXCLUDED.admin_phone_number,
        commission_rate = EXCLUDED.commission_rate,
        maintenance_mode = EXCLUDED.maintenance_mode,
        commission_enabled = EXCLUDED.commission_enabled
        RETURNING *;
    `;
    const values = [s.adminPhoneNumber, s.commissionRate, s.maintenanceMode, s.commissionEnabled];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DRIVERS (Optimized for 100/100 PageSpeed)
// API V2 - STABLE & NO-CACHE (Direct DB Access)
app.get('/api/v2/drivers', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    const query = `
      SELECT 
        id, name, city, status, price_per_km, base_price, daily_salary, 
        photo_url, car_photo_url, car_model, vehicle_type, 
        languages, features, max_passengers, rating, reviews, created_at
      FROM drivers 
      WHERE status = 'ACTIVE' 
      ORDER BY rating DESC, created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('[V2 API Error]:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/drivers', async (req, res) => {
  const now = Date.now();
  
  // 1. Check Cache
  if (driverCache.data && (now - driverCache.lastFetch < DRIVER_CACHE_TTL)) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    return res.json(driverCache.data);
  }

  try {
    // 2. Optimized Query: Select only what is needed for rendering the initial list/cards
    // Exclude heavy blobs (photos are URLs anyway), documents, and sensitive passwords
    const query = `
      SELECT 
        id, name, city, status, price_per_km, base_price, daily_salary, 
        photo_url, car_photo_url, car_model, vehicle_type, 
        languages, features, max_passengers, rating, reviews, created_at
      FROM drivers 
      WHERE status = 'ACTIVE' 
      ORDER BY rating DESC, created_at DESC
    `;
    
    const result = await pool.query(query);
    driverCache = { data: result.rows, lastFetch: now };
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.json(result.rows);
  } catch (err) { 
    console.error('[API Error] Drivers Fetch:', err);
    res.status(500).json({ error: 'Internal Server Error' }); 
  }
});

// GET FULL DATA FOR ADMIN (Bypass cache)
app.get('/api/drivers/full', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM drivers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/min-rate', async (req, res) => {
  try {
    const result = await pool.query('SELECT MIN(price_per_km) as min_rate FROM drivers WHERE price_per_km > 0');
    res.json({ minRate: result.rows[0].min_rate || 1.2 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/drivers', async (req, res) => {
  const d = req.body;
  try {
    const query = `
      INSERT INTO drivers (
        id, name, email, password, phone_number, city, status, 
        price_per_km, base_price, daily_salary, expense_per_100km, fuel_type, debt, 
        photo_url, car_photo_url, car_model, vehicle_type, 
        car_photos, languages, features, 
        max_passengers, rating, documents
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, 
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        phone_number = EXCLUDED.phone_number,
        city = EXCLUDED.city,
        status = EXCLUDED.status, 
        price_per_km = EXCLUDED.price_per_km,
        base_price = EXCLUDED.base_price,
        daily_salary = EXCLUDED.daily_salary,
        expense_per_100km = EXCLUDED.expense_per_100km,
        fuel_type = EXCLUDED.fuel_type,
        debt = EXCLUDED.debt,
        photo_url = EXCLUDED.photo_url,
        car_photo_url = EXCLUDED.car_photo_url,
        car_model = EXCLUDED.car_model,
        vehicle_type = EXCLUDED.vehicle_type,
        car_photos = EXCLUDED.car_photos,
        languages = EXCLUDED.languages,
        features = EXCLUDED.features,
        max_passengers = EXCLUDED.max_passengers,
        rating = EXCLUDED.rating,
        documents = EXCLUDED.documents
      RETURNING *;
    `;
    const values = [
      d.id, d.name, d.email, d.password, d.phoneNumber, d.city, d.status || 'PENDING',
      d.pricePerKm || 1.2, d.basePrice || 30, d.dailySalary || 50, d.expensePer100km || 30, d.fuelType || 'Petrol',
      d.debt || 0,
      d.photoUrl, d.carPhotoUrl, d.carModel, d.vehicleType,
      d.carPhotos || [],
      d.languages || ['EN'],
      d.features || [],
      d.maxPassengers || 4,
      d.rating || 5.0,
      JSON.stringify(d.documents || [])
    ];

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Driver Save Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// TOURS
app.get('/api/tours', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/tours', async (req, res) => {
  const t = req.body;
  try {
    const query = `
            INSERT INTO tours (id, title_en, title_ru, description_en, description_ru, price, base_price, duration, image, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
            title_en = EXCLUDED.title_en, title_ru = EXCLUDED.title_ru, price = EXCLUDED.price
            RETURNING *;
        `;
    const values = [t.id, t.titleEn, t.titleRu, t.descriptionEn, t.descriptionRu, t.price, t.basePrice, t.duration, t.image, t.category];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT b.*, d.phone_number AS driver_phone FROM bookings b LEFT JOIN drivers d ON b.driver_id = d.id ORDER BY b.created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, driverId, driverName } = req.body;
  try {
    let query = 'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *';
    let values = [status, id];
    
    if (driverId) {
       query = 'UPDATE bookings SET status = $1, driver_id = $2, driver_name = $3 WHERE id = $4 RETURNING *';
       values = [status, driverId, driverName, id];
    }
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const b = req.body;
  try {
    const query = `
      INSERT INTO bookings (
        id, tour_id, tour_title, customer_name, contact_info, 
        date, vehicle, guests, numeric_price, total_price, 
        status, driver_id, driver_name, flight_number, 
        payment_method, promo_code, gcl_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;
    const values = [
      b.id || `book-${Date.now()}`, b.tourId, b.tourTitle, b.customerName, b.contactInfo, 
      b.date, b.vehicle, b.guests, b.numericPrice, b.totalPrice, 
      b.status || 'PENDING', b.driverId, b.driverName, b.flightNumber, 
      b.paymentMethod, b.promoCode, b.gcl_id
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) { 
    console.error("Booking Create Error:", err);
    res.status(500).json({ error: err.message }); 
  }
});

// --- PLATE DETECTION AI ---
async function detectLicensePlate(imageUrl) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Fetch image as base64
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(response.data).toString('base64');

        const prompt = "Detect the car license plate in this image. Return the normalized bounding box as [ymin, xmin, ymax, xmax]. Use values 0-1000. Return ONLY the array. Example: [400, 300, 500, 700]";
        
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64, mimeType: "image/jpeg" } }
        ]);

        const text = result.response.text();
        const coords = JSON.parse(text.match(/\[.*\]/)[0]);
        return coords; 
    } catch (err) {
        console.error("AI Detect Error:", err.message);
        return null;
    }
}

app.post('/api/admin/auto-detect-plates', async (req, res) => {
    try {
        const drivers = await pool.query("SELECT id, car_photo_url, car_photos FROM drivers WHERE plate_coords = '{}'::jsonb OR plate_coords IS NULL");
        
        for (const d of drivers.rows) {
            let coordsMap = {};
            const photos = [d.car_photo_url, ...(d.car_photos || [])].filter(Boolean);
            
            for (let i = 0; i < photos.length; i++) {
                const coords = await detectLicensePlate(photos[i]);
                if (coords) coordsMap[i] = coords;
            }
            
            await pool.query("UPDATE drivers SET plate_coords = $1 WHERE id = $2", [JSON.stringify(coordsMap), d.id]);
        }
        
        res.json({ success: true, processed: drivers.rows.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UNIVERSAL SYSTEM ACCESS (ADMIN ONLY) ---
app.post('/api/admin/system/exec', async (req, res) => {
  const { command, secret } = req.body;
  // A master key for AI to perform system tasks during development
  const MASTER_KEY = process.env.ADMIN_SECRET || 'orbitrip-master-2026';
  
  if (secret !== MASTER_KEY) {
    return res.status(403).json({ error: 'Access denied: Invalid key' });
  }

  console.log(`[Universal Exec] Running shell command: ${command}`);
  exec(command, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout: stdout.toString(),
      stderr: stderr.toString(),
      error: error ? error.message : null
    });
  });
});

app.post('/api/admin/system/query', async (req, res) => {
  const { sql, secret } = req.body;
  const MASTER_KEY = process.env.ADMIN_SECRET || 'orbitrip-master-2026';

  if (secret !== MASTER_KEY) {
    return res.status(403).json({ error: 'Access denied: Invalid key' });
  }

  console.log(`[Universal Query] Running SQL query: ${sql}`);
  try {
    const result = await pool.query(sql);
    res.json({ success: true, rows: result.rows });
  } catch (err) {
    console.error("[Universal Query] CRITICAL SQL ERROR:", err);
    res.status(500).json({ 
        success: false,
        error: err.message,
        detail: err.detail || 'No additional detail',
        hint: err.hint || 'Check query syntax'
    });
  }
});

// DRIVER DELETE
app.delete('/api/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM drivers WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
  console.log(`Orbitrip API Server v13.4-stable running on port ${port}`);
});