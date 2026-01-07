const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const testimonialsDir = __dirname;

async function optimizeTestimonials() {
  const files = fs.readdirSync(testimonialsDir);
  const imageFiles = files.filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  );

  console.log(`📸 Найдено ${imageFiles.length} изображений для оптимизации\n`);

  for (const file of imageFiles) {
    const inputPath = path.join(testimonialsDir, file);
    const outputPath = path.join(testimonialsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    try {
      const info = await sharp(inputPath)
        .webp({ 
          quality: 85,        // Качество 85% - хороший баланс
          effort: 6,          // Максимальное сжатие
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
  console.log('\n💡 Совет: Оригинальные JPG файлы сохранены.');
  console.log('   Можешь удалить их вручную после проверки WebP файлов.');
}

optimizeTestimonials();

