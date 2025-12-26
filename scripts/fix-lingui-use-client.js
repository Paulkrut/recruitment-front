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
  
  // Проверяем использование useLingui без 'use client'
  const usesLingui = content.includes('useLingui()');
  const hasUseClient = content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"');
  const hasI18nProvider = content.includes('I18nProvider') || content.includes('<I18nProvider');
  
  if (usesLingui && !hasUseClient && !hasI18nProvider) {
    // Добавляем 'use client' в самое начало
    content = "'use client';\n\n" + content;
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
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

console.log('🔧 Добавление "use client" в файлы с useLingui()...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

console.log(`\n✅ Исправлено ${totalFixed} файлов\n`);

