
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

async function run() {
    console.log("🚀 Starting DEEP Gallery Sanitization...");
    try {
        const { rows } = await pool.query("SELECT id, car_photos FROM drivers");

        for (const row of rows) {
            if (Array.isArray(row.car_photos)) {
                const cleanPhotos = row.car_photos.filter(p => p && !p.startsWith('blob:'));
                if (cleanPhotos.length !== row.car_photos.length) {
                    console.log(`Cleaning driver ${row.id}...`);
                    await pool.query("UPDATE drivers SET car_photos = $1 WHERE id = $2", [cleanPhotos, row.id]);
                }
            }
        }

        console.log("\n✅ Deep Gallery Sanitization finished.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
