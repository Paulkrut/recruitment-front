#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Директории для поиска
const searchDirs = ['src/app'];

let totalIssues = 0;
const issuesByFile = {};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Проверяем наличие 'use client' и export metadata в одном файле
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
  const hasExportMetadata = /export\s+(const\s+)?metadata/.test(content);
  
  const issues = [];
  
  if (hasUseClient && hasExportMetadata) {
    lines.forEach((line, index) => {
      if (/export\s+(const\s+)?metadata/.test(line)) {
        issues.push({
          line: index + 1,
          code: line.trim(),
          type: 'metadata_with_use_client'
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
    } else if (entry.isFile() && entry.name === 'layout.tsx') {
      const issues = checkFile(fullPath);
      if (issues.length > 0) {
        const relativePath = path.relative(process.cwd(), fullPath);
        issuesByFile[relativePath] = issues;
        totalIssues += issues.length;
      }
    }
  });
}

console.log('🔍 Поиск layout.tsx с "use client" и "export metadata"...\n');

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
  console.log(`📊 ИТОГО: ${totalIssues} конфликтов "use client" + "metadata" в ${Object.keys(issuesByFile).length} файлах\n`);
  console.log('💡 Используйте generateMetadata() вместо export const metadata для динамических переводов\n');
  
  process.exit(1);
}

