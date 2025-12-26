#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Путь к английскому .po файлу
const poFilePath = path.join(__dirname, '..', 'src', 'locales', 'en', 'messages.po');

const content = fs.readFileSync(poFilePath, 'utf-8');
const lines = content.split('\n');

const untranslated = [];
let currentMsgid = null;
let currentMsgidLines = [];
let inMsgid = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Начало нового msgid
  if (line.startsWith('msgid ')) {
    if (currentMsgid) {
      // Сохраняем предыдущий
      currentMsgid = null;
      currentMsgidLines = [];
    }
    
    inMsgid = true;
    const msgidValue = line.substring(6).trim();
    currentMsgidLines.push(msgidValue);
    
    // Если это не пустой заголовок
    if (msgidValue !== '""') {
      currentMsgid = msgidValue;
    }
  }
  // Продолжение msgid (многострочный)
  else if (inMsgid && line.startsWith('"')) {
    currentMsgidLines.push(line.trim());
  }
  // msgstr - проверяем переведён ли
  else if (line.startsWith('msgstr ')) {
    inMsgid = false;
    
    if (currentMsgid) {
      const msgstrValue = line.substring(7).trim();
      
      // Проверяем следующую строку (может быть многострочный перевод)
      let nextLineIdx = i + 1;
      let hasTranslation = msgstrValue !== '""';
      
      // Если msgstr пустой, проверяем нет ли продолжения на следующей строке
      if (!hasTranslation && nextLineIdx < lines.length) {
        const nextLine = lines[nextLineIdx].trim();
        if (nextLine.startsWith('"') && nextLine !== '""') {
          hasTranslation = true;
        }
      }
      
      // Если перевода нет - добавляем в список
      if (!hasTranslation) {
        // Собираем полный msgid
        let fullMsgid = currentMsgidLines.join('');
        // Убираем кавычки
        fullMsgid = fullMsgid.replace(/^"|"$/g, '');
        
        untranslated.push({
          line: i + 1,
          msgid: fullMsgid
        });
      }
    }
    
    currentMsgid = null;
    currentMsgidLines = [];
  }
}

// Выводим результаты
if (untranslated.length === 0) {
  console.log('✅ Все сообщения переведены! 🎉\n');
} else {
  console.log(`❌ Найдено непереведённых сообщений: ${untranslated.length}\n`);
  console.log('Список непереведённых сообщений:\n');
  console.log('='.repeat(80));
  
  untranslated.forEach((item, index) => {
    console.log(`\n${index + 1}. Строка ${item.line}`);
    console.log(`   msgid: ${item.msgid.substring(0, 100)}${item.msgid.length > 100 ? '...' : ''}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n💡 Всего непереведённых: ${untranslated.length}`);
  console.log(`\n📝 Откройте файл: ${poFilePath}`);
  console.log(`   и найдите эти сообщения для перевода\n`);
}

process.exit(untranslated.length > 0 ? 1 : 0);

