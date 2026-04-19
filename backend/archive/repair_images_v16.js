const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function repairImages() {
    console.log('🛠️ Starting Universal Image Repair (v16.6)...');

    if (!fs.existsSync(uploadsDir)) {
        console.error('❌ Uploads directory not found!');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    let total = 0;
    let repaired = 0;
    let failed = 0;

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            total++;
            const filePath = path.join(uploadsDir, file);
            const tempPath = path.join(uploadsDir, `repairing_${file}`);

            try {
                // By forcing a re-encode, sharp "closes" truncated files
                // failOnError: false is critical here to handle partial JPEGs
                await sharp(filePath, { failOnError: false })
                    .toFile(tempPath);

                fs.renameSync(tempPath, filePath);
                repaired++;
                if (repaired % 20 === 0) console.log(`✅ Fixed ${repaired} files...`);
            } catch (err) {
                console.error(`❌ Permanent Failure on ${file}:`, err.message);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                failed++;
            }
        }
    }

    console.log(`\n🏁 Repair Mission Finalized!`);
    console.log(`📊 Total Scanned: ${total}`);
    console.log(`🔧 Successfully Repaired: ${repaired}`);
    console.log(`⚠️ Unrecoverable: ${failed}`);
}

repairImages();
