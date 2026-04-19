
const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

const UPLOADS_DIR = '/var/www/orbitrip/backend/uploads';
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

async function downloadWithCurl(url, dest) {
    try {
        console.log(`Downloading: ${url}`);
        execSync(`curl -s -k -L --fail "${url}" -o "${dest}"`, { stdio: 'inherit' });
        return true;
    } catch (e) {
        console.error(`Failed to download ${url}`);
        return false;
    }
}

async function processUrl(url, driverId, type) {
    if (!url || !url.includes('supabase')) return url;

    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const filename = `${type}-${driverId}-${Date.now()}${ext}`;
    const dest = path.join(UPLOADS_DIR, filename);

    const success = await downloadWithCurl(url, dest);
    if (success) {
        return `/api/uploads/${filename}`;
    }
    return url;
}

async function run() {
    console.log("🚀 Starting improved migration...");
    try {
        const { rows: drivers } = await pool.query("SELECT * FROM drivers WHERE photo_url LIKE '%supabase%' OR car_photo_url LIKE '%supabase%' OR car_photos::text LIKE '%supabase%'");
        console.log(`Migrating ${drivers.length} drivers...`);

        for (const driver of drivers) {
            console.log(`\nDriver: ${driver.name} (${driver.id})`);

            const newPhoto = await processUrl(driver.photo_url, driver.id, 'avatar');
            const newCarPhoto = await processUrl(driver.car_photo_url, driver.id, 'car');

            let newGallery = [];
            if (Array.isArray(driver.car_photos)) {
                for (let i = 0; i < driver.car_photos.length; i++) {
                    const g = await processUrl(driver.car_photos[i], driver.id, `gallery-${i}`);
                    newGallery.push(g);
                }
            } else if (typeof driver.car_photos === 'string' && driver.car_photos.includes('supabase')) {
                // handle case where it might be a single string
                const g = await processUrl(driver.car_photos, driver.id, 'gallery-0');
                newGallery = [g];
            }

            await pool.query(
                "UPDATE drivers SET photo_url = $1, car_photo_url = $2, car_photos = $3 WHERE id = $4",
                [newPhoto, newCarPhoto, newGallery, driver.id]
            );
        }
        console.log("\n✅ Localization Completed.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
