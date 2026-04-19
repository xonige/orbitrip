
const { Pool } = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

const UPLOADS_DIR = '/var/www/orbitrip/backend/uploads';

async function downloadWithCurl(url, dest) {
    try {
        console.log(`Downloading: ${url}`);
        if (fs.existsSync(dest)) fs.unlinkSync(dest);

        execSync(`curl -s -k -L --fail "${url}" -o "${dest}"`, { stdio: 'inherit' });

        if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
            return true;
        }
        return false;
    } catch (e) {
        console.error(`Failed to download ${url}`);
        return false;
    }
}

async function run() {
    console.log("🚀 Starting Best-Effort Image Repair...");
    try {
        const driversToFix = [
            { id: 'drv-1768612600648', name: 'Dato' },
            { id: 'drv-1768636622391', name: 'Vital' },
            { id: 'drv-1768816320252', name: 'Dato G.' }
        ];

        for (const d of driversToFix) {
            console.log(`\nFixing Driver: ${d.name} (${d.id})`);
            const { rows } = await pool.query("SELECT photo_url, car_photo_url FROM drivers WHERE id = $1", [d.id]);
            const driver = rows[0];

            if (driver.photo_url && driver.photo_url.includes('supabase')) {
                const filename = `avatar-${d.id}-${Date.now()}.jpg`;
                const dest = path.join(UPLOADS_DIR, filename);
                if (await downloadWithCurl(driver.photo_url, dest)) {
                    await pool.query("UPDATE drivers SET photo_url = $1 WHERE id = $2", [`/uploads/${filename}`, d.id]);
                    console.log(`Updated avatar for ${d.name}`);
                }
            }
            if (driver.car_photo_url && driver.car_photo_url.includes('supabase')) {
                const filename = `car-${d.id}-${Date.now()}.jpg`;
                const dest = path.join(UPLOADS_DIR, filename);
                if (await downloadWithCurl(driver.car_photo_url, dest)) {
                    await pool.query("UPDATE drivers SET car_photo_url = $1 WHERE id = $2", [`/uploads/${filename}`, d.id]);
                    console.log(`Updated car photo for ${d.name}`);
                }
            }
        }
        console.log("\n✅ Best-effort repair finished.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
