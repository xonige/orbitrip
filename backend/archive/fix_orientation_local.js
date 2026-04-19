const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'uploads');

async function fixOrientation() {
    if (!fs.existsSync(directory)) return;

    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
        const filePath = path.join(directory, file);
        
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            // Re-saving to a fixed state
            await image
                .rotate() // Standardize orientation
                .toBuffer()
                .then(data => fs.writeFileSync(filePath, data));
            
            console.log(`✅ Fixed: ${file}`);
        } catch (err) {
            // If it's a corrupted JPEG headers issue, try to read it as a raw buffer
            try {
                const buffer = fs.readFileSync(filePath);
                await sharp(buffer)
                    .rotate()
                    .toFile(filePath + '_tmp');
                fs.renameSync(filePath + '_tmp', filePath);
                console.log(`✅ Fixed (Retry Buffer): ${file}`);
            } catch (err2) {
                console.error(`❌ Permanent failure: ${file}`, err2.message);
            }
        }
    }
}

fixOrientation();
