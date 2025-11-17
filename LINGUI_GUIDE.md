# LinguiJS - Руководство по использованию

## 📋 Обзор

В проекте настроена интернационализация (i18n) с использованием **LinguiJS**. Система автоматически определяет язык по домену:
- `sofihr.ru` → Русский (ru)
- `sofihr.com` → Английский (en)

## 🚀 Быстрый старт

### 1. Использование переводов в компонентах

#### В React компонентах (рекомендуется)

```typescript
'use client';
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

function MyComponent() {
  const { _ } = useLingui();

  return (
    <div>
      {/* Простой текст */}
      <h1><Trans>Добро пожаловать</Trans></h1>
      
      {/* С переменными */}
      <p><Trans>Привет, {userName}!</Trans></p>
      
      {/* Для атрибутов, title, placeholder и т.д. */}
      <input 
        placeholder={_(msg`Введите имя`)} 
        title={_(msg`Обязательное поле`)}
      />
      
      {/* Множественное число */}
      <Trans>
        У вас {count} {count === 1 ? 'кандидат' : count < 5 ? 'кандидата' : 'кандидатов'}
      </Trans>
    </div>
  );
}
```

#### В серверных компонентах

```typescript
import { Trans } from '@lingui/react';

function ServerComponent() {
  return (
    <div>
      <h1><Trans>Заголовок страницы</Trans></h1>
      <p><Trans>Описание на русском языке</Trans></p>
    </div>
  );
}
```

### 2. Извлечение текстов для перевода

После того как вы обернули тексты в `<Trans>` или `msg`, выполните команду:

```bash
npm run i18n:extract
```

Эта команда **автоматически** найдёт все тексты в проекте и создаст файлы:
- `src/locales/ru/messages.po` - русские тексты (исходник)
- `src/locales/en/messages.po` - английские тексты (для перевода)

### 3. Добавление переводов

Откройте файл `src/locales/en/messages.po` и добавьте переводы:

```po
msgid "Добро пожаловать"
msgstr "Welcome"

msgid "Привет, {userName}!"
msgstr "Hello, {userName}!"

msgid "Введите имя"
msgstr "Enter name"

msgid "Кандидаты"
msgstr "Candidates"
```

**Важно:** Не переводите `{переменные}` в фигурных скобках!

### 4. Компиляция переводов

После добавления переводов скомпилируйте их:

```bash
npm run i18n:compile
```

Или используйте комбинированную команду:

```bash
npm run i18n:extract-compile
```

### 5. Проверка результата

1. Запустите dev-сервер: `npm run dev`
2. Откройте `localhost:3002` - увидите русский
3. Чтобы увидеть английский, нужно настроить hosts или использовать `.com` домен

## 📝 Примеры использования

### Простой текст

```tsx
<Trans>Список вакансий</Trans>
```

### С переменными

```tsx
const name = "Иван";
<Trans>Добро пожаловать, {name}!</Trans>
```

### В атрибутах (title, placeholder, aria-label)

```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function SearchInput() {
  const { _ } = useLingui();
  
  return (
    <input 
      placeholder={_(msg`Поиск по кандидатам`)}
      aria-label={_(msg`Поле поиска`)}
    />
  );
}
```

### Множественное число

```tsx
import { Plural } from '@lingui/react';

<Plural 
  value={candidatesCount}
  one="# кандидат"
  few="# кандидата"
  many="# кандидатов"
  other="# кандидатов"
/>
```

### Форматирование дат

```tsx
import { useLingui } from '@lingui/react';

function DateDisplay({ date }) {
  const { i18n } = useLingui();
  
  return (
    <span>
      {i18n.date(date, { 
        dateStyle: 'medium' 
      })}
    </span>
  );
}
```

### Кнопки и интерактивные элементы

```tsx
<Button>
  <Trans>Создать вакансию</Trans>
</Button>

<MenuItem>
  <Trans>Профиль</Trans>
</MenuItem>

<Chip label={<Trans>Активен</Trans>} />
```

## 🔧 Команды NPM

| Команда | Описание |
|---------|----------|
| `npm run i18n:extract` | Найти все тексты и создать/обновить .po файлы |
| `npm run i18n:compile` | Скомпилировать .po файлы в JS |
| `npm run i18n:extract-compile` | Сделать оба действия сразу |

