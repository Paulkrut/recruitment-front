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
  
  // Проверяем использование useLingui без 'use client'
  const usesLingui = content.includes('useLingui()');
  const hasUseClient = content.trim().startsWith("'use client'") || content.trim().startsWith('"use client"');
  const hasI18nProvider = content.includes('I18nProvider') || content.includes('<I18nProvider');
  
  const issues = [];
  
  if (usesLingui && !hasUseClient && !hasI18nProvider) {
    // Находим все строки с useLingui
    lines.forEach((line, index) => {
      if (line.includes('useLingui()')) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          type: 'missing_use_client'
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

console.log('🔍 Поиск файлов с useLingui() без I18nProvider...\n');

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
    console.log(`   Проблем: ${issues.length}\n`);
    
    issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}) Строка ${issue.line}: ${issue.type}`);
      console.log(`      ${issue.code}`);
      console.log('');
    });
    
    fileIndex++;
  });

  console.log('============================================================');
  console.log(`📊 ИТОГО: ${totalIssues} использований useLingui() без 'use client' в ${Object.keys(issuesByFile).length} файлах\n`);
  console.log('💡 Запустите npm run fix:lingui-use-client для автоматического исправления\n');
  
  process.exit(1);
}

