# 📝 HTML редактор для вопросов интервью

## Проблема

Раньше текст вопросов был только **plain text**:
- ❌ Нельзя выделить важные слова жирным
- ❌ Нельзя добавить ссылки (например, на документацию)
- ❌ Нельзя создать списки для структурированных вопросов
- ✅ Переносы строк работали (через `\n`)

## Решение

Добавлен **HTML редактор** с минимальным набором форматирования:
- ✅ **Жирный** (bold)
- ✅ **Курсив** (italic)
- ✅ **Подчеркнутый** (underline)
- ✅ **Списки** (маркированные и нумерованные)
- ✅ **Ссылки** (с возможностью открытия в новой вкладке)
- ✅ **100% обратная совместимость** (старые вопросы работают как раньше)

---

## Архитектура

### 1. Редактор (QuestionFormItem)

Используется `RichTextEditor` (тот же, что для описания вакансий):

```typescript
<RichTextEditor
  value={localText}
  onChange={handleTextChange}
  placeholder="Введите вопрос..."
/>
```

**Toolbar:**
```
[B] [I] [U]  [•] [1.]  [🔗]  [🧹]
```

### 2. Хранение (БД)

```sql
interview_question.text (TEXT)

Старые вопросы (plain text):
"Расскажите о себе\nКакой у вас опыт?"

Новые вопросы (HTML):
"Расскажите о <strong>главных</strong> достижениях<br>Какой у вас опыт?"
```

**Преимущества:**
- ✅ Не нужна миграция БД
- ✅ Поле остается текстовым
- ✅ Старые вопросы продолжают работать

### 3. Отображение (QuestionText)

**Автоопределение формата:**

```typescript
function hasHtmlContent(text: string): boolean {
  return /<(strong|b|em|i|a|br|ul|ol|li|p)\b[^>]*>/i.test(text);
}

// Использование
if (hasHtmlContent(text)) {
  // Рендер как HTML
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
} else {
  // Рендер как plain text (с pre-wrap для переносов)
  return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>;
}
```

---

## Обратная совместимость

### Сценарий 1: Старый вопрос (plain text)

```
Текст в БД: "Расскажите о себе\nКакой у вас опыт?"

При загрузке в редактор:
  ↓ convertPlainTextToHtml()
  ↓ "\n" → "<br>"
  ↓ Редактор показывает: "Расскажите о себе<br>Какой у вас опыт?"

При сохранении:
  ↓ Сохраняется с <br> (теперь HTML)

При отображении в интервью:
  ↓ hasHtmlContent() = true (есть <br>)
  ↓ Рендер как HTML
  ↓ ✅ Переносы отображаются правильно
```

### Сценарий 2: Старый вопрос БЕЗ редактирования

```
Текст в БД: "Расскажите о себе\nКакой опыт?"

При отображении в интервью:
  ↓ hasHtmlContent() = false (нет HTML тегов)
  ↓ Рендер как plain text (whiteSpace: 'pre-wrap')
  ↓ ✅ Переносы через \n работают как раньше
```

### Сценарий 3: Новый вопрос с форматированием

```
Редактор: "Расскажите о **главных** достижениях"

Сохраняется: "Расскажите о <strong>главных</strong> достижениях"

При отображении:
  ↓ hasHtmlContent() = true
  ↓ Рендер как HTML
  ↓ ✅ Слово "главных" отображается жирным
```

---

## Технические детали

### Компоненты

#### 1. RichTextEditor (переиспользован)

**Путь:** `src/components/RichTextEditor.tsx`

**Toolbar:**
```typescript
const toolbarConfig = [
  ['bold', 'italic', 'underline'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['link'],
  ['clean']
];
```

**Особенности:**
- ✅ Уже имеет debounce (300ms)
- ✅ Уже имеет локальный state
- ✅ Минимальный toolbar (без заголовков, цветов, изображений)
- ✅ SSR-safe (dynamic import)

