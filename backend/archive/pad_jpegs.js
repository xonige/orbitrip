
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = '/var/www/orbitrip/backend/uploads';

function fixJpeg(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.size < 100) return; // Ignore very small files

        const buffer = fs.readFileSync(filePath);
        const len = buffer.length;

        // Check if it's a JPEG (starts with FF D8)
        if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
            // Not a JPEG, skip
            return;
        }

        // Check if it ends with FF D9
        if (buffer[len - 2] === 0xff && buffer[len - 1] === 0xd9) {
            console.log(`OK: ${path.basename(filePath)}`);
            return;
        }

        console.log(`TRUNCATED: ${path.basename(filePath)} (Ending: ${buffer[len - 2].toString(16)} ${buffer[len - 1].toString(16)})`);

        // Append FF D9
        const newBuffer = Buffer.concat([buffer, Buffer.from([0xff, 0xd9])]);
        fs.writeFileSync(filePath, newBuffer);
        console.log(`FIXED: ${path.basename(filePath)}`);

    } catch (e) {
        console.error(`Error processing ${filePath}: ${e.message}`);
    }
}

const files = fs.readdirSync(UPLOADS_DIR);
console.log(`Checking ${files.length} files...`);

files.forEach(file => {
    const fullPath = path.join(UPLOADS_DIR, file);
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        fixJpeg(fullPath);
    }
});

console.log("Done.");
