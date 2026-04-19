
const { Pool } = require('pg');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip';
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const SUPABASE_PROJECT_ID = 'fhfkdadxvpmmioikkwex';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: false
});

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode} for ${url}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { }); // Delete file if error
            reject(err);
        });
    });
}

async function migrate() {
    console.log("🚀 Starting migration of drivers and photos...");

    try {
        // 1. Get all drivers from the local database that still have Supabase URLs
        const { rows: drivers } = await pool.query(`
            SELECT * FROM drivers 
            WHERE photo_url LIKE '%supabase%' 
               OR car_photo_url LIKE '%supabase%'
               OR car_photos::text LIKE '%supabase%'
        `);

        console.log(`Found ${drivers.length} drivers with Supabase URLs.`);

        for (const driver of drivers) {
            console.log(`\nProcessing driver: ${driver.name} (ID: ${driver.id})`);

            let updates = {};

            // Helper to download and get new path
            const processUrl = async (url, prefix) => {
                if (!url || !url.includes('supabase')) return url;

                const ext = path.extname(new URL(url).pathname) || '.jpg';
                const filename = `${prefix}-${driver.id}-${Date.now()}${ext}`;
                const dest = path.join(UPLOADS_DIR, filename);

                try {
                    await downloadImage(url, dest);
                    console.log(`  ✅ Downloaded: ${filename}`);
                    return `/uploads/${filename}`;
                } catch (err) {
                    console.warn(`  ❌ Failed to download ${url}:`, err.message);
                    return url; // Keep old URL on failure
                }
            };

            // Process main photos
            if (driver.photo_url) {
                updates.photo_url = await processUrl(driver.photo_url, 'avatar');
            }
            if (driver.car_photo_url) {
                updates.car_photo_url = await processUrl(driver.car_photo_url, 'car_main');
            }

            // Process car_photos array
            if (Array.isArray(driver.car_photos)) {
                const newCarPhotos = [];
                for (let i = 0; i < driver.car_photos.length; i++) {
                    newCarPhotos.push(await processUrl(driver.car_photos[i], `car_gallery_${i}`));
                }
                updates.car_photos = newCarPhotos;
            }

            // Update database
            if (Object.keys(updates).length > 0) {
                const fields = [];
                const values = [];
                let i = 1;

                for (const [key, value] of Object.entries(updates)) {
                    fields.push(`${key} = $${i++}`);
                    values.push(value);
                }

                values.push(driver.id);
                await pool.query(`UPDATE drivers SET ${fields.join(', ')} WHERE id = $${i}`, values);
                console.log(`  ✨ Database updated for ${driver.name}`);
            }
        }

        console.log("\n✅ Migration completed successfully!");
    } catch (err) {
        console.error("Critical Migration Error:", err);
    } finally {
        await pool.end();
    }
}

migrate();
