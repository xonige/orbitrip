
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

async function run() {
    try {
        // Restore Dato (drv-1768612600648)
        await pool.query(
            "UPDATE drivers SET photo_url = $1, car_photo_url = $2 WHERE id = $3",
            [
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/avatar/1768612600687_i0k9l.jpg',
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768612600648/car_front/1768612603687_qcurv.jpg',
                'drv-1768612600648'
            ]
        );

        // Restore Vital (drv-1768636622391)
        await pool.query(
            "UPDATE drivers SET photo_url = $1, car_photo_url = $2 WHERE id = $3",
            [
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/avatar/1768636622404_bvdsl.jpg',
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768636622391/car_front/1768636625973_4avbs.jpg',
                'drv-1768636622391'
            ]
        );

        // Restore Dato G. (drv-1768816320252)
        await pool.query(
            "UPDATE drivers SET photo_url = $1, car_photo_url = $2 WHERE id = $3",
            [
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/avatar/1768816320311_0t86q.jpg',
                'https://fhfkdadxvpmmioikkwex.supabase.co/storage/v1/object/public/public-gallery/drivers/drv-1768816320252/car_front/1768816328457_h26fc.jpg',
                'drv-1768816320252'
            ]
        );

        console.log("Restored original URLs for Dato, Vital, and Dato G.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
