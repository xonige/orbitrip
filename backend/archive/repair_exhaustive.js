
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
    console.log("🚀 Starting EXHAUSTIVE Image Repair...");
    try {
        const driversToFix = [
            {
                id: 'drv-1768612600648',
                name: 'Dato',
                original: {
                    avatar: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/avatar/1768612600687_i0k9l.jpg',
                    car_front: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_front/1768612603687_qcurv.jpg',
                    gallery: [
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_back/1768612604601_n6b4y.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_side/1768612605870_fbkvx.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_interior/1768612607023_1lrx3.jpg'
                    ]
                }
            },
            {
                id: 'drv-1768636622391',
                name: 'Vital',
                original: {
                    avatar: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/avatar/1768636622404_bvdsl.jpg',
                    car_front: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_front/1768636625973_4avbs.jpg',
                    gallery: [
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_back/1768636627102_mqrut.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_side/1768636628039_1zpn5.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_interior/1768636629459_5rdp8.heic'
                    ]
                }
            },
            {
                id: 'drv-1768816320252',
                name: 'Dato G.',
                original: {
                    avatar: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/avatar/1768816320311_0t86q.jpg',
                    car_front: 'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_front/1768816328457_h26fc.jpg',
                    gallery: [
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_back/1768816337796_ncgtp.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_side/1768816344105_3kf6h.jpg',
                        'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_interior/1768816350249_7pjil.jpg'
                    ]
                }
            }
        ];

        for (const d of driversToFix) {
            console.log(`\nFixing Driver: ${d.name} (${d.id})`);

            // Avatar
            const avatarFilename = `avatar-${d.id}-${Date.now()}.jpg`;
            const avatarDest = path.join(UPLOADS_DIR, avatarFilename);
            if (await downloadWithCurl(d.original.avatar, avatarDest)) {
                await pool.query("UPDATE drivers SET photo_url = $1 WHERE id = $2", [`/uploads/${avatarFilename}`, d.id]);
            }

            // Main Car
            const carFilename = `car_main-${d.id}-${Date.now()}.jpg`;
            const carDest = path.join(UPLOADS_DIR, carFilename);
            if (await downloadWithCurl(d.original.car_front, carDest)) {
                await pool.query("UPDATE drivers SET car_photo_url = $1 WHERE id = $2", [`/uploads/${carFilename}`, d.id]);
            }

            // Gallery
            let localizedGallery = [];
            for (let i = 0; i < d.original.gallery.length; i++) {
                const ext = path.extname(d.original.gallery[i].split('?')[0]) || '.jpg';
                const gFilename = `car_gallery_${i}-${d.id}-${Date.now()}${ext}`;
                const gDest = path.join(UPLOADS_DIR, gFilename);
                if (await downloadWithCurl(d.original.gallery[i], gDest)) {
                    localizedGallery.push(`/uploads/${gFilename}`);
                }
            }
            if (localizedGallery.length > 0) {
                await pool.query("UPDATE drivers SET car_photos = $1 WHERE id = $2", [localizedGallery, d.id]);
            }
        }

        // Final check for blob URLs
        console.log("\nChecking for any remaining blob URLs...");
        const { rows: blobDrivers } = await pool.query("SELECT id, name FROM drivers WHERE photo_url LIKE 'blob%' OR car_photo_url LIKE 'blob%' OR car_photos::text LIKE 'blob%'");
        if (blobDrivers.length > 0) {
            console.log("Found drivers with blob URLs:", blobDrivers);
        } else {
            console.log("No blob URLs found in drivers table.");
        }

        console.log("\n✅ Exhaustive repair finished.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
