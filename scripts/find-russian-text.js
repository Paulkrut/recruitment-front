/**
 * Скрипт для поиска всех русских текстов в проекте
 * Помогает отследить прогресс миграции
 */

const fs = require('fs');
const path = require('path');

function hasRussianText(text) {
  return /[А-Яа-яЁё]/.test(text);
}

// Юридические файлы с большими текстами - обрабатываются вручную
const LEGAL_FILES = [
  'privacy-policy',
  'hr-agreement', 
  'terms-of-service',
  'forget-me-requests'
];

function shouldSkipFile(filePath) {
  return LEGAL_FILES.some(legalFile => filePath.includes(legalFile));
}

function analyzeFile(filePath) {
  // Пропускаем юридические файлы
  if (shouldSkipFile(filePath)) {
    return {
      total: 0,
      inTrans: 0,
      inMsg: 0,
      unwrapped: 0,
      details: []
    };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const findings = {
    total: 0,
    inTrans: 0,
    inMsg: 0,
    unwrapped: 0,
    details: []
  };
  
  // Проверка: находится ли строка внутри <Trans>...</Trans>
  let insideTransBlock = false;
  // Проверка: находится ли строка внутри блока ru: { ... } или en: { ... }
  let insideLocaleBlock = 0; // счётчик вложенных {}
  
  lines.forEach((line, index) => {
    // Отслеживаем блоки ru: { или en: {
    if (/^\s*(ru|en):\s*{/.test(line.trim())) {
      insideLocaleBlock++;
    }
    // Считаем открывающие и закрывающие скобки внутри блока локали
    if (insideLocaleBlock > 0) {
      insideLocaleBlock += (line.match(/{/g) || []).length;
      insideLocaleBlock -= (line.match(/}/g) || []).length;
    }
    
    // Отслеживаем открытие/закрытие <Trans>
    if (line.includes('<Trans>') && !line.includes('</Trans>')) {
      insideTransBlock = true;
    }
    if (line.includes('</Trans>')) {
      insideTransBlock = false;
      // Если на этой же строке есть русский текст - он уже обернут
      if (hasRussianText(line)) {
        findings.total++;
        findings.inTrans++;
        return;
      }
    }
    
    if (!hasRussianText(line)) return;
    
    // Если внутри блока локали (ru: { ... } или en: { ... }) - считаем переведённым
    if (insideLocaleBlock > 0) {
      findings.total++;
      findings.inTrans++; // Считаем как обёрнутый (мультиязычный код)
      return;
    }
    
    // Пропускаем строки с комментариями
    const trimmed = line.trim();
    
    // Однострочные комментарии в начале строки
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    
    // Многострочные комментарии: /* ... */
    if (trimmed.startsWith('/*') || (trimmed.includes('/*') && trimmed.includes('*/'))) return;
    
    // JSX комментарии: {/* ... */}
    if (trimmed.startsWith('{/*') || trimmed.includes('{/*') && trimmed.includes('*/}')) return;
    
    // Console логи: console.log(), console.error() и т.д.
    if (/console\.\w+\(/.test(line)) return;
    
    // Объекты с переводами: ru: "...", en: "..."
    if (/^\s*(ru|en):\s*["']/.test(trimmed)) return;
    
    // Инлайн комментарии: удаляем их перед проверкой
    let cleanLine = line;
    if (line.includes('//')) {
      // Удаляем все после //
      cleanLine = line.substring(0, line.indexOf('//'));
      
      // Если после удаления комментария нет русского текста - пропускаем
      if (!hasRussianText(cleanLine)) return;
    }
    
    // Пропускаем импорты
    if (line.includes('import ') || line.includes('from ')) return;
    
    findings.total++;
    
    // Если внутри блока <Trans> - считаем обернутым
    if (insideTransBlock) {
      findings.inTrans++;
    } else if (line.includes('<Trans>') || line.includes('</Trans>')) {
      findings.inTrans++;
    } else if (line.includes('msg`') || line.includes('_(msg')) {
      findings.inMsg++;
    } else {
      findings.unwrapped++;
      findings.details.push({
        line: index + 1,
        content: line.trim().substring(0, 80)
      });
    }
  });
  
  return findings;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.next', 'out', 'dist', 'build', 'scripts'].includes(file)) {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      // Исключаем конфигурационные файлы
      if (!file.includes('config') && !file.includes('.d.ts')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function main() {
  console.log('🔍 Поиск русского текста в проекте...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = walkDir(srcDir);
  
  const stats = {
    totalFiles: files.length,
    filesWithRussian: 0,
    totalRussianTexts: 0,
    wrapped: 0,
    unwrapped: 0,
    filesNeedingMigration: []
  };
  
  files.forEach(file => {
    const findings = analyzeFile(file);
    
    if (findings.total > 0) {
      stats.filesWithRussian++;
      stats.totalRussianTexts += findings.total;
      stats.wrapped += findings.inTrans + findings.inMsg;
      stats.unwrapped += findings.unwrapped;
      
      if (findings.unwrapped > 0) {
        stats.filesNeedingMigration.push({
          file: path.relative(path.join(__dirname, '..'), file),
          unwrapped: findings.unwrapped,
          total: findings.total,
          details: findings.details
        });
      }
    }
  });
  
  // Сортируем файлы по количеству необработанных текстов
  stats.filesNeedingMigration.sort((a, b) => b.unwrapped - a.unwrapped);
  
  // Выводим статистику
  console.log('📊 ОБЩАЯ СТАТИСТИКА:');
  console.log('='.repeat(60));
  console.log(`Всего файлов: ${stats.totalFiles}`);
  console.log(`Файлов с русским текстом: ${stats.filesWithRussian}`);
  console.log(`Всего русских текстов: ${stats.totalRussianTexts}`);
  console.log(`  ✅ Обернуто (<Trans>/msg): ${stats.wrapped}`);
  console.log(`  ❌ Не обернуто: ${stats.unwrapped}`);
  
  const percentage = stats.totalRussianTexts > 0 
    ? ((stats.wrapped / stats.totalRussianTexts) * 100).toFixed(1)
    : 0;
  
  console.log(`\n📈 Прогресс миграции: ${percentage}%`);
  console.log('='.repeat(60));
  
  // Выводим топ-10 файлов требующих миграции
  if (stats.filesNeedingMigration.length > 0) {
    console.log('\n🎯 ТОП-10 ФАЙЛОВ ДЛЯ МИГРАЦИИ:');
    console.log('='.repeat(60));
    
    stats.filesNeedingMigration.slice(0, 10).forEach((item, index) => {
      const percent = ((item.unwrapped / item.total) * 100).toFixed(0);
      console.log(`\n${index + 1}. ${item.file}`);
      console.log(`   Не обернуто: ${item.unwrapped} из ${item.total} (${percent}%)`);
      
      if (item.details.length > 0) {
        console.log(`   Примеры:`);
        item.details.slice(0, 10).forEach(detail => {
          console.log(`     Line ${detail.line}: ${detail.content}`);
        });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n💡 Всего файлов требующих миграции: ${stats.filesNeedingMigration.length}`);
  } else {
    console.log('\n✨ ВСЕ ФАЙЛЫ МИГРИРОВАНЫ! 🎉');
  }
  
  // Сохраняем детальный отчет в файл
  const reportPath = path.join(__dirname, '..', 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log(`\n📄 Детальный отчет сохранен в: migration-report.json`);
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile, walkDir };


