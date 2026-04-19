const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip';
const dataPath = path.join(__dirname, 'all_drivers_reviews.json');

async function restore() {
    console.log('--- STARTING GLOBAL DATA RESTORATION (V27.0.0) ---');
    
    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found at:', dataPath);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const driverIds = Object.keys(data);
    console.log(`Loaded ${driverIds.length} drivers for restoration.`);

    const client = new Client({ connectionString });
    await client.connect();

    try {
        await client.query('BEGIN');
        
        let successCount = 0;

        for (const driverId of driverIds) {
            const driverData = data[driverId];
            let reviews = [];
            
            try {
                // The backup format has reviews as a stringified JSON array
                if (typeof driverData.reviews === 'string') {
                    reviews = JSON.parse(driverData.reviews);
                } else if (Array.isArray(driverData.reviews)) {
                    reviews = driverData.reviews;
                }
            } catch (e) {
                console.warn(`Could not parse reviews for ${driverId}:`, e.message);
                reviews = [];
            }

            const reviewCount = reviews.length;
            
            // Calculate average rating
            let rating = 4.9;
            if (reviewCount > 0) {
                const total = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
                rating = Number((total / reviewCount).toFixed(1));
            }
            
            // Ensure Dato stays premium
            if (driverId === 'drv-dato-aqua') {
                rating = Math.max(rating, 4.9);
            }

            console.log(`Updating ${driverId}: ${reviewCount} reviews, rating: ${rating}`);
            
            const query = `
                UPDATE drivers 
                SET reviews = $1, 
                    review_count = $2, 
                    rating = $3 
                WHERE id = $4
            `;
            await client.query(query, [JSON.stringify(reviews), reviewCount, rating, driverId]);
            successCount++;
        }

        await client.query('COMMIT');
        console.log(`--- SUCCESS: ${successCount}/74 DRIVERS RESTORED ---`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during restoration:', err);
    } finally {
        await client.end();
    }
}

restore();
