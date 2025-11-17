/**
 * Скрипт для автоматической миграции текстов на LinguiJS
 * 
 * Этот скрипт находит русский текст в JSX и оборачивает его в <Trans>
 * 
 * ВНИМАНИЕ: Это базовая версия. После запуска нужна ручная проверка!
 */

const fs = require('fs');
const path = require('path');

// Регулярные выражения для поиска русского текста
const patterns = {
  // Текст между JSX тегами: >Текст<
  jsxText: />([А-Яа-яЁё][^<>]*[А-Яа-яЁё][^<>]*)</g,
  
  // Строки в кавычках с русским текстом
  stringLiteral: /["']([^"']*[А-Яа-яЁё][^"']*?)["']/g,
  
  // label="Текст"
  labelProp: /label=["']([^"']*[А-Яа-яЁё][^"']*?)["']/g,
  
  // placeholder="Текст"
  placeholderProp: /placeholder=["']([^"']*[А-Яа-яЁё][^"']*?)["']/g,
  
  // helperText="Текст"
  helperTextProp: /helperText=["']([^"']*[А-Яа-яЁё][^"']*?)["']/g,
  
  // title="Текст"
  titleProp: /title=["']([^"']*[А-Яа-яЁё][^"']*?)["']/g,
};

// Паттерны, которые НЕ нужно переводить
const skipPatterns = [
  /console\./,
  /className=/,
  /style=/,
  /import /,
  /from /,
  /export /,
  /const /,
  /let /,
  /var /,
  /function /,
  /\.map\(/,
  /\.filter\(/,
  /\.find\(/,
  /href=/,
  /src=/,
  /alt=/,
  /\.(jpg|png|svg|webp|gif)/,
];

function shouldSkip(line) {
  return skipPatterns.some(pattern => pattern.test(line));
}

function hasRussianText(text) {
  return /[А-Яа-яЁё]/.test(text);
}

function processFile(filePath) {
  console.log(`\n📝 Обработка: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  let needsTransImport = false;
  let needsMsgImport = false;
  let needsHook = false;
  
  // Проверяем, есть ли уже импорты LinguiJS
  const hasTransImport = content.includes('Trans');
  const hasMsgImport = content.includes('msg');
  const hasUseLinguiImport = content.includes('useLingui');
  
  // Подсчитываем изменения
  let changes = 0;
  
  // 1. Оборачиваем текст между тегами
  const lines = content.split('\n');
  const processedLines = lines.map((line, index) => {
    if (shouldSkip(line)) return line;
    
    // Простой JSX текст: >Текст<
    const jsxTextMatch = line.match(/>([^<>{}]*[А-Яа-яЁё][^<>{}]*)</);
    if (jsxTextMatch && !line.includes('<Trans>')) {
      const text = jsxTextMatch[1].trim();
      if (text && !text.includes('{') && !text.includes('}')) {
        const newLine = line.replace(
          `>${jsxTextMatch[1]}<`,
          `><Trans>${jsxTextMatch[1]}</Trans><`
        );
        changes++;
        needsTransImport = true;
        return newLine;
      }
    }
    
    return line;
  });
  
  content = processedLines.join('\n');
  
  // 2. Оборачиваем атрибуты
  const attributesToWrap = ['label', 'placeholder', 'helperText', 'title', 'aria-label'];
  
  attributesToWrap.forEach(attr => {
    const regex = new RegExp(`${attr}=["']([^"']*[А-Яа-яЁё][^"']*?)["']`, 'g');
    content = content.replace(regex, (match, text) => {
      if (!shouldSkip(match)) {
        changes++;
        needsMsgImport = true;
        needsHook = true;
        return `${attr}={_(msg\`${text}\`)}`;
      }
      return match;
    });
  });
  
  // 3. Добавляем импорты если нужно
  if ((needsTransImport || needsMsgImport) && !hasTransImport && !hasMsgImport) {
    const importLine = [];
    if (needsTransImport) importLine.push('Trans');
    if (needsHook) importLine.push('useLingui');
    
    const linguiReactImport = `import { ${importLine.join(', ')} } from '@lingui/react';\n`;
    
    let imports = linguiReactImport;
    if (needsMsgImport) {
      imports += `import { msg } from '@lingui/macro';\n`;
    }
    
    // Находим место для вставки импортов (после других импортов)
    const importRegex = /^import .+ from .+;$/gm;
    const matches = [...content.matchAll(importRegex)];
    
    if (matches.length > 0) {
      const lastImportIndex = matches[matches.length - 1].index + matches[matches.length - 1][0].length;
      content = content.slice(0, lastImportIndex) + '\n' + imports + content.slice(lastImportIndex);
    } else {
      // Если нет импортов, добавляем в начало после 'use client'
      if (content.includes('"use client"') || content.includes("'use client'")) {
        content = content.replace(/['"]use client['"];?\n/, `$&\n${imports}`);
      } else {
        content = imports + content;
      }
    }
  }
  
  // 4. Добавляем хук useLingui если нужно
  if (needsHook && !hasUseLinguiImport && !content.includes('const { _ } = useLingui()')) {
    // Находим первый return в функциональном компоненте
    const functionMatch = content.match(/function\s+\w+\([^)]*\)\s*{/);
    const arrowMatch = content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{/);
    
    let insertPosition = -1;
    
    if (functionMatch) {
      insertPosition = functionMatch.index + functionMatch[0].length;
    } else if (arrowMatch) {
      insertPosition = arrowMatch.index + arrowMatch[0].length;
    }
    
    if (insertPosition > -1) {
      const beforeHook = content.slice(0, insertPosition);
      const afterHook = content.slice(insertPosition);
      content = beforeHook + '\n  const { _ } = useLingui();\n' + afterHook;
    }
  }
  
  // Сохраняем только если были изменения
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Сделано ${changes} изменений`);
    return changes;
  } else {
    console.log(`⏭️  Пропущено (нет изменений)`);
    return 0;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Пропускаем определенные директории
      if (!['node_modules', '.next', 'out', 'dist', 'build'].includes(file)) {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Главная функция
function main() {
  console.log('🚀 Начинаем автоматическую миграцию на LinguiJS...\n');
  
  const srcDir = path.join(__dirname, 'src');
  const files = walkDir(srcDir);
  
  console.log(`📂 Найдено ${files.length} файлов для обработки\n`);
  
  let totalChanges = 0;
  let processedFiles = 0;
  
  files.forEach(file => {
    const changes = processFile(file);
    if (changes > 0) {
      processedFiles++;
      totalChanges += changes;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`✨ Миграция завершена!`);
  console.log(`📊 Статистика:`);
  console.log(`   - Обработано файлов: ${processedFiles}`);
  console.log(`   - Всего изменений: ${totalChanges}`);
  console.log('='.repeat(60));
  console.log('\n⚠️  ВАЖНО: Проверьте изменения вручную!');
  console.log('   1. Запустите: npm run i18n:extract');
  console.log('   2. Проверьте: git diff');
  console.log('   3. Протестируйте приложение');
  console.log('   4. Добавьте переводы в src/locales/en/messages.po\n');
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { processFile, walkDir };


