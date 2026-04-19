
const https = require('https');

const API_KEY = 'sb_publishable_b6L4d4ZhxfNnUREORZOcDw_hmPU_IWd';
const PROJECT_ID = 'fhfkdadxvpmmioikkwex';
const BUCKET = 'public-gallery';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Supabase Error ${res.statusCode}: ${body}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error("JSON Parse Error: " + body));
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function scan() {
    console.log('--- SCANNING ALL STORAGE FOLDERS (RATE LIMITED) ---');
    try {
        const rootFolders = await listFolders('drivers/');
        console.log(`Found ${rootFolders.length} items in drivers/`);

        for (const folder of rootFolders) {
            if (!folder.id) {
                console.log(`Checking folder: ${folder.name}...`);
                await sleep(200); // 200ms delay between folders

                const subfolders = await listFolders(`drivers/${folder.name}/`);
                if (!Array.isArray(subfolders)) continue;

                for (const sub of subfolders) {
                    if (!sub.id) {
                        const files = await listFolders(`drivers/${folder.name}/${sub.name}/`);
                        if (!Array.isArray(files)) continue;
                        for (const file of files) {
                            if (file.name.toLowerCase().includes('david') ||
                                file.name.toLowerCase().includes('bmw') ||
                                file.name.toLowerCase().includes('sonata') ||
                                file.name.toLowerCase().includes('example')) {
                                console.log(`MATCH: drivers/${folder.name}/${sub.name}/${file.name}`);
                            }
                        }
                        await sleep(100);
                    }
                }
            }
        }
        console.log('--- SCAN COMPLETED ---');
    } catch (err) {
        console.error("Scan error:", err.message);
    }
}
scan();
