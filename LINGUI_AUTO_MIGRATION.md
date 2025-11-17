# Автоматическая миграция на LinguiJS

## ⚠️ ВАЖНО: Сделайте backup перед запуском!

```bash
git add .
git commit -m "backup before auto migration"
```

## 🤖 Автоматический скрипт миграции

Создан скрипт `scripts/migrate-to-lingui.js`, который:

1. ✅ Находит весь русский текст в `.tsx` и `.jsx` файлах
2. ✅ Оборачивает JSX текст в `<Trans>`
3. ✅ Оборачивает атрибуты (label, placeholder и т.д.) в `_(msg\`\`)`
4. ✅ Добавляет необходимые импорты
5. ✅ Добавляет хук `useLingui()` где нужно

## 🚀 Запуск миграции

### Шаг 1: Backup

```bash
# Закоммитьте текущие изменения
git add .
git commit -m "backup: before auto migration to LinguiJS"
```

### Шаг 2: Запуск скрипта

```bash
# Запустите автоматическую миграцию
node scripts/migrate-to-lingui.js
```

Скрипт обработает все файлы в `src/` и выведет статистику:

```
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

### Шаг 3: Проверка изменений

```bash
# Посмотрите, что изменилось
git diff

# Или используйте VS Code Git UI
```

### Шаг 4: Извлечение текстов

```bash
# Автоматически соберите все тексты
npm run i18n:extract
```

Это создаст файлы с русскими текстами в `src/locales/ru/messages.po` и `src/locales/en/messages.po`

### Шаг 5: Компиляция

```bash
# Скомпилируйте переводы
npm run i18n:compile
```

### Шаг 6: Тестирование

```bash
# Запустите приложение
npm run dev
```

Проверьте основные страницы на ошибки.

## 🎯 Что делает скрипт

### ДО миграции:

```tsx
export function VacancyCard() {
  return (
    <Card>
      <Typography>Список вакансий</Typography>
      <TextField 
        label="Название"
        placeholder="Введите название"
      />
      <Button>Создать</Button>
    </Card>
  );
}
```

### ПОСЛЕ миграции:

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

export function VacancyCard() {
  const { _ } = useLingui();
  
  return (
    <Card>
      <Typography><Trans>Список вакансий</Trans></Typography>
      <TextField 
        label={_(msg`Название`)}
        placeholder={_(msg`Введите название`)}
      />
      <Button><Trans>Создать</Trans></Button>
    </Card>
  );
}
```

## 🔍 Что НЕ переводится (автоматически пропускается)

- Технические строки (import, export, const, etc.)
- Названия классов CSS
- Пути к файлам
- URL и ссылки
- Console.log
- Названия функций и переменных

## ⚠️ Ограничения автоматической миграции

### 1. Сложные выражения

Скрипт **НЕ** обработает:

```tsx
// Условный рендеринг
{isActive ? "Активен" : "Неактивен"}

// Шаблонные строки
{`Найдено ${count} вакансий`}

// Массивы
const tabs = ["Все", "Активные", "Архив"];
```

Эти случаи нужно мигрировать **вручную**:

```tsx
// Правильно
{isActive ? <Trans>Активен</Trans> : <Trans>Неактивен</Trans>}

<Trans>Найдено {count} вакансий</Trans>

const { _ } = useLingui();
const tabs = [_(msg`Все`), _(msg`Активные`), _(msg`Архив`)];
```

### 2. Динамический текст

```tsx
// Было
const message = "Вакансия создана";
toast.success(message);

// Нужно вручную
const { _ } = useLingui();
const message = _(msg`Вакансия создана`);
toast.success(message);
```

### 3. Объекты с текстами

```tsx
// Было
const columns = [
  { field: 'name', headerName: 'Имя' },
];

// Нужно вручную
const { _ } = useLingui();
const columns = [
  { field: 'name', headerName: _(msg`Имя`) },
];
```

## 🛠 Ручная доработка после скрипта

После автоматической миграции нужно:

### 1. Проверить импорты

Убедитесь, что импорты добавлены корректно:

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
```

### 2. Проверить хуки

В каждом компоненте, где используется `_(msg)`, должен быть хук:

```tsx
const { _ } = useLingui();
```

### 3. Найти пропущенные тексты

```bash
# Поиск строк с русским текстом
grep -r "[А-Яа-я]" src/ --include="*.tsx" --include="*.jsx"
```

### 4. Проверить условный рендеринг

Найдите в коде:

```bash
# Поиск тернарных операторов с русским текстом
grep -r "? *['\"][А-Яа-я]" src/
```

## 🔄 Пошаговая миграция (альтернатива)

Если автоматическая миграция кажется рискованной, мигрируйте постепенно:

### Неделя 1: Критические страницы
```bash
# Мигрируйте только auth
node scripts/migrate-to-lingui.js src/app/auth/
```

### Неделя 2: HR функционал
```bash
node scripts/migrate-to-lingui.js src/app/(DashboardLayout)/hr/vacancies/
node scripts/migrate-to-lingui.js src/app/(DashboardLayout)/hr/candidates/
```

### Неделя 3: Остальное
```bash
node scripts/migrate-to-lingui.js src/app/(DashboardLayout)/hr/
```

## 📊 Мониторинг прогресса

### Проверка покрытия переводами

```bash
# Сколько текстов найдено
npm run i18n:extract

# Посмотрите src/locales/ru/messages.po
```

### Поиск непереведенных текстов

```bash
# Найти русский текст НЕ в Trans или msg
grep -rn "[А-Яа-я]" src/ | grep -v "Trans" | grep -v "msg\`"
```

## 🐛 Исправление ошибок после миграции

### Ошибка: "_ is not defined"

**Проблема:** Отсутствует хук `useLingui()`

**Решение:**
```tsx
const { _ } = useLingui();
```

### Ошибка: "Trans is not defined"

**Проблема:** Отсутствует импорт

**Решение:**
```tsx
import { Trans } from '@lingui/react';
```

### Ошибка: "Unexpected token"

**Проблема:** Неправильно обернут текст

**Решение:** Проверьте синтаксис вручную

## 🎉 После успешной миграции

### 1. Извлеките все тексты

```bash
npm run i18n:extract
```

### 2. Откройте файл переводов

```bash
# Посмотрите, что собралось
code src/locales/en/messages.po
```

Вы увидите:

```po
msgid "Создать вакансию"
msgstr ""

msgid "Список кандидатов"
msgstr ""

msgid "Введите название"
msgstr ""
```

### 3. Добавьте переводы

```po
msgid "Создать вакансию"
msgstr "Create Vacancy"

msgid "Список кандидатов"
msgstr "Candidates List"

msgid "Введите название"
msgstr "Enter name"
```

### 4. Скомпилируйте

```bash
npm run i18n:compile
```

### 5. Проверьте

Откройте сайт на разных доменах и проверьте переводы.

## 💡 Советы

1. **Делайте backup перед каждым запуском**
2. **Тестируйте после каждой миграции**
3. **Коммитьте часто**
4. **Используйте git diff для проверки**
5. **Не мигрируйте всё сразу** - делайте постепенно

## 🆘 Откат изменений

Если что-то пошло не так:

```bash
# Откатите все изменения
git reset --hard HEAD

# Или откатите конкретный файл
git checkout -- src/path/to/file.tsx
```

---

**Начните с малого и двигайтесь постепенно!** 🚀


