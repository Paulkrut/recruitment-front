/**
 * Скрипт для поиска всех русских текстов в проекте
 * Помогает отследить прогресс миграции
 */

const fs = require('fs');
const path = require('path');

function hasRussianText(text) {
  return /[А-Яа-яЁё]/.test(text);
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const findings = {
    total: 0,
    inTrans: 0,
    inMsg: 0,
    unwrapped: 0,
    details: []
  };
  
  lines.forEach((line, index) => {
    if (!hasRussianText(line)) return;
    
    // Пропускаем комментарии
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    
    // Пропускаем импорты
    if (line.includes('import ') || line.includes('from ')) return;
    
    findings.total++;
    
    if (line.includes('<Trans>') || line.includes('</Trans>')) {
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
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
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
        item.details.slice(0, 3).forEach(detail => {
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


