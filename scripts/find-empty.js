const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'locales', 'en', 'messages.po');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

console.log('🔍 Ищу пустые переводы...\n');

let emptyTranslations = [];
let lastMsgid = '';

for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('msgid "') && !lines[i].startsWith('msgid ""') && i > 10) {
    lastMsgid = lines[i].match(/msgid "(.*)"/)?.[1];
  }
  
  if (lines[i].trim() === 'msgstr ""' && lastMsgid) {
    emptyTranslations.push({
      line: i + 1,
      msgid: lastMsgid
    });
  }
}

console.log(`Найдено ${emptyTranslations.length} пустых переводов:\n`);

emptyTranslations.forEach((item, index) => {
  console.log(`${index + 1}. Строка ${item.line}: "${item.msgid}"`);
});







