
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function updateSettingsSchema() {
    console.log("🚀 Updating Settings Schema...");

    try {
        const queries = [
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS commission_enabled BOOLEAN DEFAULT FALSE",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS min_trip_price INTEGER DEFAULT 30",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'GEL'",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS sms_api_key TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT TRUE",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS booking_window_days INTEGER DEFAULT 60",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS instant_booking_enabled BOOLEAN DEFAULT FALSE",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_title TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS social_facebook TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS social_instagram TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS background_image_url TEXT",
            "ALTER TABLE settings ADD COLUMN IF NOT EXISTS global_alert_message TEXT"
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log(`  ✅ Executed: ${q.substring(0, 40)}...`);
            } catch (err) {
                console.warn(`  ⚠️ Notice: ${err.message}`);
            }
        }

        console.log("✅ Settings schema update complete.");
    } catch (err) {
        console.error("❌ Schema update failed:", err);
    } finally {
        await pool.end();
    }
}

updateSettingsSchema();
