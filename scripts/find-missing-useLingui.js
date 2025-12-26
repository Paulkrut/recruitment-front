#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Директории для поиска
const searchDirs = ['src/app'];

// Расширения файлов для проверки
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalIssues = 0;
const issuesByFile = {};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Проверяем использование _(msg`...`) или _(msg(...))
  const usesUnderscore = /\b_\((msg`|msg\()/.test(content);
  
  if (!usesUnderscore) {
    return [];
  }
  
  // Проверяем наличие const { _ } = useLingui()
  const hasUseLinguiDeclaration = /const\s+{\s*_\s*}\s*=\s*useLingui\(\)/.test(content);
  
  if (!hasUseLinguiDeclaration) {
    return [{
      type: 'missing_useLingui_declaration',
      usesUnderscore: true
    }];
  }
  
  return [];
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
        const issues = checkFile(fullPath);
        if (issues.length > 0) {
          const relativePath = path.relative(process.cwd(), fullPath);
          issuesByFile[relativePath] = issues;
          totalIssues += issues.length;
        }
      }
    }
  });
}

console.log('🔍 Поиск файлов с _(msg`...`) без const { _ } = useLingui()...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

if (totalIssues === 0) {
  console.log('✅ Проблем не найдено! 🎉\n');
  process.exit(0);
} else {
  console.log('❌ НАЙДЕНЫ ПРОБЛЕМЫ:\n');
  console.log('============================================================\n');
  
  let fileIndex = 1;
  Object.entries(issuesByFile).forEach(([filePath, issues]) => {
    console.log(`${fileIndex}. ${filePath}`);
    fileIndex++;
  });

  console.log('\n============================================================');
  console.log(`📊 ИТОГО: ${Object.keys(issuesByFile).length} файлов требуют добавления const { _ } = useLingui()\n`);
  
  process.exit(1);
}

