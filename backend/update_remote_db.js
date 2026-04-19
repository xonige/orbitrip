const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip' });

async function run() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT id, price_per_km FROM drivers WHERE price_per_km IS NOT NULL');
    let updated = 0;
    for (let driver of res.rows) {
      let currentPrice = parseFloat(driver.price_per_km);
      if (!isNaN(currentPrice) && currentPrice > 0) {
        let newPrice = (currentPrice / 2).toFixed(2);
        await client.query('UPDATE drivers SET price_per_km = $1 WHERE id = $2', [newPrice, driver.id]);
        updated++;
      }
    }
    
    // Explicitly set city to Kutaisi for the specific drivers, and tbilisi for null
    await client.query("UPDATE drivers SET city = 'kutaisi' WHERE name IN ('Paata', 'Beka', 'Guram')");
    await client.query("UPDATE drivers SET city = 'tbilisi' WHERE city IS NULL");
    
    console.log('Successfully halved prices for ' + updated + ' drivers on production!');
  } catch (err) {
    console.error(err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}
run();
