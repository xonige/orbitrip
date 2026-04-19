const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip' });

async function run() {
  try {
    const res = await pool.query("SELECT id, review_count, jsonb_array_length(reviews) as rev_len, car_photos FROM drivers WHERE id='drv-dato-aqua'");
    console.log(res.rows[0]);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
