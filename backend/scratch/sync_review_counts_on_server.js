const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://orbitrip_user:osboxes.org@localhost:5432/orbitrip'
});

async function run() {
  try {
    console.log('Syncing review_count...');
    const res = await pool.query(`
      UPDATE drivers 
      SET review_count = COALESCE(jsonb_array_length(reviews), 0)
      WHERE reviews IS NOT NULL
    `);
    console.log(`Success: Updated ${res.rowCount} drivers.`);
  } catch (err) {
    console.error('Error syncing review_count:', err);
  } finally {
    await pool.end();
  }
}

run();
