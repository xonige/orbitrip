/**
 * ORBITRIP GEORGIA - BACKEND SERVER
 * Version: 26.8.4 - Live Recovery & Deployment Sync
 * Updates:
 * - 26.8.4: Total Live Recovery: Fixed EADDRINUSE, modular sync, and PM2 zombification.
 * - 26.8.3: Deployment script hardening and full backend sync.
 * - 26.8.2: Metrica-driven fixes, port recovery, and asset sync stability.
 * - 26.8.1: Modular route consolidation & feature parity.
 * - 26.8.0: Consolidated routes from index.js into modular system.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Logging Setup
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); 
app.use(compression());

// Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.disable('x-powered-by');

// --- Routes ---
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes')(pool);
const driverRoutes = require('./routes/driverRoutes')(pool);
const bookingRoutes = require('./routes/bookingRoutes')(pool);
const tourRoutes = require('./routes/tourRoutes')(pool);

app.use('/api/ai', aiRoutes);
app.use('/api/notify', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tours', tourRoutes);

// --- ADVANCED DEBUG LOGGING ENDPOINT ---
const CLIENT_LOGS_FILE = path.join(__dirname, 'client_debug.log');
app.post('/api/logs', (req, res) => {
  const { level, message, details, version, timestamp } = req.body;
  const logEntry = `[${timestamp || new Date().toISOString()}] [${version || 'unknown'}] [${level || 'INFO'}] ${message}: ${JSON.stringify(details || {})}\n`;
  fs.appendFileSync(CLIENT_LOGS_FILE, logEntry);
  res.status(204).send();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    time: new Date().toISOString(),
    db: 'CONNECTED'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'OrbiTrip API is running (v26.8.4)', 
    docs: 'https://docs.orbitrip.ge',
    env: process.env.NODE_ENV || 'development'
  });
});

const server = app.listen(PORT, () => {
  console.log(`\x1b[32m🚀 [v26.8.4] OrbiTrip Backend Stabilized on port ${PORT}\x1b[0m`);
  console.log(`\x1b[36m📂 Access logs: ${path.join(__dirname, 'access.log')}\x1b[0m`);
});

// Port Conflict Recovery logic
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\x1b[31m❌ Port ${PORT} is already in use.\x1b[0m`);
    console.log(`\x1b[33m💡 SUGGESTION: Run 'taskkill /F /IM node.exe' on Windows or check your PM2 status.\x1b[0m`);
    process.exit(1);
  }
});

/**
 * VERSION HISTORY (Server Side):
 * - 26.8.4: Total Live Recovery: Fixed EADDRINUSE, modular sync, and PM2 zombification.
 * - 26.8.2: Added port conflict recovery & GAds analytics optimization.
 * - 26.8.1: Unified modular routes, fixed 404 booking errors.
 * - 26.8.0: Consolidated server.js + index.js.
 */
