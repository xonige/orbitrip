const https = require('https');

const API_KEY = 'sb_publishable_b6L4d4ZhxfNnUREORZOcDw_hmPU_IWd';
const PROJECT_ID = 'fhfkdadxvpmmioikkwex';
const BUCKET = 'public-gallery';

async function listFolders(prefix) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ prefix });
        const options = {
            hostname: ,
            path: ,
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
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function scan() {
    console.log('--- SCANNING ALL STORAGE FOLDERS ---');
    const rootFolders = await listFolders('drivers/');
    console.log(`Found ${rootFolders.length} folders in drivers/`);

    for (const folder of rootFolders) {
            const subfolders = await listFolders(`drivers/${folder.name}/`);
            for (const sub of subfolders) {
                     const files = await listFolders(`drivers/${folder.name}/${sub.name}/`);
                     for (const file of files) {
                         if (file.name.toLowerCase().includes('david') || file.name.toLowerCase().includes('bmw')) {
                             console.log(`MATCH: drivers/${folder.name}/${sub.name}/${file.name}`);
                         }
                     }
                }
            }
        }
    }
}
scan();
