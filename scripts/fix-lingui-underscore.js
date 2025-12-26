#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Директории для поиска
const searchDirs = ['src'];

// Расширения файлов для проверки
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalFixed = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Проверяем использование _(msg`...`) без useLingui
  const usesUnderscore = /\b_\(msg`/.test(content);
  const hasUseLingui = /const\s+{\s*_\s*}\s*=\s*useLingui\(\)/.test(content);
  const hasUseLinguiImport = content.includes('useLingui');
  const hasMsgImport = content.includes('msg');
  
  if (usesUnderscore && !hasUseLingui) {
    const lines = content.split('\n');
    let fixed = false;
    
    // 1. Добавляем импорты если нужно
    let importLineIndex = -1;
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import') && lines[i].includes('@lingui')) {
        importLineIndex = i;
        lastImportIndex = i;
      } else if (lines[i].includes('import') && !lines[i].trim().startsWith('//')) {
        lastImportIndex = i;
      }
    }
    
    // Добавляем недостающие импорты
    if (!hasUseLinguiImport || !hasMsgImport) {
      if (importLineIndex >= 0) {
        // Есть импорты из @lingui, модифицируем их
        const linguiImportLine = lines[importLineIndex];
        
        if (!hasUseLinguiImport && !linguiImportLine.includes('useLingui')) {
          // Добавляем useLingui в существующий импорт
          if (linguiImportLine.includes('from \'@lingui/react\'')) {
            lines[importLineIndex] = linguiImportLine.replace(
              /import\s+{([^}]+)}\s+from\s+'@lingui\/react'/,
              (match, imports) => {
                const importList = imports.split(',').map(s => s.trim()).filter(s => s);
                if (!importList.includes('useLingui')) {
                  importList.push('useLingui');
                }
                return `import { ${importList.join(', ')} } from '@lingui/react'`;
              }
            );
            fixed = true;
          } else {
            // Добавляем новый импорт
            lines.splice(importLineIndex + 1, 0, "import { useLingui } from '@lingui/react';");
            fixed = true;
          }
        }
        
        if (!hasMsgImport && !linguiImportLine.includes('msg')) {
          // Проверяем, есть ли импорт из @lingui/macro
          let macroImportIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('@lingui/macro')) {
              macroImportIndex = i;
              break;
            }
          }
          
          if (macroImportIndex >= 0) {
            // Добавляем msg в существующий импорт
            lines[macroImportIndex] = lines[macroImportIndex].replace(
              /import\s+{([^}]+)}\s+from\s+'@lingui\/macro'/,
              (match, imports) => {
                const importList = imports.split(',').map(s => s.trim()).filter(s => s);
                if (!importList.includes('msg')) {
                  importList.push('msg');
                }
                return `import { ${importList.join(', ')} } from '@lingui/macro'`;
              }
            );
            fixed = true;
          } else {
            // Добавляем новый импорт
            lines.splice(importLineIndex + 1, 0, "import { msg } from '@lingui/macro';");
            fixed = true;
          }
        }
      } else if (lastImportIndex >= 0) {
        // Нет импортов из @lingui, добавляем новые после последнего импорта
        const newImports = [];
        if (!hasUseLinguiImport) {
          newImports.push("import { useLingui } from '@lingui/react';");
        }
        if (!hasMsgImport) {
          newImports.push("import { msg } from '@lingui/macro';");
        }
        lines.splice(lastImportIndex + 1, 0, ...newImports);
        fixed = true;
      }
    }
    
    // 2. Добавляем const { _ } = useLingui(); в начало компонента/функции
    // Ищем первую функцию/компонент после импортов
    let functionStartIndex = -1;
    for (let i = lastImportIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      // Пропускаем пустые строки и комментарии
      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
        continue;
      }
      // Ищем объявление функции или компонента
      if (
        /^(export\s+)?(default\s+)?function\s+/.test(line) ||
        /^(export\s+)?(default\s+)?const\s+\w+\s*[:=]\s*(\([^)]*\)\s*=>|function)/.test(line) ||
        /^(export\s+)?(default\s+)?\w+\s*\([^)]*\)\s*{/.test(line)
      ) {
        functionStartIndex = i;
        break;
      }
    }
    
    if (functionStartIndex >= 0) {
      // Находим открывающую скобку функции
      let braceIndex = functionStartIndex;
      for (let i = functionStartIndex; i < Math.min(functionStartIndex + 5, lines.length); i++) {
        if (lines[i].includes('{')) {
          braceIndex = i;
          break;
        }
      }
      
      // Вставляем const { _ } = useLingui(); после открывающей скобки
      const indent = lines[braceIndex + 1] ? lines[braceIndex + 1].match(/^\s*/)[0] : '  ';
      lines.splice(braceIndex + 1, 0, `${indent}const { _ } = useLingui();`, '');
      fixed = true;
    }
    
    if (fixed) {
      content = lines.join('\n');
    }
  }
  
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
          console.log(`✓ ${relativePath}`);
          totalFixed++;
        }
      }
    }
  });
}

console.log('🔧 Добавление useLingui() в файлы с _(msg`...`)...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

console.log(`\n✅ Исправлено ${totalFixed} файлов\n`);