## 🌍 Определение языка

### По домену (автоматически)

Язык определяется в `src/middleware.ts` по домену:
- `.ru`, `.рф` → русский
- `.com`, `en.` → английский

### Ручное переключение (для разработки)

В `src/utils/i18n.ts` можно временно изменить:

```typescript
export const defaultLocale: SupportedLocale = 'en'; // или 'ru'
```

## 📂 Структура файлов

```
src/
├── locales/
│   ├── ru/
│   │   ├── messages.po       # Русские тексты (исходник)
│   │   └── messages.js        # Скомпилированный каталог
│   └── en/
│       ├── messages.po       # Английские переводы
│       └── messages.js        # Скомпилированный каталог
├── utils/
│   └── i18n.ts               # Утилиты для работы с языками
├── components/
│   └── providers/
│       └── LinguiProvider.tsx # Provider для React
└── middleware.ts             # Определение языка по домену
```

## ✅ Чеклист для новой страницы

1. ✅ Оберните все тексты в `<Trans>` или `msg`
2. ✅ Запустите `npm run i18n:extract`
3. ✅ Добавьте переводы в `src/locales/en/messages.po`
4. ✅ Скомпилируйте: `npm run i18n:compile`
5. ✅ Проверьте на обоих языках

## 🚨 Частые ошибки

### ❌ Не работает перевод

**Проблема:** Текст отображается на русском даже на английском домене

**Решение:**
1. Убедитесь, что текст обернут в `<Trans>` или `msg`
2. Запустите `npm run i18n:extract`
3. Добавьте перевод в `.po` файл
4. Запустите `npm run i18n:compile`

### ❌ Переменные не работают

```tsx
// ❌ Неправильно
<Trans>{'Привет, ' + userName}</Trans>

// ✅ Правильно
<Trans>Привет, {userName}</Trans>
```

### ❌ Компонент в тексте

```tsx
// ❌ Неправильно
<Trans>Перейти на <Link>страницу</Link></Trans>

// ✅ Правильно
<Trans>
  Перейти на <Link>страницу</Link>
</Trans>
```

## 🎯 Рекомендации

1. **Всегда используйте `<Trans>`** для видимого текста
2. **Используйте `msg` + `_()`** для атрибутов
3. **Запускайте extract после каждого изменения** текстов
4. **Коммитьте .po файлы** в Git
5. **Не коммитьте .js файлы** из locales (они генерируются)

## 📚 Дополнительные ресурсы

- [Официальная документация LinguiJS](https://lingui.js.org/)
- [LinguiJS Tutorial](https://lingui.js.org/tutorials/react.html)
- [Lingui Macro API](https://lingui.js.org/ref/macro.html)

## 🔄 Workflow для разработчиков

### Добавление новой фичи

```bash
# 1. Пишите код с <Trans>
# 2. Извлеките тексты
npm run i18n:extract

# 3. Добавьте переводы в src/locales/en/messages.po
# 4. Скомпилируйте
npm run i18n:compile

# 5. Проверьте результат
npm run dev
```

### Перед коммитом

```bash
# Убедитесь, что все тексты извлечены и скомпилированы
npm run i18n:extract-compile
```

## 💡 Советы по производительности

1. **Lazy loading переводов**: Каталоги загружаются динамически по требованию
2. **Компиляция в build time**: Переводы компилируются заранее, не во время выполнения
3. **Tree shaking**: Неиспользуемые переводы не попадают в бандл

## 🎨 Пример полного компонента

```typescript
'use client';
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
import { Button, TextField } from '@mui/material';

export function VacancyForm() {
  const { _ } = useLingui();

  return (
    <form>
      <h1><Trans>Создание вакансии</Trans></h1>
      
      <TextField
        label={_(msg`Название вакансии`)}
        placeholder={_(msg`Введите название`)}
        helperText={_(msg`Обязательное поле`)}
      />
      
      <Button type="submit">
        <Trans>Сохранить</Trans>
      </Button>
    </form>
  );
}
```

---

**Готово!** 🎉 Теперь ваш сайт поддерживает два языка с автоматическим определением по домену.


