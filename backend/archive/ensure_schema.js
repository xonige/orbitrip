
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function ensureSchema() {
    console.log("🚀 Verifying Database Schema...");

    try {
        const queries = [
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS max_passengers INTEGER DEFAULT 4",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email TEXT",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS password TEXT"
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log(`  ✅ Executed: ${q.substring(0, 40)}...`);
            } catch (err) {
                console.warn(`  ⚠️ Notice: ${err.message}`);
            }
        }

        console.log("✅ Schema verification complete.");
    } catch (err) {
        console.error("❌ Schema verification failed:", err);
    } finally {
        await pool.end();
    }
}

ensureSchema();
