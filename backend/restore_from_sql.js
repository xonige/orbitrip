const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip' });

async function run() {
  const sql = fs.readFileSync('../backups/orbitrip_db_2026-04-07.sql', 'utf8');
  const lines = sql.split('\n');
  
  let inCopy = false;
  let parsedDrivers = [];
  
  for (let line of lines) {
    if (line.startsWith('COPY public.drivers (')) {
      inCopy = true;
      continue;
    }
    if (inCopy && line === '\\.') {
      inCopy = false;
      break;
    }
    
    if (inCopy) {
      const parts = line.split('\t');
      if (parts.length > 20) {
        parsedDrivers.push({
          id: parts[0],
          photoUrl: parts[6] === '\\N' ? null : parts[6],
          carPhotoUrl: parts[8] === '\\N' ? null : parts[8],
          carPhotos: parts[9] === '\\N' ? null : parts[9],
          reviews: parts[20] === '\\N' ? null : parts[20].replace(/\\\\/g, '\\')
        });
      }
    }
  }
  
  let client;
  try {
    client = await pool.connect();
    let updated = 0;
    
    for (let d of parsedDrivers) {
      if (!d.id) continue;
      
      let cpArray = null;
      if (d.carPhotos) {
          // It looks like: {/drivers/dato/car_gallery_0.jpg,/drivers/dato/car_gallery_1.jpg}
          // Or {"/cars/image.jpg","/cars/image2.jpg"}
          let cleaned = d.carPhotos.trim();
          if (cleaned.startsWith('{')) cleaned = cleaned.substring(1);
          if (cleaned.endsWith('}')) cleaned = cleaned.substring(0, cleaned.length - 1);
          
          if (cleaned) {
             cpArray = cleaned.split(',').map(s => {
                 let sTrim = s.trim();
                 if (sTrim.startsWith('"')) sTrim = sTrim.substring(1);
                 if (sTrim.endsWith('"')) sTrim = sTrim.substring(0, sTrim.length - 1);
                 return sTrim;
             }).filter(s => s);
          } else {
             cpArray = [];
          }
      }

      await client.query(
        `UPDATE drivers 
         SET photo_url = COALESCE($1, photo_url),
             car_photo_url = COALESCE($2, car_photo_url),
             car_photos = COALESCE($3::text[], car_photos)
         WHERE id = $4`, 
        [
          d.photoUrl, 
          d.carPhotoUrl, 
          cpArray, 
          d.id
        ]
      );
      updated++;
    }
    console.log(`Successfully restored photos for ${updated} drivers from SQL Backup!`);
  } catch(e) {
      console.error(e);
  } finally {
      if (client) client.release();
      await pool.end();
  }
}

run();
