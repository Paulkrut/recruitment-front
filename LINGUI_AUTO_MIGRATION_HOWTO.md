# 🤖 Автоматическая миграция на LinguiJS - Инструкция

## ✅ Что готово

1. ✅ Установлен и настроен LinguiJS
2. ✅ Создан скрипт автоматической миграции
3. ✅ Создан скрипт для отслеживания прогресса
4. ✅ Добавлены команды в package.json

## 🚀 Быстрый старт

### Вариант 1: Полная автоматическая миграция

```bash
# ⚠️ ОБЯЗАТЕЛЬНО сделайте backup!
git add .
git commit -m "backup: before auto migration"

# Запустите автоматическую миграцию ВСЕХ файлов
npm run migrate:auto

# Извлеките все тексты
npm run i18n:extract-compile

# Проверьте результат
npm run dev
```

### Вариант 2: Проверка перед миграцией

```bash
# Сначала проверьте, что нужно мигрировать
npm run migrate:check

# Посмотрите отчет
# Вы увидите ТОП-10 файлов с наибольшим количеством текстов

# Запустите миграцию
npm run migrate:auto

# Извлеките тексты
npm run i18n:extract-compile
```

## 📊 Отслеживание прогресса

### Команда для проверки прогресса

```bash
npm run migrate:check
```

Вывод:

```
🔍 Поиск русского текста в проекте...

📊 ОБЩАЯ СТАТИСТИКА:
============================================================
Всего файлов: 150
Файлов с русским текстом: 87
Всего русских текстов: 1243
  ✅ Обернуто (<Trans>/msg): 450
  ❌ Не обернуто: 793

📈 Прогресс миграции: 36.2%
============================================================

🎯 ТОП-10 ФАЙЛОВ ДЛЯ МИГРАЦИИ:
============================================================

1. src/app/(DashboardLayout)/hr/vacancies/page.tsx
   Не обернуто: 45 из 50 (90%)
   Примеры:
     Line 123: <Typography>Список вакансий</Typography>
     Line 145: <Button>Создать вакансию</Button>
     Line 178: placeholder="Поиск по названию"

2. src/app/(DashboardLayout)/hr/candidates/page.tsx
   Не обернуто: 38 из 42 (90%)
   ...
```

## 🎯 Стратегии миграции

### Стратегия 1: Всё сразу (быстро, но рискованно)

```bash
# Backup
git add . && git commit -m "backup before full migration"

# Миграция
npm run migrate:auto

# Проверка и компиляция
npm run migrate:check
npm run i18n:extract-compile

# Тестирование
npm run dev
```

**Плюсы:**
- ✅ Быстро (10-15 минут)
- ✅ Сразу весь проект

**Минусы:**
- ❌ Может быть много ошибок
- ❌ Сложно найти проблемы
- ❌ Нужна тщательная проверка

### Стратегия 2: Постепенная миграция (рекомендуется)

#### Неделя 1: Авторизация

```bash
# Мигрируйте только auth
npm run migrate:auto -- src/app/auth/

# Проверьте
git diff src/app/auth/

# Извлеките тексты
npm run i18n:extract-compile

# Протестируйте
npm run dev

# Закоммитьте
git add src/app/auth/
git commit -m "feat: migrate auth pages to LinguiJS"
```

#### Неделя 2: Вакансии

```bash
npm run migrate:auto -- src/app/(DashboardLayout)/hr/vacancies/
git diff
npm run i18n:extract-compile
npm run dev
git add .
git commit -m "feat: migrate vacancies to LinguiJS"
```

#### Неделя 3: Кандидаты

```bash
npm run migrate:auto -- src/app/(DashboardLayout)/hr/candidates/
git diff
npm run i18n:extract-compile
npm run dev
git add .
git commit -m "feat: migrate candidates to LinguiJS"
```

#### Неделя 4: Остальное

```bash
npm run migrate:auto
git diff
npm run i18n:extract-compile
npm run dev
git add .
git commit -m "feat: complete migration to LinguiJS"
```

**Плюсы:**
- ✅ Контролируемый процесс
- ✅ Легче найти ошибки
- ✅ Можно тестировать по частям

**Минусы:**
- ❌ Дольше (4 недели)

### Стратегия 3: По приоритету (оптимальная)

```bash
# 1. Проверьте что требует миграции
npm run migrate:check

# 2. Мигрируйте ТОП-10 файлов вручную или автоматически
# Посмотрите в отчете migration-report.json

# 3. Прогресс: запускайте migrate:check после каждого файла
```

## 📝 Пример использования

### Шаг 1: Проверка

```bash
$ npm run migrate:check

📊 ОБЩАЯ СТАТИСТИКА:
Всего русских текстов: 1243
  ✅ Обернуто: 0
  ❌ Не обернуто: 1243

📈 Прогресс миграции: 0.0%
```

