
const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
    connectionString: "postgres://orbitrip_user:OrbitripSecure2024!@localhost:5432/orbitrip"
});

const API_KEY = 'sb_publishable_b6L4d4ZhxfNnUREORZOcDw_hmPU_IWd';
const PROJECT_ID = 'fhfkdadxvpmmioikkwex';
const BUCKET = 'public-gallery';

async function listFolders(prefix) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ prefix });
        const options = {
            hostname: `${PROJECT_ID}.supabase.co`,
            path: `/storage/v1/object/list/${BUCKET}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        const { rows: dbDrivers } = await pool.query("SELECT id, name FROM drivers");
        const dbIds = new Set(dbDrivers.map(d => d.id));

        const storageFolders = await listFolders('drivers/');
        console.log(`DB Drivers: ${dbIds.size}, Storage Folders: ${storageFolders.length}`);

        const orphans = [];
        for (const f of storageFolders) {
            if (!f.id && !dbIds.has(f.name)) {
                orphans.push(f.name);
            }
        }

        console.log(`Found ${orphans.length} orphan folders.`);
        console.log("Orphan IDs:", orphans);

        // For each orphan, let's see if we can find a name inside
        for (const orphanId of orphans.slice(0, 10)) { // Limit to 10 for now
            const files = await listFolders(`drivers/${orphanId}/avatar/`);
            if (Array.isArray(files) && files.length > 0) {
                console.log(`Orphan ${orphanId} avatar file: ${files[0].name}`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