#### 2. QuestionText (новый)

**Путь:** `src/components/QuestionText.tsx`

**Функции:**
- `hasHtmlContent()` — проверка наличия HTML тегов
- `QuestionText` — компонент для рендеринга

**Props:**
```typescript
interface QuestionTextProps {
  text: string;
  variant?: 'body1' | 'body2' | 'h6';
  className?: string;
  sx?: any;
}
```

**Логика:**
```typescript
if (hasHtmlContent(text)) {
  return <Box dangerouslySetInnerHTML={{ __html: text }} />;
} else {
  return <Typography sx={{ whiteSpace: 'pre-wrap' }}>{text}</Typography>;
}
```

#### 3. QuestionFormItem (обновлен)

**Изменения:**

```typescript
// Утилиты
function hasHtmlContent(text: string): boolean { ... }
function convertPlainTextToHtml(text: string): string {
  if (hasHtmlContent(text)) return text;
  return text.replace(/\n/g, '<br>');
}

// Инициализация с конвертацией
const [localText, setLocalText] = useState(() => 
  convertPlainTextToHtml(question.text)
);

// Синхронизация
useEffect(() => {
  setLocalText(convertPlainTextToHtml(question.text));
}, [question.text]);

// Замена TextField на RichTextEditor
<RichTextEditor
  value={localText}
  onChange={handleTextChange}
  placeholder="Введите вопрос..."
/>
```

---

## Использование

### В админке (редактирование вопросов)

```typescript
// QuestionFormItem.tsx
<RichTextEditor
  value={localText}
  onChange={handleTextChange}
  placeholder={_("Введите вопрос, на который должен ответить кандидат")}
/>
```

**Toolbar доступен для:**
- Жирный (Ctrl+B / Cmd+B)
- Курсив (Ctrl+I / Cmd+I)
- Подчеркнутый (Ctrl+U / Cmd+U)
- Маркированный список
- Нумерованный список
- Ссылка
- Очистить форматирование

### В интервью (отображение для кандидата)

```typescript
// ActiveInterviewScreen.tsx
<QuestionText 
  text={m.text}
  sx={{
    wordBreak: 'break-word',
    color: m.role === 'user' ? '#2e7d32' : '#333'
  }}
/>
```

**Автоопределение:**
- HTML теги → рендер с форматированием
- Plain text → рендер с `pre-wrap`

### В HR панели (результаты кандидата)

```typescript
// candidates/[id]/page.tsx
<QuestionText text={a.question} variant="body2" sx={{ display: 'inline' }} />
```

---

## Примеры вопросов с форматированием

### Пример 1: Акцент на ключевых словах

**Редактор:**
```
Расскажите о ваших **главных** достижениях за *последний год*.
```

**HTML:**
```html
Расскажите о ваших <strong>главных</strong> достижениях за <em>последний год</em>.
```

**Отображение:**
```
Расскажите о ваших главных достижениях за последний год.
                      ^^^^^^^             ^^^^^^^^^^^^^
                      жирный              курсив
```

### Пример 2: Вопрос со списком требований

**Редактор:**
```
Опишите ваш опыт работы с:
• Python
• Django
• PostgreSQL
```

**HTML:**
```html
Опишите ваш опыт работы с:<br>
<ul>
  <li>Python</li>
  <li>Django</li>
  <li>PostgreSQL</li>
</ul>
```

### Пример 3: Вопрос со ссылкой на документацию

**Редактор:**
```
Изучите [документацию API](https://api.example.com/docs) и опишите, как реализовать аутентификацию.
```

**HTML:**
```html
Изучите <a href="https://api.example.com/docs">документацию API</a> и опишите, как реализовать аутентификацию.
```

### Пример 4: Нумерованный список шагов

**Редактор:**
```
Опишите процесс деплоя приложения:
1. Подготовка
2. Тестирование
3. Развертывание
```

