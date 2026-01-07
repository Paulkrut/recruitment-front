const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const screenshotsDir = __dirname;

async function optimizeScreenshots() {
  const files = fs.readdirSync(screenshotsDir);
  const pngFiles = files.filter(file => file.endsWith('.png'));

  console.log(`📸 Найдено ${pngFiles.length} PNG файлов для оптимизации\n`);

  for (const file of pngFiles) {
    const inputPath = path.join(screenshotsDir, file);
    const outputPath = path.join(screenshotsDir, file.replace('.png', '.webp'));

    try {
      const info = await sharp(inputPath)
        .webp({ 
          quality: 85,        // Качество 85% - хороший баланс
          effort: 6,          // Уровень сжатия (0-6, чем выше тем лучше но медленнее)
        })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const newSize = info.size;
      const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB (экономия ${savings}%)\n`);
    } catch (error) {
      console.error(`❌ Ошибка при обработке ${file}:`, error.message);
    }
  }

  console.log('🎉 Оптимизация завершена!');
  console.log('\n💡 Совет: Оригинальные PNG файлы сохранены.');
  console.log('   Можешь удалить их вручную после проверки WebP файлов.');
}

optimizeScreenshots();