### Шаг 2: Backup

```bash
$ git add .
$ git commit -m "backup: before LinguiJS migration"
```

### Шаг 3: Миграция

```bash
$ npm run migrate:auto

🚀 Начинаем автоматическую миграцию на LinguiJS...

📂 Найдено 150 файлов для обработки

📝 Обработка: src/app/auth/login/page.tsx
✅ Сделано 12 изменений

📝 Обработка: src/app/(DashboardLayout)/hr/vacancies/page.tsx
✅ Сделано 45 изменений

...

✨ Миграция завершена!
📊 Статистика:
   - Обработано файлов: 87
   - Всего изменений: 1243
```

### Шаг 4: Проверка после миграции

```bash
$ npm run migrate:check

📊 ОБЩАЯ СТАТИСТИКА:
Всего русских текстов: 1243
  ✅ Обернуто: 1150
  ❌ Не обернуто: 93

📈 Прогресс миграции: 92.5%

🎯 ТОП-10 ФАЙЛОВ ДЛЯ МИГРАЦИИ:
Осталось 5 файлов с необработанными текстами
```

### Шаг 5: Извлечение текстов

```bash
$ npm run i18n:extract

Extracting messages from source files…
Catalog statistics for src/locales/ru/messages.po:
┌─────────────┬─────────────┐
│ Total count │ 1150        │
├─────────────┼─────────────┤
│ Missing     │ 1150        │
└─────────────┴─────────────┘

Done!
```

### Шаг 6: Компиляция

```bash
$ npm run i18n:compile

Compiling message catalogs…
Done in 14s
```

### Шаг 7: Тестирование

```bash
$ npm run dev

# Откройте http://localhost:3002
# Проверьте основные страницы
```

## 🐛 Устранение проблем

### Проблема: Слишком много ошибок после миграции

**Решение:**

```bash
# Откатите изменения
git reset --hard HEAD

# Мигрируйте по одному файлу
node scripts/migrate-to-lingui.js src/app/auth/login/page.tsx

# Проверьте
git diff src/app/auth/login/page.tsx

# Исправьте вручную если нужно

# Продолжайте
```

### Проблема: Скрипт обернул технические строки

**Решение:**

Откройте `scripts/migrate-to-lingui.js` и добавьте паттерн в `skipPatterns`:

```javascript
const skipPatterns = [
  /console\./,
  /className=/,
  // Добавьте свои паттерны
  /yourPattern/,
];
```

### Проблема: Не все тексты обернуты

Это нормально! Автоматический скрипт обрабатывает ~80-90% текстов.

Оставшиеся 10-20% нужно мигрировать вручную:

```bash
# Найдите необработанные тексты
npm run migrate:check

# Посмотрите migration-report.json

# Мигрируйте вручную по инструкции из LINGUI_MIGRATION.md
```

## 📈 Отслеживание прогресса в CI/CD

Добавьте в ваш CI pipeline:

```yaml
# .github/workflows/i18n-check.yml
name: I18n Coverage

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run migrate:check
      - run: |
          COVERAGE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('migration-report.json')).wrapped / JSON.parse(require('fs').readFileSync('migration-report.json')).totalRussianTexts * 100)")
          echo "I18n Coverage: $COVERAGE%"
          if [ $(echo "$COVERAGE < 90" | bc) -eq 1 ]; then
            echo "Coverage is below 90%"
            exit 1
          fi
```

## ✨ После полной миграции

### 1. Добавьте английские переводы

```bash
# Откройте файл переводов
code src/locales/en/messages.po

# Добавьте переводы для всех msgid
```

### 2. Настройте автоматическую компиляцию

В `package.json`:

```json
{
  "scripts": {
    "predev": "npm run i18n:compile",
    "prebuild": "npm run i18n:compile"
  }
}
```

### 3. Обновите документацию

Добавьте в README:

```markdown
## Переводы

После изменения текстов:

\`\`\`bash
npm run i18n:extract-compile
\`\`\`
```

## 🎉 Поздравляем!

Если вы выполнили все шаги, ваш проект теперь полностью переведен на LinguiJS!

**Следующие шаги:**

1. ✅ Добавьте английские переводы
2. ✅ Протестируйте на обоих доменах
3. ✅ Обучите команду работе с LinguiJS
4. ✅ Настройте CI/CD

---

**Удачи с миграцией!** 🚀

Если возникнут вопросы, смотрите:
- `LINGUI_GUIDE.md` - полное руководство
- `LINGUI_MIGRATION.md` - ручная миграция
- `LINGUI_AUTO_MIGRATION.md` - этот файл


