#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Путь к английскому .po файлу
const poFilePath = path.join(__dirname, '..', 'src', 'locales', 'en', 'messages.po');
const outputPath = path.join(__dirname, '..', 'untranslated-to-translate.txt');

const content = fs.readFileSync(poFilePath, 'utf-8');
const lines = content.split('\n');

const untranslated = [];
let currentMsgid = null;
let currentMsgidFull = '';
let lineNumber = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Начало msgid
  if (line.startsWith('msgid ')) {
    currentMsgid = line.substring(6).trim();
    currentMsgidFull = currentMsgid;
    lineNumber = i + 1;
  }
  // Продолжение msgid (многострочный)
  else if (currentMsgid && line.trim().startsWith('"') && !line.startsWith('msgstr')) {
    currentMsgidFull += '\n' + line.trim();
  }
  // msgstr - проверяем переведён ли
  else if (line.startsWith('msgstr ')) {
    if (currentMsgid && currentMsgid !== '""') {
      const msgstrValue = line.substring(7).trim();
      
      // Проверяем есть ли перевод
      let hasTranslation = msgstrValue !== '""';
      
      // Если msgstr пустой, проверяем следующую строку
      if (!hasTranslation && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.startsWith('"') && nextLine !== '""') {
          hasTranslation = true;
        }
      }
      
      // Если перевода нет - добавляем
      if (!hasTranslation) {
        // Удаляем кавычки и \n из msgid
        let cleanMsgid = currentMsgidFull
          .replace(/^"|"$/gm, '')
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .trim();
        
        if (cleanMsgid) {
          untranslated.push({
            line: lineNumber,
            msgid: cleanMsgid
          });
        }
      }
    }
    
    currentMsgid = null;
    currentMsgidFull = '';
  }
}

// Сохраняем в файл для перевода
let output = `# Непереведённые сообщения (${untranslated.length})\n`;
output += `# Скопируйте текст после "===" в переводчик\n`;
output += `# После перевода замените текст между === и вставьте обратно\n\n`;
output += '='.repeat(80) + '\n';

untranslated.forEach((item, index) => {
  output += `${item.msgid}\n`;
  output += '---\n';
});

output += '='.repeat(80) + '\n';

fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`\n✅ Найдено непереведённых сообщений: ${untranslated.length}`);
console.log(`📝 Сохранено в: ${outputPath}\n`);
console.log(`Следующие шаги:`);
console.log(`1. Откройте файл: ${outputPath}`);
console.log(`2. Скопируйте весь текст после первой линии ===`);
console.log(`3. Вставьте в переводчик (например, DeepL или ChatGPT)`);
console.log(`4. Переведите все тексты`);
console.log(`5. Запустите: node scripts/apply-translations.js\n`);