**HTML:**
```html
Опишите процесс деплоя приложения:<br>
<ol>
  <li>Подготовка</li>
  <li>Тестирование</li>
  <li>Развертывание</li>
</ol>
```

---

## Стили для HTML в интервью

```css
& p {
  margin: 0;
  line-height: 1.6;
}

& strong, & b {
  font-weight: 700;
}

& em, & i {
  font-style: italic;
}

& ul, & ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 1.5em;
}

& li {
  margin-bottom: 0.25em;
}

& a {
  color: #1976d2;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
  }
}
```

---

## Обновленные файлы

### Новые файлы

- ✅ `src/components/QuestionText.tsx` — компонент для отображения с автоопределением

### Обновленные файлы

- ✅ `src/components/QuestionFormItem.tsx`
  - Добавлен импорт `RichTextEditor`
  - Добавлены утилиты `hasHtmlContent()` и `convertPlainTextToHtml()`
  - Заменен `CustomTextField` на `RichTextEditor`
  - Обновлена инициализация `localText` с конвертацией
  
- ✅ `src/app/interview/[token]/ActiveInterviewScreen.tsx`
  - Добавлен импорт `QuestionText`
  - Заменен `Typography` на `QuestionText`
  
- ✅ `src/app/(DashboardLayout)/hr/candidates/[id]/page.tsx`
  - Добавлен импорт `QuestionText`
  - Заменен текст вопроса в `AccordionSummary` на `QuestionText`

---

## Миграция существующих вопросов

### Автоматическая миграция

Миграция происходит **автоматически** при первом редактировании:

```
1. HR открывает вопрос с plain text
2. QuestionFormItem загружает текст
3. convertPlainTextToHtml() конвертирует \n → <br>
4. Редактор показывает корректные переносы
5. HR может добавить форматирование
6. При сохранении → текст теперь HTML
```

**Плюсы:**
- ✅ Не требует массовой миграции БД
- ✅ Миграция по требованию (только для редактируемых вопросов)
- ✅ Нетронутые вопросы остаются plain text

### Ручная миграция (если нужна)

Можно создать команду для массовой конвертации:

```php
// app:migrate:questions-to-html
foreach ($questions as $q) {
    if (!$this->hasHtmlTags($q->getText())) {
        $html = str_replace("\n", "<br>", $q->getText());
        $q->setText($html);
    }
}
```

**Но это не обязательно!** Автоопределение работает в обе стороны.

---

## Безопасность

### ⚠️ Текущее состояние

**HTML выводится БЕЗ sanitization:**
```typescript
dangerouslySetInnerHTML={{ __html: text }}
```

Это **критическая уязвимость XSS**!

### 🔒 Планируемая защита

В будущем будет добавлена sanitization через **DOMPurify**:

```typescript
import DOMPurify from 'isomorphic-dompurify';

const cleanHtml = DOMPurify.sanitize(text, {
  ALLOWED_TAGS: ['strong', 'b', 'em', 'i', 'a', 'br', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: { 'a': ['href', 'title', 'target'] }
});
```

**TODO:** Реализовать sanitization (задача зафиксирована на будущее)

---

## Примеры использования

### Простой вопрос с акцентом

```
Расскажите о вашем опыте работы с Django. 
Какие проекты вы реализовали?
```

↓ Добавляем форматирование

```
Расскажите о вашем опыте работы с **Django**. 
Какие *сложные* проекты вы реализовали?
```

### Вопрос со списком

```
Опишите ваши навыки работы с:
• Python
• FastAPI/Django
• PostgreSQL
• Docker
```

### Вопрос со ссылкой

```
Изучите нашу [документацию по API](https://docs.example.com) 
и опишите, как бы вы реализовали аутентификацию.
```

### Сложный вопрос с несколькими элементами

```
**Техническое задание:**

Необходимо реализовать REST API для системы управления задачами. 

Требования:
1. Аутентификация через JWT
2. CRUD операции для задач
3. Фильтрация и поиск

Изучите [спецификацию OpenAPI](https://swagger.io/specification/) 
и опишите вашу архитектуру решения.
```

