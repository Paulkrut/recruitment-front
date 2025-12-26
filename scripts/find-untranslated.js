const fs = require('fs');
const path = require('path');

const CYRILLIC_PATTERN = /[а-яёА-ЯЁ]+/;
const EXCLUDE_DIRS = ['node_modules', '.next', 'out', 'dist', 'build', '.git', 'locales'];
const EXCLUDE_FILES = ['.md', '.json', '.po', '.pot'];

// Паттерны для игнорирования уже обёрнутого текста
const WRAPPED_PATTERNS = [
  /<Trans[^>]*>[\s\S]*?<\/Trans>/g,  // <Trans>...</Trans>
  /_\s*\(\s*msg`[^`]*`\s*\)/g,       // _(msg`...`)
  /t\s*\(\s*['"`][^'"`]*['"`]\s*\)/g, // t('...') или t("...") или t(`...`)
];

function hasUnwrappedCyrillic(content) {
  // Удаляем все обёрнутые фрагменты
  let cleanContent = content;
  
  for (const pattern of WRAPPED_PATTERNS) {
    cleanContent = cleanContent.replace(pattern, '');
  }
  
  // Удаляем комментарии
  cleanContent = cleanContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // Многострочные комментарии
    .replace(/\/\/.*/g, '');          // Однострочные комментарии
  
  // Проверяем наличие кириллицы
  return CYRILLIC_PATTERN.test(cleanContent);
}

function findCyrillicFragments(content) {
  const lines = content.split('\n');
  const fragments = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Пропускаем комментарии
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('{/*') || trimmed.includes('*/}')) {
      return;
    }
    
    // Пропускаем строки с Trans или _(msg
    if (line.includes('<Trans') || line.includes('_(msg') || line.includes("t('") || line.includes('t("') || line.includes('t(`')) {
      return;
    }
    
    // Пропускаем console.log, console.error и т.д.
    if (trimmed.startsWith('console.')) {
      return;
    }
    
    // Пропускаем технические комментарии (// ..., /* ... */, {/* ... */})
    if (/^\s*(\/\/|\/\*|\*|{\/\*)/.test(line)) {
      return;
    }
    
    // Пропускаем строки только с числами и техническими символами
    const withoutCyrillic = line.replace(/[а-яёА-ЯЁ\s]/g, '');
    if (withoutCyrillic.length > line.length * 0.8) { // 80%+ нерусских символов - технический текст
      return;
    }
    
    // Ищем кириллицу
    if (CYRILLIC_PATTERN.test(line)) {
      fragments.push({
        line: index + 1,
        content: line.trim().substring(0, 120) // Увеличен лимит для лучшей читаемости
      });
    }
  });
  
  return fragments;
}

function scanDirectory(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath, results);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      
      // Проверяем только исходники
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext) && 
          !EXCLUDE_FILES.some(excExt => entry.name.endsWith(excExt))) {
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        if (hasUnwrappedCyrillic(content)) {
          const fragments = findCyrillicFragments(content);
          
          if (fragments.length > 0) {
            results.push({
              file: path.relative(process.cwd(), fullPath),
              fragments
            });
          }
        }
      }
    }
  }
  
  return results;
}

console.log('🔍 Поиск непереведённых текстов...\n');

const srcDir = path.join(process.cwd(), 'src');
const results = scanDirectory(srcDir);

if (results.length === 0) {
  console.log('✅ Все тексты обёрнуты в Trans/_(msg) компоненты!\n');
} else {
  console.log(`❌ Найдено файлов с непереведёнными текстами: ${results.length}\n`);
  
  results.forEach(({ file, fragments }) => {
    console.log(`📄 ${file}`);
    fragments.forEach(({ line, content }) => {
      console.log(`   Строка ${line}: ${content}`);
    });
    console.log('');
  });
  
  console.log(`\n📊 Итого: ${results.length} файлов, ${results.reduce((sum, r) => sum + r.fragments.length, 0)} фрагментов\n`);
}

process.exit(results.length > 0 ? 1 : 0);

