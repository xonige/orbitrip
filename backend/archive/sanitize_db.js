
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

async function run() {
    console.log("🚀 Starting Database Sanitization...");
    try {
        // 1. Fix Goga specifically
        await pool.query(
            "UPDATE drivers SET photo_url = $1 WHERE (name ILIKE '%goga%' OR id = 'drv-1770653725190')",
            ['/uploads/file-1770653553444-64360353.jpg']
        );
        console.log("Standardized Goga's photo URL.");

        // 2. Clear any other blob URLs in drivers (safety)
        // We'll set them to null or a placeholder if they are blobs, because blobs are useless on a different session
        await pool.query("UPDATE drivers SET photo_url = NULL WHERE photo_url LIKE 'blob%'");
        await pool.query("UPDATE drivers SET car_photo_url = NULL WHERE car_photo_url LIKE 'blob%'");
        // For arrays, we'll just keep them as-is for now as it's harder to sanitize in SQL without complex logic, 
        // but our repair script already overwrote the problematic ones.

        // 3. Check tours
        const { rowCount: tourBlobs } = await pool.query("UPDATE tours SET image = NULL WHERE image LIKE 'blob%'");
        console.log(`Cleaned ${tourBlobs} blob URLs from tours table.`);

        console.log("\n✅ Sanitization finished.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
