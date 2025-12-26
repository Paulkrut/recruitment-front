#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const searchDirs = ['src/app'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Проверяем использование _(msg`...`)
  const usesUnderscore = /\b_\((msg`|msg\()/.test(content);
  if (!usesUnderscore) {
    return false;
  }
  
  // Проверяем наличие const { _ } = useLingui()
  const hasUseLinguiMatch = content.match(/const\s+{\s*_\s*}\s*=\s*useLingui\(\);?/);
  if (!hasUseLinguiMatch) {
    return false;
  }
  
  const useLinguiLine = hasUseLinguiMatch[0];
  
  // Находим позицию useLingui()
  const useLinguiIndex = content.indexOf(useLinguiLine);
  
  // Находим первое использование _(msg`...`) до useLingui()
  const beforeUseLingui = content.substring(0, useLinguiIndex);
  const firstUseMatch = beforeUseLingui.match(/\b_\((msg`|msg\()/);
  
  if (!firstUseMatch) {
    // useLingui() уже в правильном месте
    return false;
  }
  
  // Нужно переместить useLingui() выше
  // Удаляем текущую строку с useLingui()
  const lines = content.split('\n');
  let useLinguiLineIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(useLinguiLine)) {
      useLinguiLineIndex = i;
      break;
    }
  }
  
  if (useLinguiLineIndex === -1) {
    return false;
  }
  
  // Удаляем строку с useLingui()
  const removedLine = lines.splice(useLinguiLineIndex, 1)[0];
  const indent = removedLine.match(/^\s*/)[0];
  
  // Ищем, куда вставить: после объявления хуков/переменных в начале компонента
  // Обычно это после useRouter, useParams, useSearchParams и т.д.
  let insertIndex = -1;
  let inComponent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Начало компонента/функции
    if (line.includes('function ') || line.includes('= ({') || line.includes(': React.FC')) {
      inComponent = true;
      continue;
    }
    
    if (inComponent) {
      // Ищем первую строку, которая использует _ или не является хуком/const
      if (line.includes('_(msg') || 
          line.includes('const ') && !line.includes('use') ||
          line.includes('let ') ||
          line.includes('if (') ||
          line === '') {
        insertIndex = i;
        break;
      }
      
      // После всех use* хуков
      if (line.startsWith('use') || line.includes('= use')) {
        insertIndex = i + 1;
      }
    }
  }
  
  if (insertIndex === -1) {
    // Не нашли подходящее место, возвращаем как было
    lines.splice(useLinguiLineIndex, 0, removedLine);
    return false;
  }
  
  // Вставляем useLingui() в начало компонента
  lines.splice(insertIndex, 0, `${indent}const { _ } = useLingui();`);
  
  content = lines.join('\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.next', 'build', 'dist', '.git'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        if (fixFile(fullPath)) {
          const relativePath = path.relative(process.cwd(), fullPath);
          console.log(`Fixed: ${relativePath}`);
          totalFixed++;
        }
      }
    }
  });
}

console.log('Fixing useLingui() order...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

console.log(`\nTotal fixed: ${totalFixed} files\n`);

