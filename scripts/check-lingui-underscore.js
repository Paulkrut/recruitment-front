#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Директории для поиска
const searchDirs = ['src'];

// Расширения файлов для проверки
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalIssues = 0;
const issuesByFile = {};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Проверяем использование _(msg`...`) без useLingui
  const usesUnderscore = /\b_\(msg`/.test(content);
  const hasUseLingui = /const\s+{\s*_\s*}\s*=\s*useLingui\(\)/.test(content);
  const hasUseLinguiImport = content.includes('useLingui');
  
  const issues = [];
  
  if (usesUnderscore && !hasUseLingui) {
    // Находим все строки с _(msg`...`)
    lines.forEach((line, index) => {
      if (/\b_\(msg`/.test(line)) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          type: 'missing_useLingui',
          hasImport: hasUseLinguiImport
        });
      }
    });
  }
  
  return issues;
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

console.log('🔍 Поиск использования _(msg`...`) без useLingui()...\n');

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
    console.log(`   Проблем: ${issues.length}`);
    console.log(`   Импорт useLingui: ${issues[0].hasImport ? '✓' : '✗'}\n`);
    
    issues.slice(0, 5).forEach((issue, idx) => {
      console.log(`   ${idx + 1}) Строка ${issue.line}:`);
      console.log(`      ${issue.code}`);
      console.log('');
    });
    
    if (issues.length > 5) {
      console.log(`   ... и ещё ${issues.length - 5} использований\n`);
    }
    
    fileIndex++;
  });

  console.log('============================================================');
  console.log(`📊 ИТОГО: ${totalIssues} использований _(msg\`...\`) без useLingui() в ${Object.keys(issuesByFile).length} файлах\n`);
  console.log('💡 Запустите npm run fix:lingui-underscore для автоматического исправления\n');
  
  process.exit(1);
}

