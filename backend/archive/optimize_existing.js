
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TARGET_SIZE_KB = 500;
const MAX_DIMENSION = 1400;

async function optimizeImages() {
    console.log("🚀 Starting Bulk Image Optimization...");

    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error("❌ Uploads directory not found!");
        return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`Found ${files.length} files to check.`);

    let optimizedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;

        // Skip if not an image or already small enough
        if (!file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            skippedCount++;
            continue;
        }

        if (sizeKB <= TARGET_SIZE_KB) {
            skippedCount++;
            continue;
        }

        console.log(`[Optimize] ${file} (${sizeKB.toFixed(2)} KB) -> Processing...`);

        try {
            const tempFile = filePath + '.tmp';

            // Re-encode to highly optimized JPEG
            await sharp(filePath)
                .resize(MAX_DIMENSION, MAX_DIMENSION, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 75, progressive: true, mozjpeg: true })
                .toFile(tempFile);

            const newStats = fs.statSync(tempFile);
            const newSizeKB = newStats.size / 1024;

            // Replace original if the new one is actually smaller
            if (newSizeKB < sizeKB) {
                fs.renameSync(tempFile, filePath);
                console.log(`  ✨ Success: ${sizeKB.toFixed(2)} KB -> ${newSizeKB.toFixed(2)} KB`);
                optimizedCount++;
            } else {
                fs.unlinkSync(tempFile);
                console.log(`  ℹ️ Skipping: Optimized version was not smaller.`);
                skippedCount++;
            }
        } catch (err) {
            console.error(`  ❌ Error processing ${file}:`, err.message);
            errorCount++;
        }
    }

    console.log(`\n✅ Optimization Report:`);
    console.log(`- Optimized: ${optimizedCount}`);
    console.log(`- Skipped:   ${skippedCount}`);
    console.log(`- Errors:    ${errorCount}`);
}

optimizeImages();
