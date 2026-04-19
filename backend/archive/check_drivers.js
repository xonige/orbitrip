
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

async function run() {
    try {
        const { rows } = await pool.query("SELECT id, name, status, photo_url FROM drivers");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
