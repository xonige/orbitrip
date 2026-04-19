const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip' });

async function run() {
  const res = await pool.query("SELECT id, name, review_count, jsonb_array_length(reviews) as actual_reviews, car_photo_url, car_photos FROM drivers WHERE id='drv-dato-aqua'");
  console.log(JSON.stringify(res.rows[0], null, 2));
  
  // Also check a few more drivers
  const res2 = await pool.query("SELECT id, name, review_count, jsonb_array_length(reviews) as actual_reviews FROM drivers ORDER BY review_count DESC LIMIT 10");
  console.log('\nTop 10 drivers by review_count:');
  res2.rows.forEach(r => console.log(`  ${r.name}: ${r.actual_reviews} reviews (count field: ${r.review_count})`));
  
  await pool.end();
}
run();