---

## Преимущества

### Для HR

✅ **Богаче контент** — можно создавать более информативные вопросы  
✅ **Структурированность** — списки для перечислений  
✅ **Ссылки на ресурсы** — документация, примеры кода  
✅ **Визуальные акценты** — важные слова жирным  
✅ **Привычный интерфейс** — тот же редактор, что для вакансий

### Для кандидата

✅ **Лучшее восприятие** — структурированный текст легче читать  
✅ **Меньше путаницы** — акценты на важном  
✅ **Доступ к ресурсам** — ссылки открываются в новой вкладке  
✅ **Профессиональный вид** — современное форматирование

### Техническая

✅ **Обратная совместимость** — старые вопросы работают  
✅ **Плавная миграция** — по мере редактирования  
✅ **Нет изменений БД** — используем существующее поле  
✅ **Автоопределение** — не нужен флаг "isHtml"  
✅ **Переиспользование** — тот же редактор, что для вакансий

---

## Ограничения редактора

### ✅ Разрешено

- Bold, Italic, Underline
- Маркированные списки (bullets)
- Нумерованные списки (numbers)
- Ссылки (http/https)
- Переносы строк

### ❌ Запрещено (намеренно убрано)

- Заголовки (h1-h6) — слишком крупные
- Цвета текста/фона — не нужны
- Изображения — для этого есть attachments
- Таблицы — слишком сложно
- Выравнивание — не требуется
- Шрифты — единый стиль

---

## Тестовые сценарии

### Базовые

1. ✅ Создать вопрос с жирным текстом
2. ✅ Создать вопрос с курсивом
3. ✅ Создать вопрос со списком
4. ✅ Создать вопрос со ссылкой
5. ✅ Сохранить и проверить в интервью
6. ✅ Проверить корректность отображения

### Обратная совместимость

7. ✅ Открыть старый вопрос с `\n`
8. ✅ Проверить отображение в интервью (должно работать как раньше)
9. ✅ Отредактировать старый вопрос
10. ✅ Проверить, что переносы сохранились (конвертированы в `<br>`)
11. ✅ Добавить форматирование
12. ✅ Сохранить и проверить в интервью

### Edge cases

13. ✅ Вопрос с текстом "2<3" или "x>y" (ложное определение HTML)
14. ✅ Вопрос с очень длинным текстом
15. ✅ Вопрос с emoji 😀🎉
16. ✅ Вопрос с кириллицей и форматированием

---

## Производительность

### RichTextEditor уже оптимизирован:

```typescript
// Debounce 300ms
const handleChange = useCallback((content: string) => {
  setLocalValue(content);
  
  setTimeout(() => {
    onChange(content);
  }, 300);
}, [onChange]);

// React.memo
const RichTextEditor = React.memo(({ ... }) => { ... });
```

### QuestionText — легковесный:

- Простая проверка регуляркой
- Нет тяжелых библиотек
- Мгновенный рендер

---

## Будущие улучшения

### 1. Code syntax highlighting

Для технических вопросов:

```
Какой будет output этого кода?

```python
def factorial(n):
    return 1 if n <= 1 else n * factorial(n-1)
```
```

### 2. Inline изображения (опционально)

Если нужно встроить схему/диаграмму прямо в текст вопроса.

### 3. Математические формулы (KaTeX)

Для вопросов с формулами:
```
Вычислите интеграл: ∫x²dx
```

### 4. Collapsible секции

Для длинных вопросов с контекстом:
```
<details>
  <summary>Контекст задачи</summary>
  ... длинное описание ...
</details>
```

---

## Дата реализации

**2026-02-05**

## Связанные фичи

- RichTextEditor для описания вакансий
- Attachments для вопросов (файлы, видео, аудио)
- QuestionFormItem refactoring
