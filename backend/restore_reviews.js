const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip' });
const fs = require('fs');

async function run() {
  const data = JSON.parse(fs.readFileSync('../src/data/server_drivers.json', 'utf8'));
  let client;
  try {
    client = await pool.connect();
    let updated = 0;
    for (let driver of data) {
      if (driver.reviews && driver.reviews.length > 0) {
        await client.query('UPDATE drivers SET reviews = $1 WHERE id = $2', [JSON.stringify(driver.reviews), driver.id]);
        updated++;
      }
    }
    console.log('Successfully restored reviews for ' + updated + ' drivers from JSON!');
  } catch (err) {
    console.error(err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}
run();
