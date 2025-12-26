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
  
  // Проверяем, есть ли 'use client' не в начале файла
  const useClientMatch = content.match(/^(?:.*\n)*(['"]use client['"];?\s*\n)/m);
  
  if (!useClientMatch) {
    return false; // Нет 'use client' или уже в начале
  }
  
  // Проверяем, что 'use client' НЕ первая строка
  if (content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"')) {
    return false; // Уже в начале
  }
  
  // Удаляем 'use client' из текущей позиции
  content = content.replace(/(['"]use client['"];?\s*\n)/g, '');
  
  // Добавляем 'use client' в самое начало
  content = "'use client';\n\n" + content;
  
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

console.log('🔧 Перемещение "use client" в начало файлов...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

console.log(`\n✅ Исправлено ${totalFixed} файлов\n`);

