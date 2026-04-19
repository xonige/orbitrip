
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

async function run() {
    try {
        const { rows } = await pool.query("SELECT * FROM drivers");
        rows.forEach(d => {
            const str = JSON.stringify(d);
            if (str.includes('blob:')) {
                console.log(`FOUND BLOB in driver ${d.id} (${d.name})`);
                // Print the offending value
                for (let key in d) {
                    if (String(d[key]).includes('blob:')) {
                        console.log(`  Field: ${key}, Value: ${d[key]}`);
                    }
                }
            }
        });
        console.log("Audit complete.");
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
