# Git Commit - LinguiJS Integration

## Коммит сообщение

```
feat: Добавлена интернационализация с LinguiJS

- Установлен и настроен LinguiJS для поддержки ru/en
- Добавлен автоматический сбор текстов через CLI
- Настроено определение языка по домену (.ru → русский, .com → английский)
- Создан middleware для автоматического определения локали
- Добавлен LinguiProvider в приложение
- Создана полная документация и примеры использования

Файлы для добавления в Git:
- Конфигурация: .linguirc, babel.config.js
- Исходный код: src/utils/i18n.ts, src/middleware.ts, src/components/providers/
- Каталоги переводов: src/locales/
- Документация: LINGUI_*.md
- Примеры: src/components/examples/, src/app/auth/login/page.i18n-example.tsx
```

## Файлы для добавления

### Обязательные файлы (должны быть в Git)

```bash
# Конфигурация
git add .linguirc
git add babel.config.js
git add .gitignore
git add next.config.ts
git add package.json
git add package-lock.json

# Исходный код
git add src/utils/i18n.ts
git add src/middleware.ts
git add src/app/app.tsx
git add src/components/providers/
git add src/types/lingui.d.ts

# Каталоги переводов (.po файлы)
git add src/locales/ru/messages.po
git add src/locales/en/messages.po

# Документация
git add LINGUI_README.md
git add LINGUI_QUICK_START.md
git add LINGUI_GUIDE.md
git add LINGUI_MIGRATION.md
git add LINGUI_SETUP_COMPLETE.md
git add LINGUI_SUMMARY.md

# Примеры
git add src/components/examples/
git add src/app/auth/login/page.i18n-example.tsx
```

### НЕ добавлять в Git

```bash
# Скомпилированные файлы (генерируются автоматически)
# src/locales/**/*.js
# src/locales/**/*.js.map

# Временные файлы
# intl-errors.txt
# missing-translation-keys.txt
# unique-intl-errors.txt
# unique-missing-keys.txt

# Тестовые отчеты
# playwright-report/
# screenshots/
# test-results/
```

## Команды для коммита

```bash
# Добавить основные файлы
git add .linguirc babel.config.js .gitignore next.config.ts package.json package-lock.json

# Добавить исходный код
git add src/utils/i18n.ts src/middleware.ts src/app/app.tsx
git add src/components/providers/
git add src/types/lingui.d.ts

# Добавить переводы
git add src/locales/

# Добавить документацию
git add LINGUI_*.md

# Добавить примеры
git add src/components/examples/ src/app/auth/login/page.i18n-example.tsx

# Закоммитить
git commit -m "feat: Добавлена интернационализация с LinguiJS

- Установлен и настроен LinguiJS для поддержки ru/en
- Добавлен автоматический сбор текстов через CLI
- Настроено определение языка по домену
- Создан middleware для автоматического определения локали
- Добавлен LinguiProvider в приложение
- Создана полная документация и примеры использования"
```

## Что изменено

### Измененные файлы

1. **package.json** - добавлены зависимости и команды
2. **next.config.ts** - добавлен Webpack loader для .po файлов
3. **src/app/app.tsx** - интегрирован LinguiProvider
4. **src/utils/i18n.ts** - переписан для LinguiJS
5. **.gitignore** - исключены скомпилированные .js файлы переводов

### Новые файлы

#### Конфигурация
- `.linguirc` - конфигурация LinguiJS
- `babel.config.js` - настройка Babel для макросов

#### Исходный код
- `src/middleware.ts` - определение языка по домену
- `src/components/providers/LinguiProvider.tsx` - React Provider
- `src/types/lingui.d.ts` - TypeScript типы

#### Переводы
- `src/locales/ru/messages.po` - русские тексты
- `src/locales/en/messages.po` - английские переводы

#### Документация (7 файлов)
- `LINGUI_README.md` - краткий обзор
- `LINGUI_QUICK_START.md` - быстрая шпаргалка
- `LINGUI_GUIDE.md` - полное руководство
- `LINGUI_MIGRATION.md` - руководство по миграции
- `LINGUI_SETUP_COMPLETE.md` - описание настройки
- `LINGUI_SUMMARY.md` - резюме изменений
- `src/app/auth/login/page.i18n-example.tsx` - пример миграции страницы

#### Примеры
- `src/components/examples/ExampleI18n.tsx` - примеры использования

## После коммита

### 1. На CI/CD сервере

Добавьте в pipeline:

```yaml
# .github/workflows/build.yml (или аналогичный)
- name: Extract and compile translations
  run: |
    npm run i18n:extract
    npm run i18n:compile
    
- name: Build
  run: npm run build
```

### 2. Для команды

Разошлите ссылки на документацию:
- [LINGUI_QUICK_START.md](./LINGUI_QUICK_START.md) - для быстрого ознакомления
- [LINGUI_GUIDE.md](./LINGUI_GUIDE.md) - для детального изучения

### 3. В README проекта

Добавьте секцию:

```markdown
## 🌍 Интернационализация

Проект поддерживает русский и английский языки.

### Использование

\`\`\`tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

function MyComponent() {
  const { _ } = useLingui();
  
  return (
    <div>
      <h1><Trans>Заголовок</Trans></h1>
      <input placeholder={_(msg\`Текст\`)} />
    </div>
  );
}
\`\`\`

См. [LINGUI_README.md](./LINGUI_README.md) для подробностей.
```

## Проверка перед пушем

```bash
# 1. Проверьте, что всё компилируется
npm run i18n:compile

# 2. Проверьте, что приложение запускается
npm run build
npm run dev

# 3. Проверьте, что нет TypeScript ошибок
npm run lint

# 4. Убедитесь, что .po файлы в Git
git status | grep messages.po

# 5. Запуште
git push origin [branch-name]
```

---

**Всё готово к коммиту!** ✅


