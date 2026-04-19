const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function fixOrientation() {
    console.log('🚀 Starting Server-side Image Orientation Fix...');

    if (!fs.existsSync(uploadsDir)) {
        console.error('❌ Uploads directory not found!');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    let count = 0;
    let fixed = 0;

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            count++;
            const filePath = path.join(uploadsDir, file);
            const tempPath = path.join(uploadsDir, `temp_${file}`);

            try {
                // sharp().rotate() without arguments uses EXIF to auto-rotate
                await sharp(filePath)
                    .rotate()
                    .toFile(tempPath);

                // Compare sizes or just overwrite if successful
                fs.renameSync(tempPath, filePath);
                fixed++;
                if (fixed % 10 === 0) console.log(`✅ Processed ${fixed} files...`);
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err.message);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }
        }
    }

    console.log(`\n🎉 Optimization Complete!`);
    console.log(`📊 Scanned: ${count} files`);
    console.log(`🔧 Fixed/Verified: ${fixed} files`);
}

fixOrientation();
