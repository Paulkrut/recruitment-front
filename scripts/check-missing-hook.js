#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const searchDirs = ['src/app'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

let totalIssues = 0;
const issuesByFile = {};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const usesUnderscore = /\b_\((msg`|msg\()/.test(content);
  
  if (!usesUnderscore) {
    return [];
  }
  
  const hasUseLinguiDeclaration = /const\s+{\s*_\s*}\s*=\s*useLingui\(\)/.test(content);
  
  if (!hasUseLinguiDeclaration) {
    return [{ type: 'missing' }];
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

console.log('Checking for missing useLingui()...\n');

searchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

if (totalIssues === 0) {
  console.log('OK: No issues found\n');
  process.exit(0);
} else {
  console.log('FOUND ISSUES:\n');
  
  let fileIndex = 1;
  Object.entries(issuesByFile).forEach(([filePath]) => {
    console.log(`${fileIndex}. ${filePath}`);
    fileIndex++;
  });

  console.log(`\nTotal: ${Object.keys(issuesByFile).length} files\n`);
  
  process.exit(1);
}

