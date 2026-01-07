const fs = require('fs');
const path = require('path');

const screenshotsDir = __dirname;

const renameMap = {
  'Вакансии широкие.webp': 'dashboard.webp',
  'Генерация вопросов.webp': 'ai-generation.webp',
  'кандидаиы канбан.webp': 'kanban.webp',
  'кандидаиы список.webp': 'candidates-list.webp',
  'кандидат итог.webp': 'candidate-summary.webp',
  'кандидат.webp': 'candidate-detail.webp',
  'Сравнение.webp': 'comparison.webp',
  'ХХ импорт 2.webp': 'hh-automation-2.webp',
  'ХХ импорт.webp': 'hh-automation.webp',
  'Вакансия-Операционный-директор-COO-.webm': 'kanban-drag-drop.webm'
};

console.log('📝 Переименование файлов...\n');

Object.entries(renameMap).forEach(([oldName, newName]) => {
  const oldPath = path.join(screenshotsDir, oldName);
  const newPath = path.join(screenshotsDir, newName);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✅ ${oldName} → ${newName}`);
  } else {
    console.log(`⚠️  Файл не найден: ${oldName}`);
  }
});

console.log('\n🎉 Готово!');

