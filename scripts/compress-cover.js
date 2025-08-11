const fs = require('fs');
const path = require('path');

(async () => {
  const sharp = require('sharp');
  const inputPath = path.resolve(__dirname, '..', 'image.png');
  const tempPath = path.resolve(__dirname, '..', 'image.compressed.png');

  if (!fs.existsSync(inputPath)) {
    console.error('Cover image not found at', inputPath);
    process.exit(1);
  }

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const targetWidth = metadata.width && metadata.width > 1600 ? 1600 : metadata.width;

    await image
      .resize({ width: targetWidth })
      .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
      .toFile(tempPath);

    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(tempPath).size;

    if (newSize < origSize) {
      fs.copyFileSync(tempPath, inputPath);
      console.log(`Compressed cover image: ${(origSize/1024/1024).toFixed(2)}MB -> ${(newSize/1024/1024).toFixed(2)}MB`);
    } else {
      console.log('Compressed file is not smaller; keeping original.');
    }

    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  } catch (err) {
    console.error('Compression failed:', err.message);
    process.exit(1);
  }
})();