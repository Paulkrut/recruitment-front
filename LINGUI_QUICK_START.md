# LinguiJS - Быстрая шпаргалка

## 🎯 Установка завершена ✅

LinguiJS настроен и готов к использованию!

## 🚀 Как использовать

### 1. В компонентах

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

// Для текста
<Trans>Создать вакансию</Trans>

// Для атрибутов
const { _ } = useLingui();
placeholder={_(msg`Введите название`)}
```

### 2. После добавления текстов

```bash
# Извлечь все тексты из проекта
npm run i18n:extract

# Добавить переводы в src/locales/en/messages.po

# Скомпилировать
npm run i18n:compile
```

### 3. Определение языка

Автоматически по домену:
- `*.ru` → Русский
- `*.com` → Английский

## 📝 Пример

```tsx
'use client';
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

export function VacancyCard() {
  const { _ } = useLingui();
  
  return (
    <div>
      <h2><Trans>Вакансии</Trans></h2>
      <input 
        placeholder={_(msg`Поиск`)} 
      />
      <button>
        <Trans>Добавить</Trans>
      </button>
    </div>
  );
}
```

## 📚 Подробнее

Смотрите полное руководство в `LINGUI_GUIDE.md`

---

**Готово!** Начните оборачивать тексты в `<Trans>` и запустите `npm run i18n:extract` 🎉


